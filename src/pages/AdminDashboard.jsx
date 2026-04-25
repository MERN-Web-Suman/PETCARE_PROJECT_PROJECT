import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import AdminOverview from "./admin/AdminOverview";
import VetClinic from "./admin/VetClinic";
import Shelter from "./admin/Shelter";
import Inventory from "./admin/Inventory";
import Analytics from "./admin/Analytics";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { admin, logoutAdmin } = useContext(AuthContext);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "clinic", label: "Vet Clinic", icon: "🏥" },
    { id: "shelter", label: "Shelter", icon: "🏠" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminOverview />;
      case "clinic": return <VetClinic />;
      case "shelter": return <Shelter />;
      case "inventory": return <Inventory />;
      case "analytics": return <Analytics />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-outfit flex flex-col">
      <Navbar />
      
      {/* Sidebar for Admin */}
      <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-slate-900 text-white z-40 hidden lg:block border-r border-white/5">
        <div className="p-6">
          <div className="mb-8 px-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Admin Session</p>
            <p className="text-sm font-bold truncate text-slate-300">{admin?.email || 'admin@petcare.com'}</p>
          </div>
          
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-white/5">
          <button 
            onClick={logoutAdmin}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <span className="text-xl">🚪</span> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 lg:hidden flex justify-around p-2 z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === tab.id ? "text-blue-500" : "text-slate-500"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
