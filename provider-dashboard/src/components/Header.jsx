import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Menu, Bell, ChevronDown, LogOut, Settings, User, Shield, Clock, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
export default function Header({ onMenuOpen }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false); // mobile search toggle
  const [location, setLocation] = useState({ city: '', state: '' });
  const [locLoading, setLocLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userEmail = localStorage.getItem('userEmail') || 'provider@example.com';
  const userName = userEmail.split('@')[0];
  const userInitial = userName.charAt(0).toUpperCase();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      setLocLoading(true);
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.region) {
            setLocation({ city: data.city, state: data.region });
            setLocLoading(false); return;
          }
        }
      } catch (e) {}
      try {
        const res = await fetch('http://ip-api.com/json');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.city) {
            setLocation({ city: data.city, state: data.regionName });
            setLocLoading(false); return;
          }
        }
      } catch (e) {}
      setLocation({ city: 'Unknown', state: '' });
      setLocLoading(false);
    };
    fetchLocation();
  }, []);
  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-3 sm:px-5 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">

          {/* ── Hamburger (mobile only) ── */}
          <button
            onClick={onMenuOpen}
            className="lg:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition text-gray-600"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ── Search Bar (hidden on mobile unless toggled) ── */}
          <div className={`${searchOpen ? 'flex' : 'hidden sm:flex'} flex-1 max-w-lg`}>
            <div className="w-full flex items-stretch rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all bg-gray-50">
              {/* Location pill */}
              <div className="hidden md:flex items-center gap-2 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-r border-gray-200 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <div className="flex flex-col leading-none py-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Location</span>
                  <span className="text-[11px] font-bold text-indigo-700">
                    {locLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse inline-block" />
                        Detecting…
                      </span>
                    ) : (
                      <>{location.city}{location.state ? `, ${location.state}` : ''}</>
                    )}
                  </span>
                </div>
              </div>
              {/* Search input */}
              <div className="flex items-center flex-1 px-3 gap-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 bg-transparent focus:outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
                  autoFocus={searchOpen}
                />
                {searchOpen && (
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Mobile Search Toggle ── */}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition text-gray-500"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* ── RIGHT SIDE ── */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* Live Clock — desktop only */}
            <div className="hidden xl:flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5 text-gray-800">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-black tabular-nums">{formatTime(currentTime)}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(currentTime)}</span>
            </div>
            <div className="hidden xl:block w-px h-8 bg-gray-200 mx-1" />

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition text-gray-500"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  style={{ animation: 'dropDown 0.2s ease' }}>
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span className="font-black text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-black">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition">
                        Mark all Read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-gray-400 font-bold text-sm">No new notifications</div>
                    ) : (
                      notifications.map(notif => {
                        const iconMap = { appointment: '📅', order: '🛍️', sos: '🚨' };
                        const icon = iconMap[notif.type] || '🔔';
                        const timeString = new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
                        return (
                          <div key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                          >
                            <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${notif.isRead ? 'font-medium text-gray-600' : 'font-black text-gray-900'}`}>{notif.title}</p>
                              <p className={`text-xs mt-0.5 ${notif.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>{notif.message}</p>
                              <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest">{timeString}</p>
                            </div>
                            {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synced Real-time</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1.5 rounded-2xl hover:bg-gray-100 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
                  {userInitial}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-black text-gray-800 leading-none capitalize">{userName}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Provider</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  style={{ animation: 'dropDown 0.2s ease' }}>

                  {/* Profile Header */}
                  <div className="px-5 py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-xl border-2 border-white/30 flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-base capitalize">{userName}</p>
                        <p className="text-blue-200 text-xs font-bold truncate">{userEmail}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-300">Active Session</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">My Profile</p>
                        <p className="text-[10px] text-gray-400 font-medium">View & edit your details</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group">
                      <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors flex-shrink-0">
                        <Settings className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Settings</p>
                        <p className="text-[10px] text-gray-400 font-medium">Preferences & security</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group">
                      <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                        <Shield className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Provider Verified</p>
                        <p className="text-[10px] text-gray-400 font-medium">Account status: Active</p>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
