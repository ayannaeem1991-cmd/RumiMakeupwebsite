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
  const [showPermissionFix, setShowPermissionFix] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Lips',
    subcategory: '',
    price: 0,
    originalPrice: undefined,
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
      originalPrice: undefined,
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
      // Use timestamp + random string for robust uniqueness
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = fileName;

      // Upload to the 'product-images' bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        // Specific check for RLS/Permission errors
        if (uploadError.message.includes('policy') || uploadError.message.includes('permission') || uploadError.message.includes('new row violates row-level security policy')) {
            setShowPermissionFix(true);
            return;
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error: any) {
      if (!showPermissionFix) {
        alert('Upload failed: ' + error.message);
      }
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

  const copySqlToClipboard = () => {
      const sql = `-- Run this in Supabase SQL Editor to enable uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'product-images' );`;
    
    navigator.clipboard.writeText(sql).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
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
                        {product.originalPrice && product.originalPrice > product.price && (
                           <div className="text-[10px] text-rumi-600 font-bold uppercase tracking-tighter">On Sale</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-stone-100 text-stone-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                    <div className="flex flex-col">
                      <span className="text-stone-900">Rs. {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
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

      {/* Permission Fix Modal */}
      {showPermissionFix && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up border border-red-100">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                         <i className="fa-solid fa-shield-halved text-lg"></i>
                    </div>
                    <h2 className="text-xl font-bold text-stone-900">Action Required</h2>
                </div>
                
                <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                    Your database bucket exists, but the <strong>permissions</strong> are blocking the upload.
                    <br/><br/>
                    Supabase requires explicit "Policies" to allow uploads. We cannot do this automatically for security reasons.
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">Step 1: Copy this code</p>
                    <div className="relative group">
                        <pre className="bg-stone-900 text-green-400 p-3 rounded text-[10px] font-mono overflow-x-auto">
{`-- Enable Public Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'product-images' );`}
                        </pre>
                        <button 
                            onClick={copySqlToClipboard}
                            className="absolute top-2 right-2 px-2 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] rounded transition-colors flex items-center gap-1"
                        >
                            {copySuccess ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-copy"></i>}
                            {copySuccess ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">Step 2: Run in Dashboard</p>
                    <a
                        href="https://supabase.com/dashboard/project/ktilwqazrimaqkgqdxjv/sql/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 bg-rumi-600 text-white text-center rounded-lg hover:bg-rumi-700 text-sm font-medium shadow-sm transition-all"
                    >
                        Open Supabase SQL Editor <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                    </a>
                </div>

                <button
                    onClick={() => setShowPermissionFix(false)}
                    className="w-full py-2 text-stone-500 hover:text-stone-700 text-sm"
                >
                    Close
                </button>
            </div>
        </div>
      )}

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
                   <label className="block text-sm font-medium text-stone-700 mb-1">Sale Price (After Discount)</label>
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
                   <label className="block text-sm font-medium text-stone-700 mb-1">Original Price (Before Discount - Optional)</label>
                   <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty if no discount"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Bulk Import (JSON)</h2>
            <textarea
              className="w-full h-64 p-4 border border-stone-300 rounded-xl font-mono text-xs focus:ring-rumi-500 focus:border-rumi-500 mb-6"
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder='[{"name": "...", "price": 1000, "originalPrice": 1200, ...}]'
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