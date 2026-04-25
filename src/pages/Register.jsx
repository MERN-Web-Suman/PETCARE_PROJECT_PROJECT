import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correctly fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      const res = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(res.data);
      setSuccess(true);
      toast.success("Account created successfully! 🎉");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-outfit relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-12 w-full max-w-md text-center border-2 border-green-500 animate-fade-in transform scale-100 transition-all duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce shadow-inner border-4 border-white">
              🎉
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Welcome Aboard!</h2>
            <p className="text-green-600 font-bold mb-6 text-lg">Registration successful.</p>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-purple-500 opacity-10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-pink-400 opacity-10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-20">
        <Navbar />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-white/50 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transform -rotate-12 hover:rotate-0 transition-transform duration-300 shadow-sm border border-pink-100">
              ✨
            </div>
            <h2 className="text-4xl font-black mb-3 text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Join the PetCare community</p>
          </div>
          
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-pulse">
              <span>⚠️</span> {serverError}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-5 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-900 ${
                  errors.name 
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30" 
                    : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300"
                }`}
              />
              {errors.name && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.name}</span>}
            </div>
            
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-5 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-900 ${
                  errors.email 
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30" 
                    : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300"
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.email}</span>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full px-5 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-900 ${
                    errors.password 
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30" 
                      : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300"
                  }`}
                />
                {errors.password && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.password}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full px-5 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-900 ${
                    errors.confirmPassword 
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30" 
                      : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300"
                  }`}
                />
                {errors.confirmPassword && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.confirmPassword}</span>}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none mt-6" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : "Create Account"}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 font-black hover:text-purple-800 hover:underline transition-all">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
