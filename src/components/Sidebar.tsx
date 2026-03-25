import { 
  Bike, MapPin, Trash2, Plus, Navigation, TrendingUp, Clock, Ruler, 
  ChevronRight, Settings, Info, Coffee, Search, Cloud, Wind as WindIcon, 
  FileText, Download, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, 
  ArrowUp, RotateCw, LogOut, RefreshCw, Flag, Play, List, Map as MapIcon, X,
  Layers, Share2, Shield, AlertTriangle, Battery, Bell, Activity
} from 'lucide-react';
import { BikeType, RoutePoint, RouteInfo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState, useMemo } from 'react';
import { searchLocation } from '../services/geocoding';
import { WeatherInfo } from '../services/weather';
import { exportToGPX } from '../services/export';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

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
      className="fixed md:relative top-0 bottom-20 md:bottom-0 left-0 w-full md:w-96 h-auto md:h-full flex flex-col z-[1005] md:z-50 transition-all duration-500 bg-surface border-r border-border shadow-lg"
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
        
        {/* View Toggle (Route vs Guide) */}
        <div className="flex bg-background p-1.5 rounded-2xl border border-border">
          <Button 
            variant={view === 'points' ? 'primary' : 'text'}
            size="sm"
            onClick={() => setView('points')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
              view !== 'points' && "text-text-secondary hover:text-text-primary"
            )}
          >
            Маршрут
          </Button>
          <Button 
            variant={view === 'instructions' ? 'primary' : 'text'}
            size="sm"
            onClick={() => setView('instructions')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
              view !== 'instructions' && "text-text-secondary hover:text-text-primary"
            )}
          >
            Гайд
          </Button>
        </div>

        {view === 'points' ? (
          <>
            {/* Points List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Точки маршрута</h3>
                <Button variant="text" size="sm" onClick={onClear} className="text-error hover:text-error/80">Очистить</Button>
              </div>
              <div className="space-y-3">
                {points.length === 0 ? (
                  <div className="bg-background border border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 opacity-60">
                    <MapPin className="w-8 h-8 text-text-secondary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-text-secondary">Нажмите на карту,<br/>чтобы добавить точку</p>
                  </div>
                ) : (
                  points.map((point, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-background border border-border rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all shadow-sm"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-bold",
                        i === 0 ? "bg-primary/10 text-primary border border-primary/20" : 
                        i === points.length - 1 ? "bg-error/10 text-error border border-error/20" : 
                        "bg-surface text-text-secondary border border-border"
                      )}>
                        {i === 0 ? 'A' : i === points.length - 1 ? 'B' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-tight truncate text-text-primary">{point.label || `Точка ${i + 1}`}</p>
                        <p className="text-[8px] font-mono text-text-secondary uppercase tracking-widest mt-0.5">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="icon" size="sm" className="hover:text-primary"><Settings className="w-3.5 h-3.5" /></Button>
                        <Button variant="icon" size="sm" onClick={() => onRemovePoint(i)} className="hover:text-error"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </motion.div>
                  ))
                )}
                {points.length > 0 && (
                  <Button 
                    variant="secondary"
                    className="w-full py-4 border-dashed rounded-2xl text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} /> Добавить точку
                  </Button>
                )}
              </div>
            </section>

            {/* Bike Type Selector */}
            <section className="bg-background border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Транспорт</p>
              <div className="grid grid-cols-2 gap-3">
                {bikeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={bikeType === option.value ? 'primary' : 'secondary'}
                    onClick={() => onBikeTypeChange(option.value)}
                    className={cn(
                      "h-11 flex items-center justify-center gap-3 transition-all duration-300 rounded-xl",
                      bikeType !== option.value && "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
                    )}
                  >
                    <Bike className={cn("w-4 h-4", bikeType === option.value ? "animate-pulse" : "")} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{option.label}</span>
                  </Button>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Instructions View */
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Пошаговый гайд</h3>
              <Button variant="icon" size="sm" className="hover:text-primary">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {currentRoute?.instructions.map((inst, i) => (
                <div key={i} className="bg-background border border-border rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary shrink-0 border border-border">
                    {getInstructionIcon(inst.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium leading-relaxed text-text-primary">{inst.text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest">{formatDistance(inst.distance)}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">{formatDuration(inst.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Route Details Card (Telemetry) */}
        {currentRoute && (
          <section className="bg-background border border-border rounded-2xl p-5 space-y-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity className="w-16 h-16 text-primary" />
            </div>
            <div className="flex items-center justify-between relative">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-text-secondary">Телеметрия</h2>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                <div className="w-1 h-1 rounded-full bg-primary/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 relative">
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Дистанция</p>
                <p className="text-xl font-bold tracking-tighter text-text-primary">{formatDistance(currentRoute.distance)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Подъем</p>
                <p className="text-xl font-bold tracking-tighter text-success">+{currentRoute.ascent}м</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Время</p>
                <p className="text-xl font-bold tracking-tighter text-text-primary">{formatDuration(currentRoute.duration)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Спуск</p>
                <p className="text-xl font-bold tracking-tighter text-error">-{currentRoute.descent}м</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-surface border-t border-border space-y-4">
        <div className="flex items-center justify-between px-2">
          <Button 
            variant="text" 
            size="sm"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all"
          >
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> Полная стата
          </Button>
          <Button 
            variant="text"
            size="sm"
            onClick={() => currentRoute && exportToGPX(currentRoute)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all group"
          >
            <span className="group-hover:mr-1 transition-all">Экспорт</span> <Share2 className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
        <Button
          onClick={onStartNavigation}
          disabled={!currentRoute}
          className="w-full py-6 text-xs font-bold uppercase tracking-[0.2em] shadow-lg"
        >
          Начать навигацию <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Button>
      </div>
    </motion.div>
  );
}
