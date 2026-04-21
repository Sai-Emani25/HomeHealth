import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  color: string; // Tailwind class like "emerald"
  hexColor: string; // Hex for chart
  data: any[];
  dataKey: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon, color, hexColor, data, dataKey }) => {
  // Extract last 12 points for the sparkline
  const sparkData = data.slice(-12);

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</span>
          <div className="flex items-baseline justify-end gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{value}</span>
            <span className="text-[10px] font-bold text-slate-500">{unit}</span>
          </div>
        </div>
      </div>
      
      <div className="h-14 w-full -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hexColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={hexColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={hexColor} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill={`url(#gradient-${dataKey})`}
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCard;