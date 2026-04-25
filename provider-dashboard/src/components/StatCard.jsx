import React from 'react';

export default function StatCard({ icon, title, value, trend, color = 'blue' }) {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50/50', border: 'border-blue-100', accent: 'bg-blue-600',
      text: 'text-blue-900', subtext: 'text-blue-600/70',
      iconBg: 'bg-blue-100 text-blue-600', shadow: 'shadow-blue-200/50'
    },
    green: {
      bg: 'bg-emerald-50/50', border: 'border-emerald-100', accent: 'bg-emerald-600',
      text: 'text-emerald-900', subtext: 'text-emerald-600/70',
      iconBg: 'bg-emerald-100 text-emerald-600', shadow: 'shadow-emerald-200/50'
    },
    red: {
      bg: 'bg-rose-50/50', border: 'border-rose-100', accent: 'bg-rose-600',
      text: 'text-rose-900', subtext: 'text-rose-600/70',
      iconBg: 'bg-rose-100 text-rose-600', shadow: 'shadow-rose-200/50'
    },
    purple: {
      bg: 'bg-violet-50/50', border: 'border-violet-100', accent: 'bg-violet-600',
      text: 'text-violet-900', subtext: 'text-violet-600/70',
      iconBg: 'bg-violet-100 text-violet-600', shadow: 'shadow-violet-200/50'
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;
  const trendColor = trend > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`${scheme.bg} ${scheme.border} border-2 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-lg ${scheme.shadow} hover:scale-105 transition-all duration-300 group`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className={`${scheme.subtext} text-[9px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-3`}>{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black ${scheme.text} tracking-tight`}>{value}</h3>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 mt-2 sm:mt-4 text-[10px] sm:text-xs font-bold ${trendColor}`}>
              <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/50 shadow-sm">
                {trend > 0 ? '↑' : '↓'}
              </span>
              <span className="hidden sm:inline">{Math.abs(trend)}% from last month</span>
              <span className="sm:hidden">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`${scheme.iconBg} w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center text-xl sm:text-2xl lg:text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-500 flex-shrink-0 ml-2`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 sm:h-1.5 w-8 sm:w-12 ${scheme.accent} rounded-full mt-3 sm:mt-6 opacity-30 group-hover:w-full transition-all duration-500`} />
    </div>
  );
}
