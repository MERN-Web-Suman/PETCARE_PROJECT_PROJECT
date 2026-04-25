import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { PawPrint, Bone, Dog, Cat, Menu, X, ChevronRight, ShoppingBag, Heart, ListCheck, Home, Users, MapPin, Stethoscope, AlertCircle, Bell } from "lucide-react";
import { useToast } from "../components/Toast";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useWishlist();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { path: "/adoption", label: "Adoption", icon: <Heart className="w-4 h-4" /> },
    { path: "/community", label: "Community", icon: <Users className="w-4 h-4" /> },
    { path: "/lost-found", label: "Lost & Found", icon: <MapPin className="w-4 h-4" /> },
    { path: "/clinics", label: "Clinic", icon: <Stethoscope className="w-4 h-4" /> },
    {
      label: "Mart",
      icon: <ShoppingBag className="w-4 h-4" />,
      dropdown: [
        { path: "/mart", label: "Explore Mart", icon: <ShoppingBag className="w-4 h-4" /> },
        { path: "/orders", label: "My Orders", icon: <ListCheck className="w-4 h-4" /> },
        { path: "/cart", label: "Cart", icon: <ShoppingBag className="w-4 h-4" /> },
        { path: "/wishlist", label: "My Wishlist", icon: <Heart className="w-4 h-4" /> }
      ]
    },
    { path: "/sos", label: "SOS", icon: <AlertCircle className="w-4 h-4" /> },
    { path: "/notices", label: "Notice", icon: <Bell className="w-4 h-4" /> }
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully. See you soon! 👋");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-primary shadow-lg border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white font-black text-xl sm:text-2xl hover:opacity-80 transition-opacity">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <span className="tracking-tighter">PetCare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-8 flex-1 justify-center items-center px-10">
              {navLinks.map(link =>
                link.dropdown ? (
                  <div key={link.label} className="relative group py-2">
                    <button className={`flex items-center gap-1.5 text-white font-bold transition-all ${
                      link.dropdown.some(d => isActive(d.path))
                        ? "opacity-100 scale-105"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}>
                      {link.label}
                      <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#0f1016]/95 rounded-2xl shadow-2xl py-3 border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col backdrop-blur-2xl">
                      <div className="absolute -top-4 left-0 w-full h-4"></div>
                      {link.dropdown.map(dropItem => (
                        <Link
                          key={dropItem.path}
                          to={dropItem.path}
                          className={`px-5 py-3 hover:bg-white/10 transition-colors font-bold text-sm flex items-center gap-3 ${
                            isActive(dropItem.path) ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="text-primary-400">{dropItem.icon}</span>
                          {dropItem.label}
                          {dropItem.path === '/wishlist' && wishlist.length > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-red-200 animate-pulse">
                              {wishlist.length}
                            </span>
                          )}
                          {dropItem.path === '/cart' && cartCount > 0 && (
                            <span className="ml-auto bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-indigo-200">
                              {cartCount}
                            </span>
                          )}
                          {isActive(dropItem.path) && dropItem.path !== '/wishlist' && dropItem.path !== '/cart' && <div className="ml-auto w-1.5 h-1.5 bg-primary-400 rounded-full"></div>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-white font-bold transition-all relative group ${
                      isActive(link.path) ? "opacity-100" : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {link.label}
                    <div className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
                  </Link>
                )
              )}
            </div>

            {/* Right: Auth + Hamburger */}
            <div className="flex gap-3 items-center">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 backdrop-blur-sm group"
                    >
                      <Bell className={`w-5 h-5 transition-transform ${isNotifOpen ? 'scale-110' : 'group-hover:rotate-12'}`} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0f1016] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      )}
                    </button>
                    {isNotifOpen && (
                      <div className="fixed sm:absolute top-[72px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-0 sm:mt-4 w-auto sm:w-80 bg-[#0f1016]/95 rounded-2xl shadow-2xl border border-white/10 flex flex-col z-[100] animate-fade-in sm:origin-top-right backdrop-blur-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                          <span className="text-white font-black text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-wider text-primary-400 hover:text-white transition-colors">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-[320px] overflow-y-auto w-full custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center gap-2">
                              <Bell className="w-8 h-8 text-white/20" />
                              <p className="text-gray-400 text-xs font-bold mt-2">No new notifications</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                className={`p-4 border-b border-white/5 flex gap-4 transition-colors cursor-pointer ${
                                  notif.isRead ? 'bg-transparent hover:bg-white/5' : 'bg-primary-500/10 hover:bg-primary-500/20'
                                }`}
                              >
                                <div className="text-xl shrink-0 mt-0.5">
                                  {notif.type === 'appointment' ? '🐶' : notif.type === 'order' ? '🛍️' : '🔔'}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold truncate pr-3 ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                                      {notif.title}
                                    </h4>
                                    {!notif.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />}
                                  </div>
                                  <p className={`text-xs leading-relaxed line-clamp-2 ${notif.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                                    {notif.message}
                                  </p>
                                  <span className="text-[9px] text-gray-500 font-bold mt-2 uppercase tracking-wide">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button

                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/20 group backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-sm tracking-wide truncate max-w-[100px]">{user?.name || 'User'}</span>
                    <svg className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-[#0f1016]/95 rounded-2xl shadow-2xl py-2 border border-white/10 flex flex-col z-50 animate-fade-in origin-top-right backdrop-blur-2xl">
                      <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex flex-col gap-1">
                        <span className="text-white font-black text-base">{user.name || 'User'}</span>
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest truncate">{user.email}</span>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        {[
                          { to: "/dashboard", icon: <Bone className="text-indigo-400" />, label: "Dashboard" },
                          { to: "/appointments", icon: <Dog className="text-yellow-500" />, label: "Appointments" },
                          { to: "/pet-appointments", icon: <Home className="text-orange-400" />, label: "Adopt Appointments" },
                          { to: "/cart", icon: <ShoppingBag className="text-green-400" />, label: "My Cart" }
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all font-bold text-sm group">
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            {item.label}
                            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-white/5 mt-1">
                        <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all font-bold text-sm group">
                          <Cat className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <div className="hidden sm:flex gap-3">
                  <Link to="/login" className="px-6 py-2.5 text-white font-bold hover:bg-white/10 rounded-xl transition-all text-sm">Login</Link>
                  <Link to="/register" className="px-6 py-2.5 bg-white text-primary-600 rounded-xl font-black text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">Join Us</Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ──────── Mobile Drawer ──────── */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={closeMobile}
          />

          {/* Drawer panel */}
          <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '80%', maxWidth: '320px', background: 'linear-gradient(160deg, #0f0f1a 0%, #111827 50%, #0c0c18 100%)', display: 'flex', flexDirection: 'column', overflowY: 'hidden', boxShadow: '-8px 0 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>

            {/* Accent top bar */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <Link to="/" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 900, fontSize: '18px', textDecoration: 'none' }}>
                <PawPrint style={{ width: 20, height: 20, color: '#818cf8' }} /> PetCare
              </Link>
              <button onClick={closeMobile} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Links */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', background: 'transparent' }}>
              {(() => {
                // Per-link icon colors for regular links
                const iconColors = {
                  '/':         { bg: 'rgba(99,102,241,0.18)',  color: '#818cf8' },
                  '/adoption': { bg: 'rgba(236,72,153,0.18)',  color: '#f472b6' },
                  '/community':{ bg: 'rgba(34,197,94,0.18)',   color: '#4ade80' },
                  '/lost-found':{ bg: 'rgba(251,146,60,0.18)', color: '#fb923c' },
                  '/clinics':  { bg: 'rgba(20,184,166,0.18)',  color: '#2dd4bf' },
                  '/sos':      { bg: 'rgba(239,68,68,0.18)',   color: '#f87171' },
                  '/notices':  { bg: 'rgba(234,179,8,0.18)',   color: '#facc15' },
                };
                // Per-dropdown-item icon colors
                const dropColors = {
                  '/mart':     { bg: 'rgba(99,102,241,0.18)',  color: '#818cf8' },
                  '/orders':   { bg: 'rgba(20,184,166,0.18)',  color: '#2dd4bf' },
                  '/cart':     { bg: 'rgba(34,197,94,0.18)',   color: '#4ade80' },
                  '/wishlist': { bg: 'rgba(236,72,153,0.18)',  color: '#f472b6' },
                };

                return navLinks.map((link, idx) =>
                  link.dropdown ? (
                    <div key={idx}>
                      <p style={{ padding: '16px 16px 6px', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{link.label}</p>
                      {link.dropdown.map(dropItem => {
                        const dc = dropColors[dropItem.path] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
                        const active = isActive(dropItem.path);
                        return (
                          <Link
                            key={dropItem.path}
                            to={dropItem.path}
                            onClick={closeMobile}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 14px', borderRadius: 14, textDecoration: 'none',
                              fontSize: 14, fontWeight: 700, marginBottom: 3,
                              color: active ? 'white' : 'rgba(255,255,255,0.75)',
                              background: active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.03)',
                              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: dc.bg, color: dc.color, flexShrink: 0 }}>
                              {dropItem.icon}
                            </span>
                            <span style={{ flex: 1, letterSpacing: '0.01em' }}>{dropItem.label}</span>
                            {dropItem.path === '/wishlist' && wishlist.length > 0 && (
                              <span style={{ background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 999, boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>{wishlist.length}</span>
                            )}
                            {dropItem.path === '/cart' && cartCount > 0 && (
                              <span style={{ background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 999, boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}>{cartCount}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (() => {
                    const lc = iconColors[link.path] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMobile}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 14, textDecoration: 'none',
                          fontSize: 14, fontWeight: 700, marginBottom: 3,
                          color: active ? 'white' : 'rgba(255,255,255,0.75)',
                          background: active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.03)',
                          border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: lc.bg, color: lc.color, flexShrink: 0 }}>
                          {link.icon}
                        </span>
                        <span style={{ letterSpacing: '0.01em' }}>{link.label}</span>
                      </Link>
                    );
                  })()
                );
              })()}
            </div>

            {/* User section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to="/dashboard" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 14, flexShrink: 0 }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.2)' }} />
                  </Link>
                  <Link to="/appointments" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <Dog style={{ width: 16, height: 16 }} /> Appointments
                  </Link>
                  <Link to="/pet-appointments" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <Home style={{ width: 16, height: 16 }} /> Adopt Appointments
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                  >
                    <Cat style={{ width: 16, height: 16 }} /> Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to="/login" onClick={closeMobile} style={{ flex: 1, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Login</Link>
                  <Link to="/register" onClick={closeMobile} style={{ flex: 1, padding: '12px', textAlign: 'center', background: 'white', color: 'black', borderRadius: 12, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
