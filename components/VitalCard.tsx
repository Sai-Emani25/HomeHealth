
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { VitalSign } from '../types';

interface VitalCardProps {
  vital: VitalSign;
  icon: React.ReactNode;
}

const VitalCard: React.FC<VitalCardProps> = ({ vital, icon }) => {
  const isCritical = vital.status === 'critical';

  const statusColors = {
    normal: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-100',
      accent: '#10b981',
      fill: '#d1fae5'
    },
    warning: {
      text: 'text-amber-500',
      bg: 'bg-amber-50/40',
      border: 'border-amber-100',
      accent: '#f59e0b',
      fill: '#fef3c7'
    },
    critical: {
      text: 'text-rose-600',
      bg: 'bg-rose-50/60',
      border: 'border-rose-200',
      accent: '#e11d48',
      fill: '#ffe4e6'
    }
  }[vital.status];

  // Format history for Recharts
  const chartData = vital.history.map((val, i) => ({ val, i }));

  return (
    <div className={`relative overflow-hidden p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${statusColors.bg} ${statusColors.border} glass backdrop-blur-2xl flex flex-col justify-between h-[220px]`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100 ${statusColors.text}`}>
              {icon}
            </div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{vital.label}</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border border-white text-[10px] font-black uppercase tracking-widest ${statusColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'}`}></span>
            Live
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-black tracking-tighter tabular-nums ${isCritical ? 'text-rose-700' : 'text-slate-900'}`}>
            {vital.value % 1 === 0 ? vital.value : vital.value.toFixed(1)}
          </span>
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{vital.unit}</span>
        </div>
      </div>

      {/* Dynamic Sparkline Graph */}
      <div className="absolute inset-x-0 bottom-0 h-24 opacity-60 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${vital.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={statusColors.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={statusColors.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Area
              type="monotone"
              dataKey="val"
              stroke={statusColors.accent}
              strokeWidth={3}
              fill={`url(#grad-${vital.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 flex justify-between items-center mt-auto pt-4 border-t border-slate-200/20">
        <div className="flex items-center gap-2">
           <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors.text}`}>
             {vital.trend === 'up' ? 'Trending Up' : vital.trend === 'down' ? 'Trending Down' : 'Stable'}
           </span>
        </div>
        <div className="text-[14px] font-black">
          {vital.trend === 'up' ? '↗' : vital.trend === 'down' ? '↘' : '→'}
        </div>
      </div>
    </div>
  );
};

export default VitalCard;
