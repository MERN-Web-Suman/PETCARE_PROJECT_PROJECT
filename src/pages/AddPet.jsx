import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { addPet } from "../services/petService";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AddPet = () => {
  const [pet, setPet] = useState({
    name: "", type: "", breed: "", age: "", color: "",
    weight: "", microchipId: "", dateOfBirth: "", description: "",
    ownerName: "", medicalHistory: "", vaccinations: "", nextAppointment: "", image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPet({ ...pet, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!pet.name) newErrors.name = "Pet name is required";
    if (!pet.type) newErrors.type = "Pet type is required";
    if (!pet.breed) newErrors.breed = "Breed is required";
    return newErrors;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      
      const ownerId = user?.id || user?._id || user?.user?.id || user?.user?._id;
      
      if (!ownerId) {
        setServerError("User session not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("Creating pet for owner:", ownerId);
      
      const formData = new FormData();
      Object.keys(pet).forEach(key => {
        if (key === "image" && pet[key]) {
          formData.append("image", pet[key]);
        } else if (pet[key] !== null && pet[key] !== undefined) {
          formData.append(key, pet[key]);
        }
      });
      formData.append("owner", ownerId);

      await addPet(formData);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-indigo-500 opacity-5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-20">
        <Navbar />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10 w-full animate-fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 w-full max-w-4xl border border-gray-100">
          
          <div className="text-center mb-10 border-b border-gray-100 pb-8 relative">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transform -rotate-12 shadow-sm border border-blue-100 animate-pulse">
              ➕🐾
            </div>
            <h2 className="text-4xl font-black mb-3 text-gray-900 tracking-tight">Create Pet Profile</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Register your companion with full medical details</p>
          </div>
          
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-xl mb-8 text-sm font-bold flex items-center gap-3">
              <span>⚠️</span> {serverError}
            </div>
          )}
          
          <form onSubmit={handleAdd} className="space-y-8">
            
            {/* Section 1: Basic Details */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
              <h3 className="text-xl font-extrabold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pet Name *</label>
                  <input type="text" placeholder="e.g., Max, Whiskers" value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })}
                    className={`w-full px-5 py-3 bg-white border rounded-xl focus:ring-4 transition-all font-bold text-gray-900 ${errors.name ? "border-red-300 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20"}`} />
                  {errors.name && <span className="text-red-500 text-xs font-bold mt-1 ml-1 block">{errors.name}</span>}
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Owner Name</label>
                  <input type="text" placeholder="e.g., John Doe" value={pet.ownerName} onChange={(e) => setPet({ ...pet, ownerName: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pet Type *</label>
                  <select value={pet.type} onChange={(e) => setPet({ ...pet, type: e.target.value })}
                    className={`w-full px-5 py-3 bg-white border rounded-xl focus:ring-4 transition-all font-bold text-gray-900 ${errors.type ? "border-red-300 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20"}`}>
                    <option value="">Select type...</option>
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐈 Cat</option>
                    <option value="bird">🦜 Bird</option>
                    <option value="rabbit">🐇 Rabbit</option>
                    <option value="other">🐾 Other</option>
                  </select>
                  {errors.type && <span className="text-red-500 text-xs font-bold mt-1 ml-1 block">{errors.type}</span>}
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Breed *</label>
                  <input type="text" placeholder="e.g., Golden Retriever" value={pet.breed} onChange={(e) => setPet({ ...pet, breed: e.target.value })}
                    className={`w-full px-5 py-3 bg-white border rounded-xl focus:ring-4 transition-all font-bold text-gray-900 ${errors.breed ? "border-red-300 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20"}`} />
                  {errors.breed && <span className="text-red-500 text-xs font-bold mt-1 ml-1 block">{errors.breed}</span>}
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Age (Years)</label>
                  <input type="number" placeholder="e.g., 2" value={pet.age} onChange={(e) => setPet({ ...pet, age: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-gray-900" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pet Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                {imagePreview && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Physical Attributes */}
            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 space-y-6">
              <h3 className="text-xl font-extrabold text-blue-800 border-b border-blue-100 pb-2">Physical Attributes</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Color / Marking</label>
                  <input type="text" placeholder="e.g., Golden" value={pet.color} onChange={(e) => setPet({ ...pet, color: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Weight (lbs/kg)</label>
                  <input type="text" placeholder="e.g., 65 lbs" value={pet.weight} onChange={(e) => setPet({ ...pet, weight: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                  <input type="date" value={pet.dateOfBirth} onChange={(e) => setPet({ ...pet, dateOfBirth: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Microchip ID</label>
                  <input type="text" placeholder="e.g., 9851410..." value={pet.microchipId} onChange={(e) => setPet({ ...pet, microchipId: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold font-mono tracking-wider text-gray-900" />
                </div>
              </div>
            </div>

            {/* Section 3: Health & Medical */}
            <div className="bg-green-50/30 p-6 rounded-2xl border border-green-100 space-y-6">
              <h3 className="text-xl font-extrabold text-green-800 border-b border-green-100 pb-2">Health & Medical</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vaccination History</label>
                  <textarea placeholder="List recent vaccinations (e.g., Rabies: 01/24, DHPP: 03/24)..." value={pet.vaccinations} onChange={(e) => setPet({ ...pet, vaccinations: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 transition-all font-medium text-gray-900 h-24 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Medical History</label>
                  <textarea placeholder="List any past surgeries, allergies, or chronic conditions..." value={pet.medicalHistory} onChange={(e) => setPet({ ...pet, medicalHistory: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 transition-all font-medium text-gray-900 h-24 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Next Appointment Date / Checkup</label>
                <input type="datetime-local" value={pet.nextAppointment} onChange={(e) => setPet({ ...pet, nextAppointment: e.target.value })}
                  className="w-full md:w-1/2 px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 transition-all font-bold text-gray-900" />
              </div>
            </div>

            {/* Section 4: Biography */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Biography</label>
              <textarea placeholder="Tell us about your pet's personality, favorite toys, or quirky habits..." value={pet.description} onChange={(e) => setPet({ ...pet, description: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 hover:border-gray-300 transition-all font-medium text-gray-900 resize-none h-32" />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none">
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Registering Pet...
                  </span>
                ) : "Add Companion Profile"}
              </button>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddPet;
