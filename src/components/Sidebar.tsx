import { 
  Bike, MapPin, Trash2, Plus, Navigation, TrendingUp, Clock, Ruler, 
  ChevronRight, Settings, Info, Coffee, Search, Cloud, Wind as WindIcon, 
  FileText, Download, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, 
  ArrowUp, RotateCw, LogOut, RefreshCw, Flag, Play, List, Map as MapIcon, X,
  Layers, Share2, Shield, AlertTriangle, Battery, Bell, Activity
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
  activeTab?: 'route' | 'guide';
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
  activeTab = 'route',
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
    { label: 'Шоссе', value: 'road' },
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
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
  };

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed md:relative top-0 bottom-20 md:bottom-0 left-0 w-full md:w-96 h-auto md:h-full flex flex-col z-[1005] md:z-50 transition-all duration-500"
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none relative">
        <div className="absolute inset-0 bg-hw-bg/40 backdrop-blur-2xl -z-10" />
        
        {/* View Toggle (Route vs Guide) */}
        <div className="flex glass-panel p-1.5 rounded-2xl">
          <button 
            onClick={() => setView('points')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              view === 'points' ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-white/40 hover:text-white/60"
            )}
          >
            Маршрут
          </button>
          <button 
            onClick={() => setView('instructions')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              view === 'instructions' ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-white/40 hover:text-white/60"
            )}
          >
            Гайд
          </button>
        </div>

        {view === 'points' ? (
          <>
            {/* Points List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase italic text-white/90">Точки маршрута</h3>
                <button onClick={onClear} className="text-[8px] text-hw-danger uppercase font-black tracking-widest hover:opacity-80 transition-opacity">Очистить</button>
              </div>
              <div className="space-y-3">
                {points.length === 0 ? (
                  <div className="hw-card p-8 border-dashed border-hw-border/50 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                    <MapPin className="w-8 h-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Нажмите на карту,<br/>чтобы добавить точку</p>
                  </div>
                ) : (
                  points.map((point, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hw-card p-4 flex items-center gap-4 group hover:border-hw-accent/30 transition-all"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-black",
                        i === 0 ? "bg-hw-accent/20 text-hw-accent border border-hw-accent/30" : 
                        i === points.length - 1 ? "bg-hw-danger/20 text-hw-danger border border-hw-danger/30" : 
                        "bg-white/5 text-white/40 border border-white/10"
                      )}>
                        {i === 0 ? 'A' : i === points.length - 1 ? 'B' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-tight truncate text-white/80">{point.label || `Точка ${i + 1}`}</p>
                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-0.5">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:text-hw-accent transition-colors"><Settings className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onRemovePoint(i)} className="p-2 hover:text-hw-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))
                )}
                {points.length > 0 && (
                  <button className="w-full py-4 border border-dashed border-hw-border/50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-hw-accent hover:border-hw-accent/30 hover:bg-hw-accent/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Добавить точку
                  </button>
                )}
              </div>
            </section>

            {/* Bike Type Selector */}
            <section className="hw-card p-5 space-y-4">
              <p className="hw-label text-[9px] opacity-60">Профиль транспортного средства</p>
              <div className="grid grid-cols-2 gap-3">
                {bikeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onBikeTypeChange(option.value)}
                    className={cn(
                      "hw-button h-11 flex items-center justify-center gap-3 transition-all duration-500",
                      bikeType === option.value ? "bg-hw-accent/20 border-hw-accent text-hw-accent shadow-[0_0_20px_rgba(0,242,255,0.1)]" : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <Bike className={cn("w-4 h-4", bikeType === option.value ? "animate-pulse" : "")} />
                    <span className="text-[10px] font-bold">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Instructions View */
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase italic text-white/90">Пошаговый гайд</h3>
              <button className="p-2 hover:bg-hw-accent/10 rounded-xl transition-all text-hw-label hover:text-hw-accent">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {currentRoute?.instructions.map((inst, i) => (
                <div key={i} className="hw-card p-4 flex items-center gap-4 group hover:border-hw-accent/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-hw-accent shrink-0 border border-white/10">
                    {getInstructionIcon(inst.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium leading-relaxed text-white/80">{inst.text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-mono font-bold text-hw-accent uppercase tracking-widest">{formatDistance(inst.distance)}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{formatDuration(inst.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Route Details Card (Telemetry) */}
        {currentRoute && (
          <section className="hw-card p-5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-16 h-16 text-hw-accent" />
            </div>
            <div className="flex items-center justify-between relative">
              <h2 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90">Телеметрия</h2>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-hw-accent animate-ping" />
                <div className="w-1 h-1 rounded-full bg-hw-accent/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 relative">
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Дистанция</p>
                <p className="text-xl font-mono font-black tracking-tighter text-white">{formatDistance(currentRoute.distance)}</p>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Подъем</p>
                <p className="text-xl font-mono font-black tracking-tighter text-hw-success">+{currentRoute.ascent}м</p>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Время</p>
                <p className="text-xl font-mono font-black tracking-tighter text-white">{formatDuration(currentRoute.duration)}</p>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Спуск</p>
                <p className="text-xl font-mono font-black tracking-tighter text-hw-danger">-{currentRoute.descent}м</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-6 glass-panel border-t-0 rounded-t-3xl space-y-4">
        <div className="flex items-center justify-between px-2">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-hw-label hover:text-white transition-all">
            <TrendingUp className="w-4 h-4" /> Полная стата
          </button>
          <button 
            onClick={() => currentRoute && exportToGPX(currentRoute)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-hw-accent hover:text-hw-accent-light transition-all group"
          >
            <span className="group-hover:mr-1 transition-all">Экспорт в</span> <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onStartNavigation}
          disabled={!currentRoute}
          className="w-full py-5 bg-hw-accent/10 border border-hw-accent/30 hover:bg-hw-accent/20 hover:border-hw-accent disabled:opacity-30 text-hw-accent rounded-2xl font-black uppercase tracking-[0.3em] italic shadow-[0_0_30px_rgba(0,242,255,0.1)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
        >
          Начать навигацию <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
