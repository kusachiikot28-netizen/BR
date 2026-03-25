import { Bike, MapPin, Trash2, Plus, Navigation, TrendingUp, Clock, Ruler, ChevronRight, Settings, Info, Coffee } from 'lucide-react';
import { BikeType, RoutePoint, RouteInfo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  points: RoutePoint[];
  bikeType: BikeType;
  route?: RouteInfo;
  showPOIs: boolean;
  onAddPoint: (point: RoutePoint) => void;
  onUpdatePoint: (index: number, point: RoutePoint) => void;
  onRemovePoint: (index: number) => void;
  onBikeTypeChange: (type: BikeType) => void;
  onTogglePOIs: () => void;
  onClear: () => void;
  onStartNavigation: () => void;
}

export default function Sidebar({
  points,
  bikeType,
  route,
  showPOIs,
  onAddPoint,
  onUpdatePoint,
  onRemovePoint,
  onBikeTypeChange,
  onTogglePOIs,
  onClear,
  onStartNavigation,
}: SidebarProps) {
  const bikeOptions: { label: string; value: BikeType }[] = [
    { label: 'Шоссейный', value: 'road' },
    { label: 'Горный', value: 'mountain' },
    { label: 'Гибрид', value: 'hybrid' },
    { label: 'Электро', value: 'electric' },
  ];

  const formatDistance = (m: number) => (m / 1000).toFixed(1) + ' км';
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
  };

  return (
    <div className="w-80 h-full bg-[#151619] text-white flex flex-col border-r border-[#2a2b2e] shadow-2xl z-50">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2b2e]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">BikeRoute</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Navigator v1.0</p>
          </div>
        </div>
      </div>

      {/* Bike Type Selector */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <Bike className="w-3 h-3" /> Тип велосипеда
          </label>
          <button
            onClick={onTogglePOIs}
            className={cn(
              "flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono transition-colors",
              showPOIs ? "text-blue-500" : "text-gray-500"
            )}
          >
            <Coffee className="w-3 h-3" /> POI {showPOIs ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {bikeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onBikeTypeChange(opt.value)}
              className={cn(
                "px-3 py-2 rounded-md text-xs font-medium transition-all border",
                bikeType === opt.value
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                  : "bg-[#1c1d21] border-[#2a2b2e] text-gray-400 hover:border-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Points */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2b2e]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Маршрут
          </label>
          <button onClick={onClear} className="text-[10px] text-red-500 hover:underline uppercase tracking-widest font-mono">
            Очистить
          </button>
        </div>

        <div className="space-y-3 relative">
          {/* Vertical line connecting points */}
          {points.length > 1 && (
            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-[#2a2b2e] z-0" />
          )}

          <AnimatePresence mode="popLayout">
            {points.map((p, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 group z-10"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-md",
                  i === 0 ? "bg-green-600" : i === points.length - 1 ? "bg-red-600" : "bg-[#2a2b2e]"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 bg-[#1c1d21] border border-[#2a2b2e] rounded-md px-3 py-2 text-xs text-gray-300 truncate">
                  {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                </div>
                <button
                  onClick={() => onRemovePoint(i)}
                  className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {points.length < 10 && (
            <button
              onClick={() => onAddPoint({ lat: 55.7558, lng: 37.6173 })}
              className="w-full py-3 border-2 border-dashed border-[#2a2b2e] rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:text-blue-500 hover:border-blue-500/50 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Добавить точку</span>
            </button>
          )}
        </div>
      </div>

      {/* Route Info Summary */}
      {route && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 bg-[#1c1d21] border-t border-[#2a2b2e] space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Ruler className="w-3 h-3" /> Дистанция
              </div>
              <div className="text-lg font-bold">{formatDistance(route.distance)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Clock className="w-3 h-3" /> Время
              </div>
              <div className="text-lg font-bold">{formatDuration(route.duration)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <TrendingUp className="w-3 h-3" /> Набор высоты
              </div>
              <div className="text-lg font-bold text-green-500">+{route.ascent} м</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Info className="w-3 h-3" /> Спуск
              </div>
              <div className="text-lg font-bold text-red-500">-{route.descent} м</div>
            </div>
          </div>

          <button
            onClick={onStartNavigation}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            ПОЕХАЛИ <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
