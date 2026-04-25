import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('provider@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user?.email || email);
        localStorage.setItem('providerId', data.user?._id || data.user?.id);
        navigate('/dashboard');
        window.location.reload(); // Quick refresh to update App state
      } else {
        setError(data.msg || data.message || 'Access denied. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-outfit">
      {/* Left Decoration - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl border border-white/30">
            🏥
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Elevate Your <span className="text-blue-300">Practice Care</span>
          </h1>
          <p className="text-blue-100 text-lg font-bold leading-relaxed opacity-90">
            Securely manage your pet clinic, inventory, and appointments with our next-generation provider suite. Join thousands of world-class veterinarians today.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
              <p className="text-3xl font-black text-white">2.5k+</p>
              <p className="text-xs font-black text-blue-200 uppercase tracking-widest mt-1">Providers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
              <p className="text-3xl font-black text-white">99%</p>
              <p className="text-xs font-black text-blue-200 uppercase tracking-widest mt-1">Support Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-12 right-12 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-green-500" />
           <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-shadow-sm">Secure Portal 256-bit</span>
        </div>

        <div className="w-full max-w-md">
           <div className="mb-10 lg:hidden text-center">
              <h1 className="text-3xl font-black text-gray-900">PetCare Provider</h1>
           </div>

           <div className="mb-12">
             <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Welcome back</h2>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Enter your details to manage your practice</p>
           </div>

           {error && (
             <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
               <span className="text-rose-500">⚠️</span>
               <p className="text-rose-600 text-xs font-black uppercase tracking-widest leading-relaxed">
                 {error}
               </p>
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
               <div className="relative group">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-14 pr-6 text-sm font-black text-gray-800 transition-all outline-none placeholder:text-gray-300"
                   placeholder="e.g. clinic@petcare.com"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between items-center ml-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                 <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</button>
               </div>
               <div className="relative group">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-14 pr-6 text-sm font-black text-gray-800 transition-all outline-none placeholder:text-gray-300"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <div className="flex items-center gap-3 ml-2">
                <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer select-none">Stay signed in for 30 days</label>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full h-16 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <>
                   Sign In to Dashboard
                   <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
           </form>

           <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-400 font-bold text-sm">
                Don't have a partner account? 
                <Link to="/signup" className="text-blue-600 ml-2 font-black uppercase tracking-widest text-xs hover:underline inline-flex items-center gap-2 group">
                  Apply Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
