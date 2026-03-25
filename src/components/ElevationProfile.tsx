import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ElevationData } from '../types';
import { motion } from 'motion/react';

interface ElevationProfileProps {
  data: ElevationData[];
}

export default function ElevationProfile({ data }: ElevationProfileProps) {
  if (data.length === 0) return null;

  const formatX = (val: number) => (val / 1000).toFixed(1) + ' км';
  const formatY = (val: number) => val + ' м';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-6 left-86 right-6 h-48 bg-[#151619]/90 backdrop-blur-md border border-[#2a2b2e] rounded-2xl p-6 shadow-2xl z-40"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
          Профиль высот
        </h3>
        <div className="flex gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Высота</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> Градиент</span>
        </div>
      </div>

      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" vertical={false} />
            <XAxis
              dataKey="distance"
              tickFormatter={formatX}
              stroke="#4b5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatY}
              stroke="#4b5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1c1d21', border: '1px solid #2a2b2e', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
              labelFormatter={formatX}
              formatter={(val: number) => [formatY(val), 'Высота']}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorElev)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
