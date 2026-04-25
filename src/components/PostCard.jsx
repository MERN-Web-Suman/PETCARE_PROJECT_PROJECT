import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const PostCard = ({ post, onLike, onComment }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [shareStatus, setShareStatus] = useState("Share");

  const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
  const isLiked = post.likes?.includes(userId);

  const handleLike = () => {
    if (onLike) onLike(post._id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      if (onComment) onComment(post._id, comment);
      setComment("");
    }
  };

  const handleShare = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    const shareUrl = `${window.location.origin}/community#post-${post._id}`;
    
    // Robust copy to clipboard with fallback
    const copyToClipboard = (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts or older browsers
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
          document.execCommand('copy') ? res() : rej();
          textArea.remove();
        });
      }
    };

    copyToClipboard(shareUrl)
      .then(() => {
        setShareStatus("Copied! ✅");
        setTimeout(() => setShareStatus("Share"), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link", err);
        setShareStatus("Error! ❌");
        setTimeout(() => setShareStatus("Share"), 2000);
      });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  return (
    <div id={`post-${post._id}`} className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-100 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 rounded-full blur-2xl pointer-events-none"></div>
      <div className="p-4 sm:p-6 border-b border-purple-100/50 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shadow-purple-500/30 flex-shrink-0">
              {post.author?.name ? post.author.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-gray-900 text-sm sm:text-lg leading-tight uppercase tracking-tight truncate">{post.author?.name || "Pet Lover"}</h4>
              <span className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-tighter sm:tracking-normal">{post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now"}</span>
            </div>
          </div>
          <div className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-black text-purple-600 uppercase tracking-widest border border-purple-100 flex-shrink-0">
            Community
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 relative z-10">
        <p className="text-gray-700 text-sm sm:text-lg font-medium leading-relaxed mb-4 sm:mb-6">{post.content}</p>
        {post.image && (
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-purple-100 shadow-lg mb-4 sm:mb-6">
            <img src={getImageUrl(post.image)} alt="Community story" className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 flex justify-between items-center text-[10px] sm:text-sm border-t border-purple-100/50 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5 font-black text-gray-500">
            <span className="text-base sm:text-lg">💬</span> {post.comments?.length || 0}
          </span>
          <span className="flex items-center gap-1.5 font-black text-gray-500">
            <span className="text-base sm:text-lg text-red-500">❤️</span> {post.likes?.length || 0}
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-3 flex gap-2 relative z-10">
        <button 
          className={`flex-1 py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${isLiked ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border border-red-200 shadow-lg shadow-red-500/30' : 'bg-gradient-to-r from-gray-50 to-white text-gray-600 hover:from-red-50 hover:to-pink-50 hover:text-red-600 border border-gray-100 hover:border-red-200'}`}
          onClick={handleLike}
        >
          {isLiked ? '❤️ Liked' : '🤍 Like'}
        </button>
        <button 
          className={`flex-1 py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${showComments ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-blue-200 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-r from-gray-50 to-white text-gray-600 hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 border border-gray-100 hover:border-blue-200'}`}
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest bg-gradient-to-r from-gray-50 to-white text-gray-600 hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 border border-gray-100 hover:border-purple-200 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          ➤ {shareStatus}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-purple-100 p-6 animate-fade-in bg-gradient-to-br from-white via-blue-50 to-purple-50 relative z-10">
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {post.comments?.map((c, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-gray-900 font-black text-xs uppercase tracking-tight">{c.user?.name || "User"}</strong>
                  <span className="text-[10px] text-gray-400 font-bold">• {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mt-4">
            <input
              type="text"
              placeholder="Join the conversation..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onClick={() => {
                if (!user) {
                  navigate("/login", { state: { from: location } });
                }
              }}
              className="flex-1 px-5 py-3 bg-white border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-800 shadow-sm"
            />
            <button type="submit" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:-translate-y-0.5 transition-all">
              Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
