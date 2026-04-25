import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { getLostFounds, createLostFound, updateLostFound, deleteLostFound } from "../services/lostFoundService";

const LostFound = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "lost",
    petName: "",
    breed: "",
    location: "",
    description: "",
    reward: "",
    contact: ""
  });
  const [petImage, setPetImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getLostFounds();
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Unable to load reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.petName) errors.petName = "Pet name/description required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.contact) errors.contact = "Contact info is required";
    return errors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (petImage) {
        submitData.append("image", petImage);
      }

      if (editingId) {
        await updateLostFound(editingId, submitData);
      } else {
        await createLostFound(submitData);
      }
      
      // Refresh list and reset form
      await fetchReports();
      resetForm();
    } catch (err) {
      console.error("Failed to submit report:", err);
      setError(`Failed to ${editingId ? 'update' : 'submit'} your report. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ type: "lost", petName: "", breed: "", location: "", description: "", reward: "", contact: "" });
    setPetImage(null);
    setImagePreview(null);
    setShowForm(false);
    setEditingId(null);
    setFormErrors({});
  };

  const handleEdit = (report) => {
    setFormData({
      type: report.type,
      petName: report.petName,
      breed: report.breed || "",
      location: report.location,
      description: report.description || "",
      reward: report.reward || "",
      contact: report.contact
    });
    setEditingId(report._id);
    if (report.image) {
      setImagePreview(getImageUrl(report.image));
    } else {
      setImagePreview(null);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteLostFound(id);
      fetchReports();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete the report.");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  const filteredReports = reports.filter(r => filter === "all" || r.type === filter);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-12 sm:py-20 px-4 relative overflow-hidden shadow-lg border-b border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-32 sm:w-48 h-32 sm:h-48 bg-yellow-300 opacity-20 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-6 shadow-xl border border-white/30 animate-bounce">
            🔍
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">Lost & Found Pets</h1>
          <p className="text-base sm:text-xl opacity-90 font-light max-w-2xl text-center mb-8 leading-relaxed">
            Help reunite furry friends with their families. Every second counts!
          </p>
          <button 
            className="w-full sm:w-auto px-10 py-4 bg-white text-red-600 rounded-full font-black text-base sm:text-lg hover:shadow-2xl hover:scale-105 shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-transparent active:scale-95" 
            onClick={() => {
              if (!user) {
                navigate("/login", { state: { from: location } });
              } else {
                if (showForm) resetForm();
                else setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel Operation ✕" : "Report a Pet 📢"}
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full -mt-8 relative z-20 animate-fade-in">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-bold flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Report Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-red-100 transform origin-top animate-fade-in">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">🚨</div>
               <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Your Report' : 'Report a Lost or Found Pet'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Report Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 font-medium transition-all"
                  >
                    <option value="lost">❌ Lost Pet</option>
                    <option value="found">✅ Found Pet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Pet Name/Description *</label>
                  <input
                    type="text"
                    value={formData.petName}
                    onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    className={`w-full px-5 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${formErrors.petName ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 focus:ring-primary-500/20 focus:border-primary-500"}`}
                  />
                  {formErrors.petName && <span className="text-red-500 text-sm mt-2 block font-medium">⚠️ {formErrors.petName}</span>}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
                <label className="block font-bold text-gray-700 mb-4">Upload Pet Image</label>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <label className="w-full sm:w-auto px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all duration-300">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-sm font-black text-gray-500">Choose Image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Pet preview" />
                      <button 
                        type="button" 
                        onClick={() => {setPetImage(null); setImagePreview(null);}} 
                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl-xl hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gray-200 flex items-center justify-center text-4xl opacity-30">
                      🐾
                    </div>
                  )}
                  <p className="text-sm text-gray-400 italic">Adding a clear photo significantly increases the chances of identification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Breed</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Where was the pet last seen?"
                    className={`w-full px-5 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${formErrors.location ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 focus:ring-primary-500/20 focus:border-primary-500"}`}
                  />
                  {formErrors.location && <span className="text-red-500 text-sm mt-2 block font-medium">⚠️ {formErrors.location}</span>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                  placeholder="Provide any distinguishing features, collar color, etc."
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 resize-none font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {formData.type === "lost" && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Reward Amount (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                      <input
                        type="text"
                        placeholder="e.g., 200"
                        value={formData.reward}
                        onChange={(e) => setFormData({...formData, reward: e.target.value})}
                        className="w-full pl-8 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                      />
                    </div>
                  </div>
                )}
                <div className={formData.type !== 'lost' ? "col-span-full sm:col-span-1" : ""}>
                  <label className="block font-bold text-gray-700 mb-2">Contact Information *</label>
                  <input
                    type="text"
                    placeholder="Phone number or email"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className={`w-full px-5 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${formErrors.contact ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 focus:ring-primary-500/20 focus:border-primary-500"}`}
                  />
                  {formErrors.contact && <span className="text-red-500 text-sm mt-2 block font-medium">⚠️ {formErrors.contact}</span>}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {submitting ? "Processing..." : (editingId ? "Update Report" : "Submit Report")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <button 
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 ${filter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            All Reports ({reports.length})
          </button>
          <button 
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 ${filter === 'lost' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-red-600'}`}
            onClick={() => setFilter('lost')}
          >
            ❌ Lost ({reports.filter(r => r.type === 'lost').length})
          </button>
          <button 
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 ${filter === 'found' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-green-600'}`}
            onClick={() => setFilter('found')}
          >
            ✅ Found ({reports.filter(r => r.type === 'found').length})
          </button>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader message="Fetching reports..." />
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <div key={report._id} className={`bg-white rounded-[24px] sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden relative ${report.type === 'lost' ? 'hover:border-red-200' : 'hover:border-green-200'}`}>
                  
                  {/* Color Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 sm:w-3 ${report.type === 'lost' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  
                  <div className="p-4 sm:p-8 pl-6 sm:pl-12 flex flex-col md:flex-row gap-4 sm:gap-8">
                    
                    {/* Pet Image Display */}
                    <div className="w-full md:w-40 xl:w-48 h-48 sm:h-40 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center">
                      {report.image ? (
                        <img src={getImageUrl(report.image)} className="w-full h-full object-cover" alt={report.petName} />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <span className="text-5xl sm:text-6xl">{report.type === 'lost' ? '😿' : '😺'}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <span className={`inline-flex px-3 py-1 rounded-lg text-white text-[10px] sm:text-xs font-black uppercase tracking-wider ${report.type === 'lost' ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-green-500 shadow-lg shadow-green-200'}`}>
                              {report.type === 'lost' ? 'Lost Pet' : 'Found Pet'}
                            </span>
                            <span className="text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-tight">Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight truncate">{report.petName}</h3>
                        </div>
                        
                        {report.reward && (
                          <div className="w-full sm:w-auto bg-yellow-400 text-yellow-900 px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg shadow-yellow-100 border border-yellow-200 flex flex-row sm:flex-col justify-between items-center sm:items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Reward</span>
                            <span className="text-xl sm:text-2xl font-black leading-none">${report.reward}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 p-4 sm:p-6 bg-slate-50 rounded-2xl border border-gray-100 mb-6">
                        <div className="flex flex-col gap-3">
                          <p className="flex items-center gap-3 text-sm sm:text-base"><span className="text-lg opacity-70">🐾</span> <strong className="text-gray-900 font-bold">Breed:</strong> <span className="text-gray-600 font-medium">{report.breed || "Unknown"}</span></p>
                          <p className="flex items-center gap-3 text-sm sm:text-base"><span className="text-lg opacity-70">📍</span> <strong className="text-gray-900 font-bold">Location:</strong> <span className="text-gray-600 font-medium truncate">{report.location}</span></p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-6">
                          {report.description ? (
                            <div className="flex flex-col gap-1">
                              <strong className="text-gray-900 font-bold text-sm sm:text-base flex items-center gap-2">📝 Description:</strong>
                              <p className="text-gray-600 font-medium text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">{report.description}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-sm">No additional description provided.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center mt-auto pt-4 sm:pt-6 border-t border-gray-100 gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-black text-sm group-hover:bg-indigo-100 transition-colors">
                          <span className="text-lg">🤳</span>
                          <span className="truncate">Contact: {report.contact}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {(() => {
                            const currentUserId = user?.id || user?._id || user?.user?.id || user?.user?._id;
                            const reportUserId = report.user?._id || report.user;
                            const isOwner = currentUserId && reportUserId && String(currentUserId) === String(reportUserId);
                            
                            return isOwner ? (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => handleEdit(report)}
                                  className="flex-1 sm:flex-none px-6 py-3 bg-yellow-400 text-white rounded-xl font-black hover:bg-yellow-500 shadow-lg shadow-yellow-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(report._id)}
                                  className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  if(!user) navigate("/login", { state: { from: location } });
                                }}
                                className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-black hover:bg-black hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                              >
                                <span>Contact Owner</span>
                                <span>&rarr;</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <span className="text-6xl opacity-20 block mb-4">😿</span>
                <p className="text-gray-500 font-bold">No reports found for this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LostFound;
