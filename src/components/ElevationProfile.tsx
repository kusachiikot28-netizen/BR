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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-24 md:bottom-6 left-6 right-6 md:left-[344px] md:right-6 h-36 md:h-48 hw-card p-4 md:p-6 shadow-2xl z-[1006]"
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="hw-label flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-hw-accent animate-pulse" />
          Профиль высот
        </h3>
        <div className="flex gap-2 md:gap-4 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-hw-accent rounded-full" /> <span className="hidden xs:inline">Высота</span></span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-hw-danger rounded-full" /> <span className="hidden xs:inline">Повороты</span></span>
        </div>
      </div>

      <div className="w-full h-20 md:h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-hw-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-hw-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hw-border)" vertical={false} />
            <XAxis
              dataKey="distance"
              tickFormatter={formatX}
              stroke="var(--color-hw-label)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatY}
              stroke="var(--color-hw-label)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const elev = payload[0].value;
                  const dist = label;
                  
                  // Find if there's a marker near this distance
                  const marker = turnMarkers.find(m => m && Math.abs(m.x - dist) < 50);

                  return (
                    <div className="hw-card p-3 shadow-2xl min-w-[150px] border-hw-accent/30">
                      <p className="hw-label mb-2">
                        {formatX(dist)}
                      </p>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">Высота:</span>
                        <span className="text-xs font-bold text-white">{formatY(elev as number)}</span>
                      </div>
                      {marker && (
                        <div className="mt-2 pt-2 border-t border-hw-border">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded bg-hw-accent/20 flex items-center justify-center text-hw-accent">
                              {getInstructionIcon(marker.type)}
                            </div>
                            <span className="text-[10px] font-bold text-hw-accent uppercase tracking-wider">Манёвр</span>
                          </div>
                          <p className="text-[11px] text-gray-200 leading-tight">
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
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorElev)"
              animationDuration={1000}
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
