import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, CalendarCheck, Stethoscope, Home, Package, Bell, ShoppingCart, BarChart3, LogOut } from 'lucide-react';

const colorClasses = {
  blue: { bgActive: 'bg-blue-500', textActive: 'text-white', bgHover: 'group-hover:bg-blue-500/20', textIcon: 'text-blue-400' },
  indigo: { bgActive: 'bg-indigo-500', textActive: 'text-white', bgHover: 'group-hover:bg-indigo-500/20', textIcon: 'text-indigo-400' },
  cyan: { bgActive: 'bg-cyan-500', textActive: 'text-white', bgHover: 'group-hover:bg-cyan-500/20', textIcon: 'text-cyan-400' },
  teal: { bgActive: 'bg-teal-500', textActive: 'text-white', bgHover: 'group-hover:bg-teal-500/20', textIcon: 'text-teal-400' },
  violet: { bgActive: 'bg-violet-500', textActive: 'text-white', bgHover: 'group-hover:bg-violet-500/20', textIcon: 'text-violet-400' },
  amber: { bgActive: 'bg-amber-500', textActive: 'text-white', bgHover: 'group-hover:bg-amber-500/20', textIcon: 'text-amber-400' },
  orange: { bgActive: 'bg-orange-500', textActive: 'text-white', bgHover: 'group-hover:bg-orange-500/20', textIcon: 'text-orange-400' },
  rose: { bgActive: 'bg-rose-500', textActive: 'text-white', bgHover: 'group-hover:bg-rose-500/20', textIcon: 'text-rose-400' },
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard',           label: 'Dashboard',      icon: LayoutDashboard,  color: 'blue' },
    { path: '/manage-appointments', label: 'Appointments',   icon: CalendarCheck,    color: 'indigo' },
    { path: '/vet-clinic',          label: 'Vet Clinic',     icon: Stethoscope,      color: 'cyan' },
    { path: '/inventory',           label: 'Inventory',      icon: Package,          color: 'violet' },
    { path: '/notices',             label: 'Notices',        icon: Bell,             color: 'amber' },
    { path: '/orders',              label: 'Orders',         icon: ShoppingCart,     color: 'orange' },
    { path: '/analytics',           label: 'Analytics',      icon: BarChart3,        color: 'rose' },
    { path: '/pet-appointments',    label: 'Pet Appointments', icon: Home,             color: 'orange' },
  ];

  const userEmail = localStorage.getItem('userEmail') || 'provider@example.com';
  const userName = userEmail.split('@')[0];

  // Close on route change (mobile)
  useEffect(() => { onClose?.(); }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 100%)' }}>

      {/* Logo Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black text-white border border-white/20 shadow-inner">
              🐾
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">PetCare</h1>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Provider Panel</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <p className="text-blue-400/70 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-3">Main Navigation</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const c = colorClasses[item.color] || colorClasses.blue;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-white text-gray-900 shadow-lg shadow-black/20 font-black'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? c.bgActive + ' shadow-md' : 'bg-white/5 ' + c.bgHover
                  }`}>
                    <Icon className={`w-4 h-4 ${active ? c.textActive : c.textIcon}`} />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                  {active && (
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${c.bgActive}`} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition-all font-black text-sm uppercase tracking-widest border border-white/10 hover:border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — always visible on lg+ */}
      <div className="hidden lg:flex w-64 fixed left-0 top-0 h-screen z-40 flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar — slide-in drawer with animation */}
      <div
        className={`lg:hidden fixed inset-0 z-[9999] transition-all duration-300 ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        {/* Drawer — slides in from left */}
        <div
          className={`absolute top-0 left-0 h-full w-72 z-10 transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
