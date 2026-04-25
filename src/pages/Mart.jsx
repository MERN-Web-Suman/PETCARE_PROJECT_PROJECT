import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { TypeAnimation } from 'react-type-animation';
import { useToast } from '../components/Toast';

export default function Mart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = categoryFilter === 'All' 
        ? '/products' 
        : `/products?category=${categoryFilter}`;
      const res = await API.get(url);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-outfit">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-primary py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <TypeAnimation
              sequence={[
                'PetCare Mart 🐾', 
                2000,
                'Best for Your Pets 🐶🐱', 
                2000,
                'Food, Care & Love ❤️', 
                2000,
                'Everything They Need', 
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </h1>
          <p className="text-indigo-100 text-base sm:text-xl max-w-2xl mx-auto mb-10 font-medium opacity-90">
            Everything your pet needs, from nutritious food to essential medicines and fun accessories.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/cart" className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-2xl font-black transition flex items-center justify-center gap-3 backdrop-blur-md shadow-xl border border-white/10">
              🛒 My Cart
            </Link>
            <Link to="/orders" className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-2xl font-black transition flex items-center justify-center gap-3 backdrop-blur-md shadow-xl border border-white/10">
              📦 My Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Category Filters - Horizontal Scroll on Mobile */}
        <div className="mb-10 sm:mb-16 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 px-4 sm:px-0">
          {['All', 'Food', 'Medicine', 'Medical', 'Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-6 sm:px-10 py-3 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all whitespace-nowrap shadow-sm border ${
                categoryFilter === cat 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all group overflow-hidden border border-gray-100 flex flex-col">
                <Link to={`/mart/product/${product._id}`} className="block relative">
                  <img 
                    src={product.image || 'https://via.placeholder.com/300'} 
                    alt={product.name}
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  {product.discountPrice && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                      SALE
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) {
                        navigate("/login", { state: { from: location } });
                      } else {
                        toggleWishlist(product);
                      }
                    }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm shadow-md border group-hover:scale-110 active:scale-95 z-20 ${
                      isInWishlist(product._id) 
                        ? 'text-pink-500 border-pink-100' 
                        : 'text-gray-400 border-transparent hover:text-pink-500'
                    }`}
                    title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <svg 
                      className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </button>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold">OUT OF STOCK</span>
                    </div>
                  )}
                </Link>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {product.category || 'Product'}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">{product.brandName || ''}</span>
                  </div>
                  <Link to={`/mart/product/${product._id}`} className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition mb-2 block truncate">
                    {product.name}
                  </Link>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {product.medicineName ? `Active: ${product.medicineName}` : (product.type || '')}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto gap-3">
                    <div className="flex-1">
                      {product.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-400 line-through leading-none">${product.price}</span>
                          <span className="text-xl font-black text-indigo-600">${product.discountPrice}</span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-gray-900">${product.price}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        to={`/mart/product/${product._id}`}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => {
                          if (!user) {
                            navigate("/login", { state: { from: location } });
                          } else {
                            addToCart(product);
                            toast.success(`${product.name} added to cart! 🛒`);
                          }
                        }}
                        disabled={product.stock <= 0}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-md ${
                          product.stock <= 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        title="Add to Cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-4 text-gray-200">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">We're currently stocking up on new items for this category.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
