import React, { useState } from 'react';
import { Product } from '../types';

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

  const handleBulkSave = () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (Array.isArray(parsed)) {
        onBulkAddProducts(parsed);
        setIsBulkModalOpen(false);
        setBulkJson('');
        alert(`Successfully added ${parsed.length} products.`);
      } else {
        alert("Invalid JSON: Root must be an array.");
      }
    } catch (e) {
      alert("Invalid JSON format. Please check your syntax.");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500">Welcome back, Ayaan.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <i className="fa-solid fa-file-import mr-2"></i> Bulk Add
          </button>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700 transition-colors"
          >
            <i className="fa-solid fa-plus mr-2"></i> Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <div className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-2">Active Products</div>
          <div className="text-3xl font-bold text-stone-900">{products.length}</div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-bold text-lg text-stone-900">Product Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">{product.name}</div>
                        <div className="text-sm text-stone-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {product.category}
                    </span>
                    <span className="ml-2 text-xs text-stone-500">{product.subcategory}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    In Stock
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenEdit(product)}
                      className="text-rumi-600 hover:text-rumi-900 mr-4"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-serif font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                   <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
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
                    placeholder="e.g. Lipstick, Serum"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Key Benefits</label>
                {formData.benefits?.map((benefit, idx) => (
                  <div key={idx} className="flex mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleBenefitChange(idx, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:ring-rumi-500 focus:border-rumi-500"
                    />
                  </div>
                ))}
                <button type="button" onClick={addBenefitField} className="text-sm text-rumi-600 hover:text-rumi-800">
                  + Add another benefit
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-2xl font-serif font-bold mb-4">Bulk Import Products</h2>
            <p className="text-stone-500 mb-4 text-sm">
              Paste a JSON array of product objects below. 
            </p>
            <textarea
              className="w-full h-64 p-4 border border-stone-300 rounded-lg font-mono text-xs focus:ring-rumi-500 focus:border-rumi-500 mb-4"
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder={`[
  {
    "name": "New Lipstick",
    "category": "Lips",
    "subcategory": "Lipstick",
    "price": 25.00,
    "description": "Description...",
    "image": "https://...",
    "benefits": ["Long lasting"]
  }
]`}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-6 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSave}
                className="px-6 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700"
              >
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};