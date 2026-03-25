import { 
  Bike, MapPin, Trash2, Plus, Navigation, TrendingUp, Clock, Ruler, 
  ChevronRight, Settings, Info, Coffee, Search, Cloud, Wind as WindIcon, 
  FileText, Download, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, 
  ArrowUp, RotateCw, LogOut, RefreshCw, Flag, Play, List, Map as MapIcon, X
} from 'lucide-react';
import { BikeType, RoutePoint, RouteInfo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useMemo } from 'react';
import { searchLocation } from '../services/geocoding';
import { WeatherInfo } from '../services/weather';
import { exportToGPX } from '../services/export';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  points: RoutePoint[];
  bikeType: BikeType;
  route?: RouteInfo;
  selectedRouteIndex: number;
  showPOIs: boolean;
  weather: WeatherInfo | null;
  onAddPoint: (point: RoutePoint) => void;
  onUpdatePoint: (index: number, point: RoutePoint) => void;
  onRemovePoint: (index: number) => void;
  onBikeTypeChange: (type: BikeType) => void;
  onSelectRoute: (index: number) => void;
  onTogglePOIs: () => void;
  onClear: () => void;
  onStartNavigation: () => void;
  onClose?: () => void;
}

export default function Sidebar({
  points,
  bikeType,
  route,
  selectedRouteIndex,
  showPOIs,
  weather,
  onAddPoint,
  onUpdatePoint,
  onRemovePoint,
  onBikeTypeChange,
  onSelectRoute,
  onTogglePOIs,
  onClear,
  onStartNavigation,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RoutePoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [view, setView] = useState<'points' | 'instructions'>('points');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectResult = (point: RoutePoint) => {
    onAddPoint(point);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getInstructionIcon = (type: number) => {
    switch (type) {
      case 0: return <ArrowLeft className="w-3 h-3" />; // Left
      case 1: return <ArrowRight className="w-3 h-3" />; // Right
      case 2: return <ArrowLeft className="w-3 h-3" />; // Sharp left
      case 3: return <ArrowRight className="w-3 h-3" />; // Sharp right
      case 4: return <ArrowUpLeft className="w-3 h-3" />; // Slight left
      case 5: return <ArrowUpRight className="w-3 h-3" />; // Slight right
      case 6: return <ArrowUp className="w-3 h-3" />; // Straight
      case 7: return <RotateCw className="w-3 h-3" />; // Enter roundabout
      case 8: return <LogOut className="w-3 h-3" />; // Exit roundabout
      case 9: return <RefreshCw className="w-3 h-3" />; // U-turn
      case 10: return <Flag className="w-3 h-3" />; // Goal
      case 11: return <Play className="w-3 h-3" />; // Depart
      case 12: return <ArrowUpLeft className="w-3 h-3" />; // Keep left
      case 13: return <ArrowUpRight className="w-3 h-3" />; // Keep right
      default: return <Navigation className="w-3 h-3" />;
    }
  };
  const bikeOptions: { label: string; value: BikeType }[] = [
    { label: 'Шоссейный', value: 'road' },
    { label: 'Горный', value: 'mountain' },
    { label: 'Гибрид', value: 'hybrid' },
    { label: 'Электро', value: 'electric' },
  ];

  const currentRoute = useMemo(() => {
    if (!route) return undefined;
    if (route.alternatives && selectedRouteIndex > 0) {
      return route.alternatives[selectedRouteIndex - 1];
    }
    return route;
  }, [route, selectedRouteIndex]);

  const formatDistance = (m: number) => (m / 1000).toFixed(1) + ' км';
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
  };

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed md:relative inset-y-0 left-0 w-full md:w-80 h-full bg-[#151619] text-white flex flex-col border-r border-[#2a2b2e] shadow-2xl z-[100] md:z-50"
    >
      {/* Header & Search */}
      <div className="p-6 space-y-4 bg-[#1c1d21] border-b border-[#2a2b2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Bike className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">VeloRoute</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Bicycle Navigation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#2a2b2e] rounded-lg transition-colors text-gray-400">
              <Settings className="w-5 h-5" />
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="md:hidden p-2 hover:bg-[#2a2b2e] rounded-lg transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск места..."
            className="w-full bg-[#2a2b2e] border border-[#3a3b3e] rounded-xl py-3 px-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-gray-600"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute left-6 right-6 mt-1 bg-[#1c1d21] border border-[#2a2b2e] rounded-xl shadow-2xl z-[60] overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-[#2a2b2e] transition-colors border-b border-[#2a2b2e] last:border-0 flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{result.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bike Type Selector */}
      <div className="px-6 py-4 bg-[#151619] border-b border-[#2a2b2e]">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {bikeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onBikeTypeChange(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold transition-all border uppercase tracking-widest font-mono whitespace-nowrap",
                bikeType === option.value
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                  : "bg-[#1c1d21] border-[#2a2b2e] text-gray-500 hover:border-gray-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2b2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('points')}
              className={cn(
                "text-[10px] uppercase tracking-widest font-mono flex items-center gap-2 transition-colors",
                view === 'points' ? "text-white font-bold" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <MapPin className="w-3 h-3" /> Точки
            </button>
            {currentRoute && (
              <button 
                onClick={() => setView('instructions')}
                className={cn(
                  "text-[10px] uppercase tracking-widest font-mono flex items-center gap-2 transition-colors",
                  view === 'instructions' ? "text-white font-bold" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <List className="w-3 h-3" /> Инструкции
              </button>
            )}
          </div>
          <button onClick={onClear} className="text-[10px] text-red-500 hover:underline uppercase tracking-widest font-mono">
            Очистить
          </button>
        </div>

        <div className="space-y-3 relative">
          <AnimatePresence mode="wait">
            {view === 'points' ? (
              <motion.div
                key="points"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {points.map((point, i) => (
                  <div 
                    key={i} 
                    className="group flex items-center gap-3 p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-xl hover:border-gray-700 transition-all"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold",
                      i === 0 ? "bg-blue-600/20 text-blue-500" : 
                      i === points.length - 1 ? "bg-red-600/20 text-red-500" : 
                      "bg-gray-800 text-gray-400"
                    )}>
                      {i === 0 ? 'A' : i === points.length - 1 ? 'B' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-gray-200">{point.label || (i === 0 ? 'Старт' : i === points.length - 1 ? 'Финиш' : `Точка ${i + 1}`)}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </p>
                    </div>
                    <button 
                      onClick={() => onRemovePoint(i)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {points.length < 5 && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="w-full py-4 border-2 border-dashed border-[#2a2b2e] rounded-xl text-gray-600 hover:text-gray-400 hover:border-gray-700 transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" /> Добавить точку
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-2"
              >
                {currentRoute?.instructions.map((step, i) => (
                  <div 
                    key={i}
                    className="flex gap-3 p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-lg hover:border-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2a2b2e] flex items-center justify-center shrink-0 text-blue-400">
                      {getInstructionIcon(step.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-200 leading-tight mb-1">
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono uppercase tracking-wider">
                        <span>{formatDistance(step.distance)}</span>
                        {step.name && step.name !== '-' && (
                          <>
                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                            <span className="truncate">{step.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Route Info Summary */}
      {currentRoute && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 bg-[#1c1d21] border-t border-[#2a2b2e] space-y-4"
        >
          {/* Alternative Routes Switcher */}
          {route?.alternatives && route.alternatives.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <MapIcon className="w-3 h-3" /> Варианты маршрута
              </label>
              <div className="flex gap-2">
                {[route, ...route.alternatives].map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectRoute(i)}
                    className={cn(
                      "flex-1 py-2 rounded-md text-[10px] font-bold transition-all border uppercase tracking-widest font-mono",
                      selectedRouteIndex === i
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-[#2a2b2e] border-[#3a3b3e] text-gray-400 hover:border-gray-600"
                    )}
                  >
                    Вариант {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Ruler className="w-3 h-3" /> Дистанция
              </div>
              <div className="text-lg font-bold">{formatDistance(currentRoute.distance)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Clock className="w-3 h-3" /> Время
              </div>
              <div className="text-lg font-bold">{formatDuration(currentRoute.duration)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <TrendingUp className="w-3 h-3" /> Набор высоты
              </div>
              <div className="text-lg font-bold text-green-500">+{currentRoute.ascent} м</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                <Info className="w-3 h-3" /> Спуск
              </div>
              <div className="text-lg font-bold text-red-500">-{currentRoute.descent} м</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onStartNavigation}
              className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              ПОЕХАЛИ <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => exportToGPX(currentRoute)}
              className="py-4 bg-[#2a2b2e] hover:bg-[#3a3b3e] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              GPX <Download className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onClear}
            className="w-full py-2 text-[10px] text-gray-500 hover:text-red-500 uppercase tracking-widest font-mono transition-colors"
          >
            Очистить маршрут
          </button>
        </motion.div>
      )}

      {/* Weather Info */}
      {weather && (
        <div className="px-6 py-4 bg-[#151619] border-t border-[#2a2b2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Погода</p>
              <p className="text-xs font-bold">{weather.temp}°C • {weather.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <WindIcon className="w-4 h-4" />
            <span className="text-[10px] font-mono">{weather.windSpeed} м/с</span>
          </div>
        </div>
      )}

      {/* POI Toggle */}
      <div className="px-6 py-4 bg-[#1c1d21] border-t border-[#2a2b2e]">
        <button
          onClick={onTogglePOIs}
          className={cn(
            "w-full py-3 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest font-mono flex items-center justify-center gap-2",
            showPOIs
              ? "bg-orange-600/20 border-orange-500/50 text-orange-500"
              : "bg-[#2a2b2e] border-[#3a3b3e] text-gray-500 hover:border-gray-600"
          )}
        >
          <Coffee className="w-4 h-4" /> {showPOIs ? 'Скрыть POI' : 'Показать POI'}
        </button>
      </div>
    </motion.div>
  );
}
