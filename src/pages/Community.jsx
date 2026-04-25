import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { getPosts, createPost, likePost, addComment } from "../services/postService";

const Community = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts();
      setPosts(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load community posts.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (newPost.trim() && user) {
      try {
        setLoading(true);
        const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
        
        const formData = new FormData();
        formData.append("content", newPost);
        formData.append("author", userId);
        if (postImage) {
          formData.append("image", postImage);
        }

        const res = await createPost(formData);
        setPosts([res.data, ...posts]);
        setNewPost("");
        setPostImage(null);
        setImagePreview(null);
        setShowPostForm(false);
      } catch (err) {
        setError("Failed to create post. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      
      const res = await likePost(postId, userId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;

      const res = await addComment(postId, { userId, text });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "popular") return (b.likes?.length || 0) - (a.likes?.length || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-outfit">
      <Navbar />
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12 sm:py-16 px-4 relative overflow-hidden shadow-lg border-b border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight shrink-0">🐾 Community</h1>
          <p className="text-base sm:text-xl opacity-90 font-light leading-relaxed max-w-2xl mx-auto">Share your magical moments, exchange tips, and connect with fellow pet lovers around the globe.</p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full -mt-6 sm:-mt-8 relative z-20 animate-fade-in transition-all">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-bold flex items-center gap-3 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Post Creation Area - Premium Design */}
        <div className="mb-8 sm:mb-10">
          {!showPostForm ? (
            <button 
              className="w-full bg-gradient-to-br from-white via-purple-50 to-white p-4 sm:p-6 rounded-[2rem] shadow-xl border-2 border-purple-100 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 flex items-center gap-3 sm:gap-4 group cursor-text relative overflow-hidden"
              onClick={() => {
                if (!user) {
                  navigate("/login", { state: { from: location } });
                } else {
                  setShowPostForm(true);
                }
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform border-2 border-white shadow-md">
                {user?.name?.[0]?.toUpperCase() || '👤'}
              </div>
              <span className="text-gray-400 font-bold text-sm sm:text-lg flex-1 text-left truncate">Share a story, photo, or tip...</span>
              <div className="flex gap-1.5 sm:gap-2 pr-1">
                <span className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-lg hover:scale-110 transition-transform border border-blue-100">📸</span>
                <span className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg text-lg hover:scale-110 transition-transform border border-purple-100 hidden xs:block">🎬</span>
              </div>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-[2rem] shadow-xl p-6 border-2 border-purple-100 transform origin-top animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 opacity-40 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg">👤</div>
                <span className="font-black text-gray-800 text-lg">Create Post</span>
              </div>
              <textarea
                autoFocus
                placeholder="Share your pet story, ask for advice, or post photos..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows="4"
                className="w-full px-5 py-4 bg-white border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 resize-none font-medium transition-all shadow-sm"
              />
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                <div className="flex-1 w-full flex items-center gap-3">
                  <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/30">
                    <span>📷</span> Add Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-300 shadow-lg">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        onClick={() => {setPostImage(null); setImagePreview(null);}} 
                        className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-bl-lg p-0.5 text-xs font-black"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end w-full sm:w-auto">
                  <button 
                    className="px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl font-bold hover:from-gray-200 hover:to-gray-100 transition-all shadow-md" 
                    onClick={() => { setShowPostForm(false); setImagePreview(null); setPostImage(null); }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                    onClick={handlePost} 
                    disabled={!newPost.trim() || loading}
                  >
                    {loading ? "Posting..." : "Post Story"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters - Premium Style */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-gradient-to-r from-white via-purple-50 to-white p-3 rounded-[2rem] shadow-xl border-2 border-purple-100">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black transition-all duration-300 ${sortBy === 'recent' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105' : 'bg-white text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 border border-gray-100'}`}
              onClick={() => setSortBy('recent')}
            >
              ✨ Recent
            </button>
            <button 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black transition-all duration-300 ${sortBy === 'popular' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105' : 'bg-white text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 border border-gray-100'}`}
              onClick={() => setSortBy('popular')}
            >
              🔥 Popular
            </button>
          </div>
          <span className="text-purple-600 font-black px-4 hidden sm:block bg-gradient-to-r from-blue-50 to-pink-50 py-1.5 rounded-lg">{posts.length} stories shared</span>
        </div>

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <div className="py-20 flex justify-center">
             <Loader message="Fetching community stories..." />
          </div>
        ) : (
          <div className="space-y-8">
            {sortedPosts.length > 0 ? (
              sortedPosts.map(post => (
                <div key={post._id} className="transform transition duration-300 hover:-translate-y-1">
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                <span className="text-6xl mb-4 block opacity-50">✨</span>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">It's quiet here...</h3>
                <p className="text-gray-500 text-lg">No posts yet. Be the first to share your pet's magical moments! 🎉</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Community;
