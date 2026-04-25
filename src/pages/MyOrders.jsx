import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateInvoice } from '../utils/invoiceGenerator';
import API from '../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/user');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await API.patch(`/orders/${orderId}/cancel`);
      if (res.status === 200) {
        alert("Order cancelled successfully");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-outfit">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 flex-1 w-full">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-400 font-bold mb-8 sm:mb-12 uppercase tracking-widest text-xs">Track your purchases and history</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-gray-50/50 p-4 sm:p-6 flex flex-wrap justify-between items-center gap-3 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                    <p className="font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-black text-indigo-600 text-xl">${order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => generateInvoice(order)}
                        className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        📄 Invoice
                      </button>
                    )}
                    {['Pending', 'Paid'].includes(order.status) && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b pb-2">Shipping To</h3>
                      <p className="font-bold text-gray-700">{order.shippingDetails.name}</p>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{order.shippingDetails.address}</p>
                      <p className="text-sm text-gray-400 mt-1 font-mono">{order.shippingDetails.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b pb-2">Payment</h3>
                      <p className="font-bold text-gray-700">{order.paymentMethod}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b pb-2">Items</h3>
                  <div className="space-y-4">
                    {order.products.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl">
                        <img 
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} 
                          className="w-14 h-14 rounded-xl object-cover shadow-sm" 
                          alt="" 
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.product?.name || 'Deleted Product'}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.product?.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">${item.price}</p>
                          <p className="text-xs text-gray-400 font-bold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-12 sm:p-24 text-center border border-gray-100 shadow-sm">
            <div className="text-8xl mb-6 opacity-20">📦</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You haven't made any purchases yet.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
