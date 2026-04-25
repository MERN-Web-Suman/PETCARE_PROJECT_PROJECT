import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const handleBookOrder = (product) => {
    navigate('/mart/checkout', { state: { directBuyProduct: product } });
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 flex-1 w-full relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10 -ml-20 -mb-20"></div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">Saved Items</span>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              My <span className="text-indigo-600 italic">Wishlist</span>
            </h1>
            <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">Manage your favorite products and ready them for purchase</p>
          </div>
          
          <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items Saved</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{wishlist.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Heart size={24} fill="currentColor" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing with cloud...</p>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 pb-20">
            {wishlist.map((item) => (
              <div key={item._id} className="group bg-white rounded-[3.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border border-transparent hover:border-indigo-100 flex flex-col">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-50 mb-6">
                  <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  
                  {/* Floating category */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-xl border border-white/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button 
                       onClick={() => navigate(`/mart/product/${item._id}`)}
                       className="w-14 h-14 bg-white text-slate-900 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
                       title="View Product"
                     >
                       <ArrowRight size={20} />
                     </button>
                  </div>
                </div>

                <div className="px-6 pb-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">{item.brand || item.brandName || 'PetCare Original'}</p>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 leading-none">${item.price}</p>
                      {item.discountPrice && (
                        <p className="text-xs text-rose-500 font-bold mt-1 line-through opacity-60">${item.discountPrice}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm font-bold line-clamp-2 mb-8 leading-relaxed">
                    {item.description || item.medicineName || 'High-quality pet care product designed for your pet\'s optimal health and happiness.'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-4">
                    <button 
                      onClick={() => handleBookOrder(item)}
                      className="flex-1 h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 group/btn"
                    >
                      <ShoppingBag size={18} className="group-hover/btn:rotate-12 transition-transform" /> 
                      Book Order
                    </button>
                    <button 
                      onClick={() => handleRemove(item)}
                      className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[1.5rem] flex items-center justify-center hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] sm:rounded-[5rem] p-12 sm:p-24 text-center shadow-sm border border-slate-100 animate-fade-in">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-6xl shadow-inner grayscale opacity-40">
              ❤️
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your Wishlist is <span className="text-indigo-600">Pure Love</span></h3>
            <p className="text-slate-400 text-lg mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed">
              ...But it's empty right now. Start saving the things your pet will adore.
            </p>
            <Link to="/mart" className="inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition active:scale-95 group">
              Start Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      <Footer />
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
