import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { 
  Search, Filter, Package, Truck, CheckCircle, 
  Clock, XCircle, FileText, Calendar, User, 
  Phone, MapPin, CreditCard, ChevronRight,
  TrendingUp, ShoppingBag, AlertCircle, ExternalLink,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { generateInvoice } from '../utils/invoiceGenerator';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

    socket.on('order-placed', () => fetchOrders());
    socket.on('order-updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });
    socket.on('order-cancelled', (cancelledOrder) => {
      setOrders(prev => prev.map(o => o._id === cancelledOrder._id ? cancelledOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/provider');
      setOrders(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load orders', err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/status/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Modern filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'Pending').length;
    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const revenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    return { pending, shipped, delivered, revenue };
  }, [orders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered': return { 
        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', 
        icon: CheckCircle, step: 4 
      };
      case 'Shipped': return { 
        color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', 
        icon: Truck, step: 3 
      };
      case 'Cancelled': return { 
        color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', 
        icon: XCircle, step: 0 
      };
      default: return { 
        color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', 
        icon: Clock, step: 2 
      };
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Syncing Manifest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#f8fafc] font-outfit">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Live Hub</span>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-slate-500 font-bold mt-2">Track lifecycle, modify status, and generate logistics reports.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 min-w-[240px]">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Provider Revenue</p>
                <p className="text-2xl font-black text-slate-900">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 min-w-[180px]">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Active</p>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Controls Section */}
        <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-4 px-6 w-full md:w-auto">
            <Search className="text-slate-400" size={22} />
            <input 
              type="text" 
              placeholder="Search by ID or Recipient Name..."
              className="bg-transparent border-none focus:ring-0 w-full font-bold text-slate-700 placeholder:text-slate-300 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/50 rounded-[2rem] w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50 scale-105' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Master Orders Feed */}
        <div className="space-y-8 pb-20">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              
              return (
                <div key={order._id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-200/50 overflow-hidden hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group">
                  
                  {/* Visual Stepper Header */}
                  {order.status !== 'Cancelled' && (
                    <div className="grid grid-cols-4 border-b border-slate-50">
                       {[
                         { label: 'Placed', icon: Clock, target: 1 },
                         { label: 'Validated', icon: CheckCircle, target: 2 },
                         { label: 'Dispatched', icon: Truck, target: 3 },
                         { label: 'Received', icon: Package, target: 4 }
                       ].map((step, idx) => (
                         <div key={idx} className={`py-4 flex flex-col items-center gap-2 border-r border-slate-50 last:border-0 transition-colors ${status.step >= step.target ? 'bg-indigo-50/30' : ''}`}>
                            <step.icon size={16} className={status.step >= step.target ? 'text-indigo-600' : 'text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${status.step >= step.target ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                         </div>
                       ))}
                    </div>
                  )}

                  <div className="p-10">
                    {/* Header: ID and Meta */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${status.border} ${status.bg} ${status.color}`}>
                            {order.status}
                          </span>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                            <Calendar size={14} /> {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <h3 className="font-mono text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">#{order._id.toUpperCase()}</h3>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Merchant Revenue</p>
                        <p className="text-5xl font-black text-indigo-600 flex items-start">
                          <span className="text-2xl mt-1 mr-1">$</span>
                          {order.products
                            .filter(p => (p.product?.provider?._id || p.product?.provider) === localStorage.getItem('providerId'))
                            .reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                      
                      {/* Column 1: Fulfillment Details */}
                      <div className="lg:col-span-5 space-y-10">
                         <div>
                            <h4 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                               <div className="w-8 h-1 bg-indigo-600 rounded-full"></div> Destination Logistics
                            </h4>
                            <div className="bg-[#fcfdfe] rounded-[2.5rem] p-8 border border-slate-100 shadow-inner space-y-8">
                               <div className="flex items-center gap-6">
                                  <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-slate-100 flex items-center justify-center text-2xl border border-slate-50">👤</div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer Name</p>
                                     <p className="text-xl font-black text-slate-900 leading-none">{order.shippingDetails.name}</p>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6">
                                  <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-slate-100 flex items-center justify-center text-indigo-500 border border-slate-50">
                                     <Phone size={24} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Secure Contact</p>
                                     <p className="text-xl font-black text-slate-900 leading-none">{order.shippingDetails.phone}</p>
                                  </div>
                               </div>

                               <div className="flex items-start gap-6">
                                  <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-slate-100 flex items-center justify-center text-rose-500 border border-slate-50 mt-1">
                                     <MapPin size={24} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Standard Delivery Address</p>
                                     <p className="text-base font-bold text-slate-600 leading-relaxed uppercase">
                                        {order.shippingDetails.address}
                                     </p>
                                     <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest border border-indigo-100">
                                        ZIP: {order.shippingDetails.zip || 'UKN'}
                                     </div>
                                  </div>
                               </div>

                               <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <CreditCard size={18} className="text-slate-300" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{order.paymentMethod}</span>
                                  </div>
                                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                     Verification <ExternalLink size={12} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Column 2: Order Items Manifest */}
                      <div className="lg:col-span-7">
                         <h4 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-900 mb-6 font-outfit">
                            <div className="w-8 h-1 bg-indigo-600 rounded-full"></div> Package Manifest
                         </h4>
                         
                         <div className="space-y-4 max-h-[440px] overflow-y-auto pr-4 custom-scrollbar group/items">
                            {order.products.map((item, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                                 <div className="flex items-center gap-6">
                                    <div className="relative">
                                       <img 
                                          src={item.product?.image || item.product?.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'} 
                                          className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-slate-50 shadow-inner" 
                                          alt={item.product?.name}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                          }}
                                       />
                                       <span className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xl ring-4 ring-white">
                                          x{item.quantity}
                                       </span>
                                    </div>
                                    <div>
                                       <p className="text-base font-black text-slate-900 mb-1">{item.product?.name || 'Restricted Product'}</p>
                                       <div className="flex items-center gap-3">
                                          <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-md border border-slate-100">{item.product?.brandName || 'Store Brand'}</span>
                                          <p className="text-sm font-bold text-slate-400 tracking-tight">${item.price} per unit</p>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Item Total</p>
                                    <p className="text-xl font-black text-indigo-600 tracking-tight">${(item.price * item.quantity).toFixed(2)}</p>
                                 </div>
                              </div>
                            ))}
                         </div>

                         {/* Quick Summary Bar */}
                         <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                            <button 
                               onClick={() => generateInvoice(order)}
                               className="px-10 py-5 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-300 flex items-center gap-4 group"
                            >
                               <FileText size={20} className="group-hover:rotate-12 transition-transform" /> 
                               Generate Invoice
                            </button>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Order Value</p>
                               <p className="text-4xl font-black text-slate-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Modification Footer */}
                  <div className="p-8 bg-[#fdfdfe] border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${status.bg} ${status.color} border-b-4 ${status.border.replace('border-', 'border-b-')}`}>
                            <StatusIcon size={28} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Logistics Status</p>
                            <p className={`text-xl font-black uppercase tracking-tighter ${status.color}`}>{order.status}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {order.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                            className="flex-1 sm:flex-none px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                          >
                            <Truck size={20} /> Deploy Shipment
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button 
                            onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                            className="flex-1 sm:flex-none px-10 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                          >
                            <CheckCircle size={20} /> Register Delivery
                          </button>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <button 
                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                            className="flex-1 sm:flex-none px-10 py-5 bg-white border-2 border-rose-100 text-rose-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                          >
                            <XCircle size={20} /> Abort Shipment
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
               <div className="w-32 h-32 bg-[#f8fafc] text-slate-200 rounded-full flex items-center justify-center text-6xl mb-8 shadow-inner">
                 📦
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Zero Orders Detected</h3>
               <p className="text-slate-500 font-bold max-w-sm text-center mt-3 text-lg">
                 {searchQuery 
                    ? `No current manifest items match the signature "${searchQuery}" in the ${filterStatus} register.`
                    : "The dispatch queue is currently empty. Check back later for incoming requests."}
               </p>
               {searchQuery && (
                 <button 
                  onClick={() => {setSearchQuery(''); setFilterStatus('All');}}
                  className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                 >
                   Reset Search Manifest
                 </button>
               )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
