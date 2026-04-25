import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white pt-20 sm:pt-24 pb-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 sm:mb-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">PetCare</span>
            </div>
            <p className="text-gray-300 font-medium leading-relaxed max-w-xs">
              Your all-in-one companion for a happier, healthier pet life. From adoptions to emergency care, we're here for you.
            </p>
            <div className="flex gap-3">
              {[
                { label: 'fb', icon: '👤' },
                { label: 'tw', icon: '𝕏' },
                { label: 'ig', icon: '📸' }
              ].map(social => (
                <a 
                  key={social.label}
                  href="#" 
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-purple-900 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/50"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-blue-400 to-purple-400"></span>
              Platform
            </h4>
            <ul className="space-y-4">
              {['Home', 'Marketplace', 'Community', 'SOS Emergency', 'Pet Adoption'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-300 font-bold text-sm hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:bg-blue-400 transition-colors group-hover:scale-150"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-purple-400 to-pink-400"></span>
              Resources
            </h4>
            <ul className="space-y-4">
              {['About Us', 'Safety Center', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-300 font-bold text-sm hover:text-white transition-colors hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 flex flex-col justify-center hover:bg-white/15 transition-all duration-300">
            <h4 className="font-black text-white text-lg mb-2">Join our Pack 🐕</h4>
            <p className="text-gray-300 text-sm font-medium mb-6">Stay updated with pet care tips and latest adoption stories.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full px-5 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-white text-sm font-bold transition-all text-gray-900 placeholder-gray-500"
              />
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-black text-sm hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all active:scale-95 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">
                Subscribe →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 font-bold text-xs">
            &copy; {currentYear} PetCare Super App. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="tel:+1800PETCARE" className="text-gray-400 font-black text-xs hover:text-white transition-colors flex items-center gap-2 group">
              <span className="text-lg group-hover:scale-110 transition-transform">📞</span> +1-800-PET-CARE
            </a>
            <a href="mailto:hi@petcare.com" className="text-gray-400 font-black text-xs hover:text-white transition-colors flex items-center gap-2 group">
              <span className="text-lg group-hover:scale-110 transition-transform">✉️</span> hi@petcare.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
