import React, { useState } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'sales' | 'reviews'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBulkAddProducts: (products: Omit<Product, 'id' | 'sales' | 'reviews'>[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onBulkAddProducts
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Lips',
    subcategory: '',
    price: 0,
    description: '',
    image: '',
    benefits: ['']
  });

  const [bulkJson, setBulkJson] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Lips',
      subcategory: '',
      price: 0,
      description: '',
      image: '',
      benefits: ['']
    });
    setEditingProduct(null);
    setUploading(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...formData } as Product);
    } else {
      onAddProduct(formData as Omit<Product, 'id' | 'sales' | 'reviews'>);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return; // User cancelled selection
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist')) {
            throw new Error('Storage bucket "product-images" missing. Please create a public bucket named "product-images" in your Supabase dashboard.');
        } else if (uploadError.message.includes('security policy')) {
            throw new Error('Permission denied. Please configure RLS policies for "product-images" bucket to allow uploads.');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: data.publicUrl });
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      // Reset input value to allow selecting the same file again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleBulkSave = () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (Array.isArray(parsed)) {
        onBulkAddProducts(parsed);
        setIsBulkModalOpen(false);
        setBulkJson('');
        alert(`Successfully imported ${parsed.length} products.`);
      } else {
        alert("Invalid JSON: Root must be an array.");
      }
    } catch (e) {
      alert("Invalid JSON format.");
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...(formData.benefits || [])];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefitField = () => {
    setFormData({ ...formData, benefits: [...(formData.benefits || []), ''] });
  };

  const removeBenefitField = (index: number) => {
    const newBenefits = [...(formData.benefits || [])];
    newBenefits.splice(index, 1);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors flex items-center"
          >
            <i className="fa-solid fa-file-import mr-2"></i> Bulk Add
          </button>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700 transition-colors flex items-center shadow-md"
          >
            <i className="fa-solid fa-plus mr-2"></i> New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Products</div>
          <div className="text-3xl font-bold text-stone-900">{products.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Categories</div>
          <div className="text-3xl font-bold text-stone-900">{[...new Set(products.map(p => p.category))].length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Sales</div>
          <div className="text-3xl font-bold text-stone-900">{products.reduce((acc, curr) => acc + (curr.sales || 0), 0)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Rating</div>
          <div className="text-3xl font-bold text-rumi-600">{(products.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (products.length || 1)).toFixed(1)}</div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa-solid fa-search text-stone-400"></i>
        </div>
        <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl bg-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rumi-500"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden">
                        <img className="h-full w-full object-cover" src={product.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-stone-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-stone-100 text-stone-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenEdit(product)} className="text-rumi-600 hover:text-rumi-900 mr-4 transition-colors">
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => confirm(`Delete ${product.name}?`) && onDeleteProduct(product.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <label className="block text-sm font-bold text-stone-900 mb-4">Product Image</label>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 bg-white rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden">
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-regular fa-image text-3xl text-stone-300"></i>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                         <div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="image-upload"
                                className={`inline-flex items-center justify-center px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-800'}`}
                            >
                                {uploading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-upload mr-2"></i>}
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </label>
                         </div>
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-stone-50 text-stone-400">Or use URL</span>
                            </div>
                         </div>
                         <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500 text-sm"
                        />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                   <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500 bg-white"
                  >
                    <option value="Lips">Lips</option>
                    <option value="Face">Face</option>
                    <option value="Eyes">Eyes</option>
                    <option value="Skincare">Skincare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Subcategory</label>
                   <input
                    type="text"
                    required
                    placeholder="e.g. Matte, Serum"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Key Benefits</label>
                <div className="space-y-2">
                    {formData.benefits?.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500 text-sm"
                        />
                        <button type="button" onClick={() => removeBenefitField(idx)} className="p-2 text-stone-400 hover:text-red-500">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    ))}
                </div>
                <button type="button" onClick={addBenefitField} className="mt-2 text-sm font-medium text-rumi-600 hover:text-rumi-800">
                  + Add Benefit
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700 font-medium transition-colors shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Bulk Import (JSON)</h2>
            <textarea
              className="w-full h-64 p-4 border border-stone-300 rounded-xl font-mono text-xs focus:ring-rumi-500 focus:border-rumi-500 mb-6"
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder='[{"name": "...", "price": 10, ...}]'
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-6 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSave}
                className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};