import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  const handleClear = () => {
    if (window.confirm("Clear all items?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-outfit">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 flex-1 w-full">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 sm:mb-8 border-l-8 border-indigo-600 pl-4 sm:pl-6">Your Shopping Cart</h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                      <button onClick={() => handleRemove(item._id, item.name)} className="text-gray-300 hover:text-red-500 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold hover:bg-gray-100"
                        >-</button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold hover:bg-gray-100"
                        >+</button>
                      </div>
                      <span className="text-xl font-black text-indigo-600">${item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={handleClear}
                className="text-gray-400 font-bold text-sm hover:text-red-500 transition flex items-center gap-2"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 sticky top-32">
                <h2 className="text-2xl font-black mb-8">Order Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-indigo-100 font-bold">
                    <span>Subtotal</span>
                    <span>${cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-indigo-100 font-bold">
                    <span>Shipping</span>
                    <span className="text-green-400 font-black">FREE</span>
                  </div>
                  <div className="border-t border-indigo-400/30 pt-4 flex justify-between">
                    <span className="text-xl font-black">Total</span>
                    <span className="text-3xl font-black">${cartTotal}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/mart/checkout')}
                  className="w-full bg-white text-indigo-600 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-50 transition shadow-lg active:scale-95"
                >
                  Checkout Now
                </button>
                <Link to="/mart" className="block text-center mt-6 text-indigo-200 font-bold hover:text-white transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-10 sm:p-24 text-center shadow-sm border border-gray-100">
            <div className="text-9xl mb-8 opacity-20">🛒</div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/mart" className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">
              Go to Mart
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
