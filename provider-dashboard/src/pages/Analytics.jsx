import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import { io } from 'socket.io-client';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');

    const handleEvent = () => {
      // For complex analytics, a full refresh is often safer than partial state updates
      // but we can optimize for simple counters
      fetchAnalytics(); 
    };

    socket.on('appointment-created', handleEvent);
    socket.on('appointment-updated', handleEvent);
    socket.on('order-placed', handleEvent);
    socket.on('inventory-created', handleEvent);
    socket.on('inventory-updated', handleEvent);
    socket.on('notice-created', handleEvent);

    return () => socket.disconnect();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/provider/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError('Could not load analytics data. Please ensure your practice profiles are active.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    try {
      if (!data) return;
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(22);
      doc.text('Performance PetCare Report', 20, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

      // 1. Appointment Trend Table
      doc.setFontSize(14);
      doc.text('Monthly Appointment Trends', 20, 45);
      const tableData = data.trend.map(t => [
        t.month, 
        t.appointments, 
        t.completed, 
        `${t.appointments > 0 ? Math.round((t.completed/t.appointments)*100) : 0}%`
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Month', 'Total Bookings', 'Completed', 'Success Rate']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] } // Replaced with RGB for safety
      });

      // 2. Inventory & Orders Summary
      // @ts-ignore - access finalY from last table
      const finalY = doc.lastAutoTable?.finalY || 100;
      doc.setFontSize(14);
      doc.text('Inventory & Sales Summary', 20, finalY + 15);
      
      const summaryData = [
        ['Total Products', data.inventory.totalProducts.toString()],
        ['Low Stock Items', data.inventory.lowStockItems.toString()],
        ['Total Orders', data.summary.totalOrders.toString()],
        ['Practice Notices', data.notices.total.toString()],
        ['Average Rating', `${data.notices.avgRating}/5.0`]
      ];
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // 3. Weekly Performance
      // @ts-ignore
      const weekY = doc.lastAutoTable?.finalY || 180;
      doc.setFontSize(14);
      doc.text('Weekly Performance (Last 4 Weeks)', 20, weekY + 15);
      const weeklyData = data.weeklyTrend.map(w => [w.week, w.total, w.completed]);
      
      autoTable(doc, {
        startY: weekY + 20,
        head: [['Week', 'Bookings', 'Completed']],
        body: weeklyData,
        headStyles: { fillColor: [139, 92, 246] }
      });
      
      doc.save('practice-intelligence-report.pdf');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  if (loading && !data) return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center bg-gray-50 font-outfit">
       <div className="flex flex-col items-center gap-4">
         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Generating Performance PetCare Metrics...</p>
       </div>
    </div>
  );

  if (error) return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-center max-w-md">
         <span className="text-6xl mb-6 block font-outfit">📊</span>
         <h2 className="text-2xl font-black text-gray-800 mb-2 font-outfit">Analytics Unavailable</h2>
         <p className="text-gray-500 font-bold mb-8 font-outfit">{error}</p>
         <button onClick={fetchAnalytics} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Retry Fetch</button>
       </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 font-outfit">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Performance PetCare
              <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] rounded-full uppercase animate-pulse">Live</span>
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Comprehensive real-time growth and performance insights</p>
          </div>
          <button 
            onClick={downloadReport}
            className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-900 hover:text-white hover:border-transparent transition-all shadow-xl shadow-gray-200/20 flex items-center gap-3"
          >
            <span>📥</span> Download Full PDF
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Weekly Performance', value: data.weeklyTrend[data.weeklyTrend.length - 1]?.total || 0, icon: '📅', color: 'blue', change: 'Current Week' },
            { label: 'Low Stock Alert', value: data.inventory.lowStockItems, icon: '⚠️', color: 'red', change: 'Immediate' },
            { label: 'Practice Notices', value: data.notices.total, icon: '📢', color: 'amber', change: `${data.notices.likes} Likes` },
            { label: 'Total Orders', value: data.summary.totalOrders, icon: '🛍️', color: 'emerald', change: 'Real-time' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`}></div>
              <span className="text-3xl mb-4 block relative z-10">{stat.icon}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
              <div className="flex items-end justify-between relative z-10">
                <h3 className="text-4xl font-black text-gray-900">{stat.value}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 uppercase tracking-widest`}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Charts Row: Weekly & Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Performance */}
          <div className="bg-white rounded-[50px] p-10 shadow-sm border border-gray-100 h-[450px] flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">Weekly Target Performance</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Last 4 Weeks Appointment Flow</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}} />
                  <Bar dataKey="total" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={40} />
                  <Bar dataKey="completed" fill="#10B981" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Appointment Trends */}
          <div className="bg-white rounded-[50px] p-10 shadow-sm border border-gray-100 h-[450px] flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">Monthly Growth</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">6-Month Appointment Trend</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}} />
                  <Area type="monotone" dataKey="appointments" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Middle Charts: Revenue & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Order & Revenue Trend */}
          <div className="lg:col-span-8 bg-white rounded-[50px] p-10 shadow-sm border border-gray-100 h-[500px] flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 mb-10">Order & Revenue Intelligence</h2>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.orderTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={4} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Distribution */}
          <div className="lg:col-span-4 bg-white rounded-[50px] p-10 shadow-sm border border-gray-100 h-[500px] flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Stock Mix</h2>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.inventory.categoryDistribution}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {data.inventory.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={10} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <p className="text-[10px] font-black uppercase text-gray-400">Total Skus</p>
                   <p className="text-2xl font-black text-gray-900">{data.inventory.totalProducts}</p>
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
               {data.inventory.categoryDistribution.slice(0, 4).map((c, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                   <span className="text-[10px] font-black uppercase text-gray-500 truncate">{c.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden mb-16">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">Performance Breakdown</h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-[10px] font-black uppercase text-gray-400">Monthly Yield</span>
              </span>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Month</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Bookings</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Success</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {data.trend.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-10 py-6 font-black text-gray-900">{row.month}</td>
                  <td className="px-10 py-6 font-bold text-gray-700">{row.appointments}</td>
                  <td className="px-10 py-6 font-bold text-emerald-500">{row.completed}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{width: `${row.appointments > 0 ? (row.completed/row.appointments)*100 : 0}%`}}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-gray-900">
                        {row.appointments > 0 ? Math.round((row.completed/row.appointments)*100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
