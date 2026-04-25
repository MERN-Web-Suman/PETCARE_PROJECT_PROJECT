import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const ADMIN_PASSWORD = "admin@2026";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      loginAdmin({ token: "admin-secret-token", email: "admin@petcare.com" });
      navigate("/admin-dashboard");
    } else {
      setError("Incorrect admin password.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-outfit">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600 opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-indigo-600 opacity-5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative z-10 animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg shadow-blue-500/10 border border-blue-500/20">🔐</div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Admin Portal</h1>
            <p className="text-slate-400 font-medium">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 ml-1">Admin Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-700"
                required
              />
              {error && <p className="text-rose-500 text-xs font-bold mt-3 ml-1 animate-pulse border-l-2 border-rose-500 pl-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all text-sm active:scale-95 mt-4"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-loose max-w-[200px] mx-auto border-t border-white/5 pt-8">
              Protected by PetCare Security Protocol v2.4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
