import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [items, setItems] = useState([]);

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    category: 'Supplies',
    price: 0,
    image: null,
    specifications: [{ key: '', value: '' }],
    status: 'In Stock',
    medicineName: '',
    brandName: '',
    type: 'Tablet',
    suitableFor: [],
    breedSize: [],
    ageGroup: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/provider');
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };

    fetchProducts();
    const socket = (window.io && window.io()) || null;
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) {
      alert('Please fill all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('price', newItem.price || 0);
      formData.append('stock', Number(newItem.quantity));
      formData.append('category', newItem.category);
      formData.append('unit', newItem.unit);
      formData.append('status', newItem.status);

      formData.append('medicineName', newItem.medicineName);
      formData.append('brandName', newItem.brandName);
      formData.append('type', newItem.type);
      formData.append('suitableFor', JSON.stringify(newItem.suitableFor));
      formData.append('breedSize', JSON.stringify(newItem.breedSize));
      formData.append('ageGroup', JSON.stringify(newItem.ageGroup));
      
      if (newItem.image) {
        formData.append('image', newItem.image);
      }

      const filteredSpecs = newItem.specifications.filter(s => s.key && s.value);
      formData.append('specifications', JSON.stringify(filteredSpecs));

      let response;
      if (editingId) {
        response = await api.put(`/products/${editingId}`, formData);
      } else {
        response = await api.post('/products', formData);
      }
      
      const item = response.data;
      if (editingId) {
        setItems(items.map(i => i._id === editingId ? item : i));
      } else {
        setItems([item, ...items]);
      }
      
      // Reset form
      setNewItem({ 
        name: '', 
        quantity: '', 
        unit: 'pcs', 
        category: 'Supplies', 
        price: 0, 
        image: null, 
        specifications: [{ key: '', value: '' }],
        status: 'In Stock',
        medicineName: '',
        brandName: '',
        type: 'Tablet',
        suitableFor: [],
        breedSize: [],
        ageGroup: []
      });
      setImagePreview(null);
      setEditingId(null);
      setIsAdding(false);
      alert(`Item ${editingId ? 'updated' : 'added'} successfully!`);
      alert(`Item ${editingId ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving item:', error);
      const data = error.response?.data;
      const msg = data?.message || data?.msg || 'Failed to save item';
      const detail = data?.error || data?.details || JSON.stringify(data) || '';
      
      alert(`⚠️ SAVE ERROR\n\n${msg}\n\nDetail: ${detail}`);
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      name: item.name,
      quantity: item.stock,
      unit: item.unit || 'pcs',
      category: item.category || 'Supplies',
      price: item.price || 0,
      image: null, // Don't reset image unless changed
      specifications: item.specifications.length > 0 ? item.specifications : [{ key: '', value: '' }],
      status: item.status || 'In Stock',
      medicineName: item.medicineName || '',
      brandName: item.brandName || '',
      type: item.type || 'Tablet',
      suitableFor: item.suitableFor || [],
      breedSize: item.breedSize || [],
      ageGroup: item.ageGroup || []
    });
    
    if (item.image) {
      setImagePreview(`http://localhost:5001/${item.image}`);
    } else {
      setImagePreview(null);
    }
    
    setEditingId(item._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/products/${id}`);
        setItems(items.filter((item) => item._id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        alert('Failed to delete item');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={() => {
            if (isAdding) {
              setNewItem({ 
                name: '', 
                quantity: '', 
                unit: 'pcs', 
                category: 'Supplies', 
                price: 0, 
                image: null, 
                medicineName: '', 
                brandName: '', 
                type: 'Tablet', 
                suitableFor: [], 
                breedSize: [], 
                ageGroup: []
              });
              setImagePreview(null);
              setEditingId(null);
            }
            setIsAdding(!isAdding);
          }}
          className={`px-4 py-2 ${isAdding ? 'bg-gray-500' : 'bg-blue-600'} text-white rounded-lg hover:opacity-90 transition`}
        >
          {isAdding ? 'Cancel' : (editingId ? 'Edit Product' : '+ Add Item')}
        </button>
      </div>

      {/* Add/Edit Item Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Product' : 'Add New Item'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dog Food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>pcs</option>
                <option>kg</option>
                <option>L</option>
                <option>bottles</option>
                <option>boxes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Food</option>
                <option>Medicine</option>
                <option>Medical</option>
                <option>Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status (Manual)</label>
              <select
                value={newItem.status}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="In Stock">✅ In Stock</option>
                <option value="Out of Stock">❌ Out of Stock</option>
              </select>
            </div>
          </div>

          {/* 💊 Basic Information Section */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-lg">💊</span> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine / Product Name</label>
                <input
                  type="text"
                  value={newItem.medicineName}
                  onChange={(e) => setNewItem({ ...newItem, medicineName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={newItem.brandName}
                  onChange={(e) => setNewItem({ ...newItem, brandName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. PetCare Labs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                  <option>Powder</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🐾 Pet-Specific Details Section */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="text-lg">🐾</span> Pet-Specific Details
            </h3>
            
            <div className="space-y-6">
              {/* Suitable For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Suitable For</label>
                <div className="flex flex-wrap gap-2">
                  {['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster'].map(pet => (
                    <button
                      key={pet}
                      type="button"
                      onClick={() => {
                        const current = newItem.suitableFor;
                        const next = current.includes(pet) ? current.filter(p => p !== pet) : [...current, pet];
                        setNewItem({...newItem, suitableFor: next});
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                        newItem.suitableFor.includes(pet) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {pet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Breed / Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Breed / Size</label>
                  <div className="flex flex-wrap gap-2">
                    {['Small', 'Medium', 'Large', 'Extra Large'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const current = newItem.breedSize;
                          const next = current.includes(size) ? current.filter(s => s !== size) : [...current, size];
                          setNewItem({...newItem, breedSize: next});
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                          newItem.breedSize.includes(size) 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Age Group</label>
                  <div className="flex flex-wrap gap-2">
                    {['Puppy / Kitten', 'Adult', 'Senior'].map(age => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          const current = newItem.ageGroup;
                          const next = current.includes(age) ? current.filter(a => a !== age) : [...current, age];
                          setNewItem({...newItem, ageGroup: next});
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                          newItem.ageGroup.includes(age) 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-30">📸</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewItem({ ...newItem, image: file });
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-400">JPG, PNG or WEBP up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Specifications Table Editor */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Specifications</h3>
              <button 
                onClick={() => setNewItem({ 
                  ...newItem, 
                  specifications: [...newItem.specifications, { key: '', value: '' }] 
                })}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-100 transition"
              >
                + Add Row
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100/50 text-gray-600 font-bold uppercase text-[10px] tracking-widest border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Specification Name (e.g. Weight)</th>
                    <th className="px-4 py-3">Value (e.g. 1kg)</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {newItem.specifications.map((spec, index) => (
                    <tr key={index} className="bg-white/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => {
                            const updated = [...newItem.specifications];
                            updated[index].key = e.target.value;
                            setNewItem({ ...newItem, specifications: updated });
                          }}
                          className="w-full px-3 py-1.5 border border-transparent focus:border-blue-300 rounded-md transition bg-transparent"
                          placeholder="Key"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const updated = [...newItem.specifications];
                            updated[index].value = e.target.value;
                            setNewItem({ ...newItem, specifications: updated });
                          }}
                          className="w-full px-3 py-1.5 border border-transparent focus:border-blue-300 rounded-md transition bg-transparent"
                          placeholder="Value"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => {
                            const updated = newItem.specifications.filter((_, i) => i !== index);
                            setNewItem({ ...newItem, specifications: updated });
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="w-full mt-8 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            {editingId ? 'Update Product' : 'Add Item to Inventory'}
          </button>
      </div>
      )}

      {/* Inventory Table — Desktop */}
      <div className="hidden sm:block bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-900">Item Name</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-900">Qty</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-900">Category</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-900 hidden lg:table-cell">Last Restocked</th>
              <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-4 lg:px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                      ) : <span className="text-lg">📦</span>}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{item.unit || 'pcs'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 font-semibold text-gray-900 text-sm">{item.stock}</td>
                <td className="px-4 lg:px-6 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">{item.category || 'General'}</span>
                </td>
                <td className="px-4 lg:px-6 py-3">
                  {item.status === "In Stock" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Out of Stock
                    </span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all">Edit</button>
                    <button onClick={async () => {
                      if (!window.confirm('Delete this item?')) return;
                      try { await api.delete(`/products/${item._id}`); setItems(items.filter((i) => i._id !== item._id)); }
                      catch (err) { alert('Failed to delete'); }
                    }} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory — Mobile Card View */}
      <div className="sm:hidden bg-white rounded-xl shadow-md divide-y divide-gray-100 overflow-hidden">
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-bold text-sm">No inventory items yet.</div>
        )}
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-3 p-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
              {item.image ? (
                <img src={item.image} className="w-full h-full object-cover" alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
              ) : <span className="text-2xl">📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-sm truncate">{item.name}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-gray-500">Qty: <b className="text-gray-900">{item.stock}</b></span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">{item.category}</span>
                {item.status === "In Stock"
                  ? <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold border border-green-100">✓ In Stock</span>
                  : <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-bold border border-red-100">✗ Out</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-black transition-all">Edit</button>
              <button onClick={async () => {
                if (!window.confirm('Delete?')) return;
                try { await api.delete(`/products/${item._id}`); setItems(items.filter((i) => i._id !== item._id)); }
                catch (err) { alert('Failed to delete'); }
              }} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-black transition-all">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

