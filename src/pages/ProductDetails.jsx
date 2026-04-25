import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Product not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 animate-fade-in relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:translate-x-[-4px] transition-transform bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-100 shadow-sm w-max"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Mart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 bg-white p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 opacity-50 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
          {/* Images Section */}
          <div className="space-y-6 relative z-10">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner border border-gray-100 group">
              <img 
                src={product.images?.[activeImage] || 'https://via.placeholder.com/600'} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all duration-300 ${
                    activeImage === idx ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:border-indigo-200'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.2em] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                {product.category} {product.subcategory && `• ${product.subcategory}`}
              </span>
              <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest shadow-sm ${
                product.availabilityStatus === 'In Stock' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {product.availabilityStatus || (product.quantity > 0 ? 'In Stock' : 'Out of Stock')}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-indigo-400 font-bold mb-6 uppercase tracking-widest">{product.brand}</p>

            <div className="flex items-center gap-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 inline-flex w-max shadow-inner">
              {product.discountPrice ? (
                <>
                  <span className="text-5xl font-black text-indigo-600">${product.discountPrice}</span>
                  <div className="flex flex-col">
                    <span className="text-xl text-gray-400 line-through font-bold">${product.price}</span>
                    <span className="text-red-500 text-sm font-black">
                      Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-5xl font-black text-gray-900">${product.price}</span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 border-b pb-8 border-gray-100">
              {product.description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
              <button 
                onClick={() => {
                  if (!user) {
                    navigate("/login", { state: { from: location } });
                  } else {
                    addToCart(product);
                  }
                }}
                disabled={product.quantity <= 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:bg-gray-200 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:translate-y-0 disabled:text-gray-500"
              >
                {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                onClick={() => {
                  if (!user) {
                    navigate("/login", { state: { from: location } });
                  } else {
                    toggleWishlist(product);
                  }
                }}
                className={`w-[72px] h-[72px] flex-shrink-0 rounded-[2rem] border-2 flex items-center justify-center transition-all duration-300 group shadow-sm bg-white ${
                  isInWishlist(product._id) 
                    ? 'border-pink-200 text-pink-500 bg-pink-50/50 shadow-pink-100' 
                    : 'border-gray-100 text-gray-400 hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <svg 
                  className={`w-8 h-8 group-hover:scale-110 transition-transform ${isInWishlist(product._id) ? 'fill-current' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            </div>

            {/* Specifications Tab */}
            <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 border-l-4 border-indigo-600 pl-4 uppercase tracking-widest flex items-center gap-2">
                <span className="text-2xl">📋</span> Specifications
              </h3>
              <div className="grid grid-cols-1 gap-x-12 gap-y-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-gray-900 font-black text-base md:text-right">
                        {Array.isArray(value) ? (
                          <div className="flex gap-2 flex-wrap sm:justify-end mt-1 sm:mt-0">
                            {value.map(v => <span key={v} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs tracking-wide">{v}</span>)}
                          </div>
                        ) : value}
                      </span>
                    </div>
                  );
                })}
                {product.tags && product.tags.length > 0 && (
                  <div className="pt-4 mt-2">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map(tag => (
                        <span key={tag} className="px-4 py-1.5 bg-white border border-gray-200 shadow-sm text-gray-600 rounded-xl text-xs font-black font-mono hover:border-indigo-300 transition-colors">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
