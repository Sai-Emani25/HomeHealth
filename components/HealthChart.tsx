
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TelemetryPoint } from '../types';

interface HealthChartProps {
  data: TelemetryPoint[];
  metric: 'hr' | 'glucose' | 'spO2';
  color: string;
}

const HealthChart: React.FC<HealthChartProps> = ({ data, metric, color }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#94a3b8'}}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#94a3b8'}}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey={metric} 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#color${metric})`} 
            strokeWidth={3}
          />
          {metric === 'glucose' && (
            <Line 
              type="monotone" 
              dataKey="predictedGlucose" 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              name="24h Prediction"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
