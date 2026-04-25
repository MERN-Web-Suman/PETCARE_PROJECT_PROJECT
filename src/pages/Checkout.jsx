import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useToast } from '../components/Toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const directBuyProduct = location.state?.directBuyProduct;
  const checkoutItems = directBuyProduct 
    ? [{ ...directBuyProduct, quantity: 1, price: directBuyProduct.discountPrice || directBuyProduct.price }] 
    : cart;
  const checkoutTotal = directBuyProduct 
    ? (directBuyProduct.discountPrice || directBuyProduct.price) 
    : cartTotal;
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    address: '',
    phone: '',
    zip: '',
    paymentMethod: 'Cash on Delivery'
  });

  const placeActualOrder = async (paymentIntentId = null) => {
    try {
      const { paymentMethod, ...justShipping } = shippingDetails;
      
      const orderData = {
        products: checkoutItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingDetails: justShipping,
        paymentMethod: paymentMethod,
        totalAmount: checkoutTotal,
        paymentIntentId,
        status: paymentMethod === 'Online Payment' ? 'Paid' : 'Pending'
      };

      const res = await API.post('/orders', orderData);

      if (res.status === 201 || res.status === 200) {
        setOrderPlaced(true);
        if (!directBuyProduct) clearCart();
        toast.success('Order placed successfully! Thank you for shopping.');
        setTimeout(() => navigate('/orders'), 3000);
      }
    } catch (err) {
      console.error("Order Error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.msg || 'An error occurred while placing order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAndOrder = async (e) => {
    e.preventDefault();
    
    // Double-check authentication
    if (!user) {
      toast.warning('Please login to place an order');
      navigate('/login');
      return;
    }
    
    setLoading(true);

    if (shippingDetails.paymentMethod === 'Online Payment') {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      try {
        const intentRes = await API.post('/payment/create-order', { 
          amount: checkoutTotal,
          currency: 'INR'
        });
        
        const { order, key_id } = intentRes.data;

        const options = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: "PetCare Store",
          description: "Purchase Order for " + shippingDetails.name,
          order_id: order.id,
          handler: async function (response) {
            try {
              toast.info("Verifying Payment...");
              const resVerify = await API.post('/payment/verify-signature', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (resVerify.data.success) {
                // proceed to place order in DB
                placeActualOrder(response.razorpay_payment_id);
              }
            } catch (err) {
              console.error(err);
              toast.error("Payment verification failed");
              setLoading(false);
            }
          },
          prefill: {
            name: shippingDetails.name,
            email: user?.email,
            contact: shippingDetails.phone
          },
          theme: {
            color: "#4f46e5" // indigo-600 to match your UI
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response){
          toast.error(response.error.description || "Payment Failed");
          setLoading(false);
        });
        paymentObject.open();

      } catch (err) {
         console.error("Razorpay Error:", err);
         toast.error("Could not initiate payment");
         setLoading(false);
      }
    } else {
       // Cash on Delivery
       await placeActualOrder();
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-outfit text-center p-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 animate-bounce">
          ✓
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 font-bold mb-8">Thank you for your purchase. Redirecting to your orders...</p>
        <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-[3000ms] w-full"></div>
        </div>
      </div>
    );
  }

  if (!directBuyProduct && cart.length === 0) {
    navigate('/mart');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Form Section */}
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 ">Checkout</h1>
            <p className="text-gray-400 font-bold mb-12 uppercase tracking-[0.2em] text-sm">Shipping & Payment</p>
            
            <form onSubmit={handlePaymentAndOrder} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Recipient Name</label>
                  <input 
                    type="text" 
                    required
                    value={shippingDetails.name}
                    onChange={(e) => setShippingDetails({...shippingDetails, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 transition font-bold"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Address</label>
                  <textarea 
                    required
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 transition font-bold h-32"
                    placeholder="Apartment, Street, City, ZIP"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 transition font-bold"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ZIP Code</label>
                    <input 
                      type="text" 
                      value={shippingDetails.zip}
                      onChange={(e) => setShippingDetails({...shippingDetails, zip: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 transition font-bold"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setShippingDetails({...shippingDetails, paymentMethod: 'Cash on Delivery'})}
                    className={`px-6 py-6 rounded-2xl font-bold border-2 transition flex flex-col items-center gap-2 ${
                      shippingDetails.paymentMethod === 'Cash on Delivery' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 scale-[1.02] shadow-lg' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">💰</span>
                    <span>Cash on Delivery</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShippingDetails({...shippingDetails, paymentMethod: 'Online Payment'})}
                    className={`px-6 py-6 rounded-2xl font-bold border-2 transition flex flex-col items-center gap-2 ${
                      shippingDetails.paymentMethod === 'Online Payment' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 scale-[1.02] shadow-lg' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">💳</span>
                    <span>Online Payment</span>
                  </button>
                </div>
              </div>

              {shippingDetails.paymentMethod === 'Online Payment' && (
                <div className="bg-indigo-600 text-white p-6 rounded-[1.5rem] animate-pulse">
                  <p className="text-sm font-bold opacity-80 mb-1">Razorpay Secure Checkout</p>
                  <p className="font-black">Safe and encrypted payment will be processed.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : shippingDetails.paymentMethod === 'Online Payment' ? 'Pay & Confirm' : 'Confirm Order'}
              </button>
            </form>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 p-12 rounded-[3.5rem] h-fit sticky top-32">
            <h2 className="text-2xl font-black mb-8">Order Summary</h2>
            <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {checkoutItems.map(item => (
                <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-4 items-center">
                    <img src={item.image || item.images?.[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 pt-12 border-t border-gray-200">
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>Subtotal</span>
                <span>${checkoutTotal}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>Shipping</span>
                <span className="text-green-500 font-black">Free</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-xl font-black text-gray-900">Total Amount</span>
                <span className="text-4xl font-black text-indigo-600">${checkoutTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
