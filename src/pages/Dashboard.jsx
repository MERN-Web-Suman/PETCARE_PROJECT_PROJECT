import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getProfileStats, getRecentActivity } from "../services/profileService";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    petCount: 0,
    appointments: 0,
    communityPosts: 0,
    adoptionsSaved: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        getProfileStats(),
        getRecentActivity()
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  const menuItems = [
    { icon: "🐾", label: "Create Pets", path: "/add-pet" },
    { icon: "📅", label: "Appointments", path: "/appointments" },
    { icon: "🐋", label: "Saved for Adoption", path: "/adoption" },
    { icon: "💭", label: "Community Posts", path: "/community" },
    { icon: "🚆", label: "Find Lost Pets", path: "/lost-found" },
    { icon: "🚨", label: "Emergency SOS", path: "/sos" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-outfit">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in">
        
        {/* Header Section - Premium Design */}
        <div className="mb-12 bg-gradient-to-br from-white via-purple-50 to-blue-50 p-8 rounded-[2.5rem] shadow-xl border-2 border-purple-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 opacity-40 rounded-full blur-3xl -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200 to-purple-200 opacity-40 rounded-full blur-3xl -mb-20 -ml-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name || "Pet Lover"}</span>! 👋
            </h1>
            <p className="text-gray-500 text-lg font-medium">Your personal pet care hub and activity center.</p>
          </div>
        </div>

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "My Pets", value: stats.petCount, gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50", icon: "🐾" },
            { label: "Appointments", value: stats.appointments, gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50", icon: "📅" },
            { label: "Community Posts", value: stats.communityPosts, gradient: "from-green-500 to-emerald-500", bgGradient: "from-green-50 to-emerald-50", icon: "💬" },
            { label: "Saved Adoptions", value: stats.adoptionsSaved, gradient: "from-orange-500 to-amber-500", bgGradient: "from-orange-50 to-amber-50", icon: "💙" }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.bgGradient} rounded-[2rem] shadow-xl p-6 border-2 border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group`}>
              <div className={`absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500`}>
                {stat.icon}
              </div>
              <div className="relative z-10">
                <div className={`text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 drop-shadow-sm`}>{stat.value}</div>
                <div className="text-gray-600 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Grid - Premium Buttons */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 rounded-lg shadow-md">🚀</span>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Quick Access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className="bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-2xl hover:-translate-y-1 hover:border-purple-300 transition-all duration-300 flex flex-col items-center gap-4 group relative overflow-hidden"
                onClick={() => navigate(item.path)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300 drop-shadow-sm relative z-10">{item.icon}</span>
                <span className="font-black text-gray-700 text-center text-sm relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-[2.5rem] shadow-xl p-8 border-2 border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <span className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-lg shadow-md">⚡</span>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Recent Activity</h2>
          </div>
          
          <div className="space-y-6 relative z-10">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader message="Loading activity..." /></div>
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={idx} className="flex gap-5 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all border-2 border-transparent hover:border-purple-200 group shadow-sm hover:shadow-md">
                  <div className={`w-12 h-12 bg-gradient-to-br ${activity.color === 'blue' ? 'from-blue-500 to-cyan-500' : activity.color === 'green' ? 'from-green-500 to-emerald-500' : activity.color === 'purple' ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-amber-500'} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0 animate-fade-in shadow-lg text-white`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-black text-lg mb-1">{activity.title}</p>
                    <p className="text-gray-500 font-medium">{activity.description}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 rounded-full text-xs font-black border border-purple-100">
                      {timeAgo(activity.date)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="text-5xl mb-4 opacity-30">✨</div>
                <p className="text-gray-500 font-medium">No activity yet. Start exploring to see updates here!</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
