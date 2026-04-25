import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      const res = await loginUser(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.user.name || 'User'}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500 opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-cyan-400 opacity-10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-20">
        <Navbar />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-white/50 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transform -rotate-12 hover:rotate-0 transition-transform duration-300 shadow-sm border border-indigo-100">
              🐾
            </div>
            <h2 className="text-4xl font-black mb-3 text-gray-900 tracking-tight">Welcome Back!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Sign in to your account</p>
          </div>
          
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-pulse">
              <span>⚠️</span> {serverError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
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
                    : "border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300"
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.email}</span>}
            </div>
            
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
                    : "border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300"
                }`}
              />
              {errors.password && <span className="text-red-500 text-xs font-bold mt-2 ml-1 block">{errors.password}</span>}
            </div>
            
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-colors" />
                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors">Forgot Password?</a>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none mt-4" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : "Sign In securely"}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold">
              New to PetCare?{" "}
              <a href="/register" className="text-indigo-600 font-black hover:text-indigo-800 hover:underline transition-all">Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
