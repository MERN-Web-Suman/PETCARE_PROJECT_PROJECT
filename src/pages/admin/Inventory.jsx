import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'pcs', category: 'Supplies', price: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddItem = async () => {
    try {
      const payload = { name: newItem.name, price: newItem.price || 0, stock: Number(newItem.quantity) };
      const response = await api.post('/products', payload);
      setItems([response.data, ...items]);
      setIsAdding(false);
      setNewItem({ name: '', quantity: '', unit: 'pcs', category: 'Supplies', price: 0 });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
        <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isAdding ? 'Cancel' : '+ Add Item'}</button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Item Name</th>
              <th className="px-6 py-3 text-left font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left font-semibold">Category</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.stock}</td>
                <td className="px-6 py-4">{item.category || 'General'}</td>
                <td className="px-6 py-4">
                  <button onClick={async () => {
                    await api.delete(`/products/${item._id}`);
                    setItems(items.filter((i) => i._id !== item._id));
                  }} className="text-red-600 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
