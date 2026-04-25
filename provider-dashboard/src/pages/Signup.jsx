import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api') + '/auth/register-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user?.email || email);
        localStorage.setItem('providerId', data.user?._id || data.user?.id);
        navigate('/dashboard');
        window.location.reload();
      } else {
        setError(data.msg || 'Application failed. This email may already be registered.');
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-blue-900 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl border border-white/30">
            🐾
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Join the <span className="text-blue-300">Provider Network</span>
          </h1>
          <p className="text-blue-100 text-lg font-bold leading-relaxed opacity-90">
            Apply today to reach thousands of pet owners. We provide the tools you need to grow your practice and provide world-class care.
          </p>
          
          <div className="mt-12 space-y-6 text-left">
            {[
              { icon: '⭐', title: 'Top Visibility', desc: 'Get featured on the home search for thousands of unique users.' },
              { icon: '📈', title: 'Growth Tools', desc: 'Real-time analytics to track your success and growth trends.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade security for your data and communications.' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
                <span className="text-2xl group-hover:scale-125 transition-transform">{feature.icon}</span>
                <div>
                   <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-1">{feature.title}</h4>
                   <p className="text-blue-200 text-xs font-bold leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-12 right-12 flex items-center gap-2">
           <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
           <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Built for quality care</span>
        </div>

        <div className="w-full max-w-md">
           <div className="mb-12">
             <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px] mb-8 hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-3 h-3" /> Back to Login
             </Link>
             <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Partner Application</h2>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fill in your information to start your journey</p>
           </div>

           {error && (
             <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
               <span className="text-rose-500 font-bold">⚠️</span>
               <p className="text-rose-600 text-xs font-black uppercase tracking-widest leading-relaxed">
                 {error}
               </p>
             </div>
           )}

           <form onSubmit={handleSignup} className="space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
               <div className="relative group">
                 <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
                   className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-14 pr-6 text-sm font-black text-gray-800 transition-all outline-none placeholder:text-gray-300"
                   placeholder="e.g. Happy Paws Clinic"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Business Email</label>
               <div className="relative group">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-14 pr-6 text-sm font-black text-gray-800 transition-all outline-none placeholder:text-gray-300"
                   placeholder="e.g. contact@happy-paws.com"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Access Password</label>
               <div className="relative group">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-14 pr-6 text-sm font-black text-gray-800 transition-all outline-none placeholder:text-gray-300"
                   placeholder="Min. 8 characters"
                 />
               </div>
             </div>

             <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                <input type="checkbox" required className="w-5 h-5 mt-1 rounded-lg border-2 border-blue-200 text-blue-600 focus:ring-0 transition-all cursor-pointer" />
                <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-wider">
                  I agree to the Provider Network <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Guidelines</span>.
                </p>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-gray-900 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <>
                   Accept & Create Account
                   <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
           </form>

           <div className="mt-12 text-center">
              <p className="text-gray-400 font-bold text-sm">
                Already have an account? 
                <Link to="/login" className="text-gray-900 ml-2 font-black uppercase tracking-widest text-xs hover:underline">
                  Sign In
                </Link>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
