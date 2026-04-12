import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Filter,
  Package,
  Loader2,
  X,
  Upload
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Rib Type',
    description: '',
    price: '',
    unit: 'per meter',
    stock: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/admin/products/${editingProduct.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/admin/products', formData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        type: product.type,
        description: product.description || '',
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'Rib Type',
        description: '',
        price: '',
        unit: 'per meter',
        stock: '',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <button 
          onClick={() => openModal()}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#111111] p-4 rounded-xl border border-gray-800">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search products by name or type..." 
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-green-500/50 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:bg-gray-800 transition-all text-sm">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 size={40} className="animate-spin text-green-500" />
            <p className="text-gray-500">Loading your inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-gray-900 rounded-full text-gray-600">
              <Package size={48} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-300">No products found</h3>
              <p className="text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your search or add a new product to get started.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Product Details</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Pricing</th>
                  <th className="px-6 py-4 font-medium">Stock Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-100">{p.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs border border-gray-700">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">₱{p.price.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{p.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${p.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{p.stock} units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(p)}
                          className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors text-gray-400"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Product Name</label>
                  <input 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="e.g. Rib Type Blue"
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Type</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all text-white"
                  >
                    <option>Rib Type</option>
                    <option>Spandrel</option>
                    <option>Flat Type</option>
                    <option>Accessories</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Price (₱)</label>
                  <input 
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="250"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Unit</label>
                  <input 
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="per meter"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Stock Quantity</label>
                  <input 
                    name="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="100"
                  />
                </div>

                {/* Image URL Placeholder */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Image URL</label>
                  <input 
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea 
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg py-2.5 px-4 focus:outline-none focus:border-green-500/50 transition-all resize-none"
                  placeholder="Tell customers more about this product..."
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
