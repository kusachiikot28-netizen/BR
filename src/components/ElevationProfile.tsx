import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { ElevationData, RouteStep } from '../types';
import { motion } from 'motion/react';
import { Navigation, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowUp, RotateCw, LogOut, RefreshCw, Flag, Play } from 'lucide-react';

interface ElevationProfileProps {
  data: ElevationData[];
  instructions?: RouteStep[];
}

export default function ElevationProfile({ data, instructions }: ElevationProfileProps) {
  if (data.length === 0) return null;

  const formatX = (val: number) => (val / 1000).toFixed(1) + ' км';
  const formatY = (val: number) => val + ' м';

  const turnMarkers = instructions?.map((step, i) => {
    const pointIndex = step.way_points[0];
    const elevationPoint = data[pointIndex];
    if (!elevationPoint) return null;

    return {
      ...step,
      x: elevationPoint.distance,
      y: elevationPoint.elevation,
      id: i
    };
  }).filter(Boolean) || [];

  const getInstructionIcon = (type: number) => {
    switch (type) {
      case 0: return <ArrowLeft className="w-3 h-3" />;
      case 1: return <ArrowRight className="w-3 h-3" />;
      case 6: return <ArrowUp className="w-3 h-3" />;
      case 10: return <Flag className="w-3 h-3" />;
      case 11: return <Play className="w-3 h-3" />;
      default: return <Navigation className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full h-40 md:h-56 glass-panel p-5 md:p-8 rounded-3xl relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-hw-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-hw-accent shadow-[0_0_10px_rgba(0,242,255,0.8)] animate-pulse" />
          <h3 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90">
            Профиль высот
          </h3>
        </div>
        <div className="flex gap-4 md:gap-6 text-[9px] font-black uppercase tracking-[0.15em] text-hw-label">
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-hw-accent rounded-full shadow-[0_0_5px_rgba(0,242,255,0.5)]" /> <span className="hidden xs:inline">Высота</span></span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-hw-danger rounded-full shadow-[0_0_5px_rgba(255,45,85,0.5)]" /> <span className="hidden xs:inline">Повороты</span></span>
        </div>
      </div>

      <div className="w-full h-24 md:h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-hw-accent)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-hw-accent)" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="distance"
              tickFormatter={formatX}
              stroke="rgba(255,255,255,0.2)"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tickFormatter={formatY}
              stroke="rgba(255,255,255,0.2)"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              dx={-10}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-hw-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const elev = payload[0].value;
                  const dist = label;
                  
                  // Find if there's a marker near this distance
                  const marker = turnMarkers.find(m => m && Math.abs(m.x - dist) < 50);

                  return (
                    <div className="glass-panel p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[180px] border-hw-accent/20">
                      <p className="hw-label mb-3 text-hw-accent">
                        {formatX(dist)}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Высота:</span>
                        <span className="text-sm font-mono font-black text-white">{formatY(elev as number)}</span>
                      </div>
                      {marker && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-hw-accent/10 flex items-center justify-center text-hw-accent border border-hw-accent/20">
                              {getInstructionIcon(marker.type)}
                            </div>
                            <span className="text-[10px] font-black text-hw-accent uppercase tracking-[0.2em] italic">Манёвр</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                            {marker.instruction}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="var(--color-hw-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorElev)"
              animationDuration={1500}
              filter="url(#glow)"
            />
            {turnMarkers.map((m) => m && (
              <ReferenceDot
                key={m.id}
                x={m.x}
                y={m.y}
                r={4}
                fill="var(--color-hw-danger)"
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
