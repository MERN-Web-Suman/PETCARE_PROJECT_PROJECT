import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await API.get('/wishlist');
      setWishlist(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.error('Please login to manage your wishlist! 🔒');
      return;
    }

    try {
      const res = await API.post(`/wishlist/toggle/${product._id}`);
      if (res.data.active === 'added' || res.data.action === 'added') {
        setWishlist(prev => [...prev, product]);
        toast.success(`${product.name} added to wishlist! ❤️`);
      } else {
        setWishlist(prev => prev.filter(p => p._id !== product._id));
        toast.info(`${product.name} removed from wishlist.`);
      }
    } catch (err) {
      console.error('Toggle wishlist failed', err);
      toast.error('Failed to update wishlist. Try again.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p._id === productId);
  };

  const value = {
    wishlist,
    loading,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
