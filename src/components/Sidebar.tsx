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
  activeTab?: 'map' | 'route' | 'guide' | 'stats';
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
  activeTab = 'map',
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
      className={cn(
        "fixed md:relative top-0 bottom-20 md:bottom-0 left-0 w-full md:w-80 h-auto md:h-full bg-hw-bg text-white flex flex-col border-r border-hw-border shadow-2xl z-[1005] md:z-50",
        activeTab === 'map' && "hidden md:flex"
      )}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {/* Route Editor Card */}
        <section className="hw-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                points.length > 0 ? "bg-hw-success" : "bg-hw-warning"
              )} />
              <h2 className="text-xs font-black tracking-widest uppercase italic">
                {points.length > 0 ? "Система онлайн" : "Ожидание ввода"}
              </h2>
            </div>
            <button className="p-1 hover:bg-hw-border rounded transition-colors">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                if (points.length === 0) {
                  alert("Нажмите на карту, чтобы добавить первую точку.");
                }
              }}
              className="hw-button hw-button-primary text-[9px]"
            >
              Рисовать вручную
            </button>
            <button className="hw-button text-[9px]">Импорт GPX</button>
          </div>
          <button className="hw-button w-full flex items-center justify-center gap-2 text-[9px]">
            <Cloud className="w-3.5 h-3.5" /> Облачная синхр.
          </button>
        </section>

        {/* Search Bar */}
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск локации..."
            className="w-full bg-hw-surface border border-hw-border rounded-xl py-2.5 px-4 pl-10 text-xs focus:outline-none focus:ring-1 focus:ring-hw-accent transition-all placeholder:text-gray-600 font-mono"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-hw-accent transition-colors" />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="hw-card overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-2.5 text-left text-[11px] hover:bg-hw-surface transition-colors border-b border-hw-border last:border-0 flex items-center gap-3"
              >
                <MapPin className="w-3.5 h-3.5 text-hw-accent shrink-0" />
                <span className="truncate font-mono">{result.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bike Type Selector */}
        <section className="hw-card p-4 space-y-3">
          <p className="hw-label">Профиль ТС</p>
          <div className="grid grid-cols-2 gap-2">
            {bikeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onBikeTypeChange(option.value)}
                className={cn(
                  "hw-button text-[9px] flex items-center justify-center gap-2",
                  bikeType === option.value && "bg-hw-accent border-hw-accent-light text-white"
                )}
              >
                <Bike className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Route Details Card */}
        {currentRoute && (
          <section className="hw-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-widest uppercase italic">Телеметрия</h2>
              <Activity className="w-4 h-4 text-hw-accent" />
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="hw-label">Дистанция</p>
                <p className="hw-value">{formatDistance(currentRoute.distance)}</p>
              </div>
              <div>
                <p className="hw-label">Подъем</p>
                <p className="hw-value text-hw-success">+{currentRoute.ascent}м</p>
              </div>
              <div>
                <p className="hw-label">Время</p>
                <p className="hw-value">{formatDuration(currentRoute.duration)}</p>
              </div>
              <div>
                <p className="hw-label">Спуск</p>
                <p className="hw-value text-hw-danger">-{currentRoute.descent}м</p>
              </div>
            </div>

            {/* Alternative Routes */}
            {route?.alternatives && route.alternatives.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-hw-border">
                <p className="hw-label">Альтернативные пути</p>
                <div className="flex flex-col gap-2">
                  {[route, ...route.alternatives].map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectRoute(i)}
                      className={cn(
                        "hw-button w-full flex items-center justify-between py-2.5",
                        selectedRouteIndex === i && "bg-hw-accent border-hw-accent-light text-white"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">Путь {i === 0 ? 'Альфа' : i === 1 ? 'Бета' : 'Гамма'}</span>
                      <span className="hw-value text-[10px] opacity-80">{formatDistance(r.distance)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Maintenance Reminders Card */}
        <section className="hw-card p-4 space-y-3 bg-hw-accent/5 border-hw-accent/20">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-hw-accent" />
            <h2 className="text-[10px] font-black tracking-widest uppercase italic">Системные оповещения</h2>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-hw-accent/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-hw-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">Голосовое ведение активно</p>
              <p className="text-[8px] text-gray-500 font-mono uppercase tracking-widest">Проверка давления: 48ч</p>
            </div>
          </div>
        </section>

        {/* Statistics Card */}
        <section className="hw-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black tracking-widest uppercase italic">Окружение</h2>
            <div className="flex gap-1">
              <div className={cn("w-1 h-3 rounded-full", weather ? "bg-hw-accent" : "bg-hw-border")} />
              <div className={cn("w-1 h-3 rounded-full", weather ? "bg-hw-accent" : "bg-hw-border")} />
              <div className="w-1 h-3 bg-hw-border rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WindIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="hw-label">Ветер</span>
              </div>
              <span className="hw-value">
                {weather?.windSpeed ? `${weather.windSpeed} км/ч ${weather.windDirection || ''}` : 'ШТИЛЬ'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-gray-500" />
                <span className="hw-label">Погода</span>
              </div>
              <span className="hw-value">
                {weather ? `${weather.temp}°C • ${weather.description}` : 'НЕТ ДАННЫХ'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("w-3.5 h-3.5", currentRoute?.ascent && currentRoute.ascent > 500 ? "text-hw-danger" : "text-gray-500")} />
                <span className="hw-label">Интенсивность</span>
              </div>
              <span className={cn("hw-value", currentRoute?.ascent && currentRoute.ascent > 500 ? "text-hw-danger" : "")}>
                {currentRoute?.ascent && currentRoute.ascent > 500 ? "КРИТИЧ. ПОДЪЕМ" : "НОРМА"}
              </span>
            </div>
          </div>
        </section>

        {/* Points List */}
        {points.length > 0 && (
          <section className="hw-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black tracking-widest uppercase italic">Путевые точки</h2>
              <button onClick={onClear} className="text-[8px] text-hw-danger uppercase font-bold tracking-widest hover:underline">Очистить все</button>
            </div>
            <div className="space-y-2">
              {points.map((point, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-hw-surface/50 rounded-lg border border-hw-border/50 group">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0 font-mono text-[10px] font-bold",
                    i === 0 ? "bg-hw-accent/20 text-hw-accent" : 
                    i === points.length - 1 ? "bg-hw-danger/20 text-hw-danger" : 
                    "bg-hw-border text-gray-400"
                  )}>
                    {i === 0 ? 'A' : i === points.length - 1 ? 'B' : i + 1}
                  </div>
                  <span className="flex-1 text-[10px] truncate text-gray-300 font-mono uppercase tracking-tight">{point.label || `Точка ${i + 1}`}</span>
                  <button onClick={() => onRemovePoint(i)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-hw-danger transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-hw-surface border-t border-hw-border space-y-3">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">
            <TrendingUp className="w-3.5 h-3.5" /> Полная стата
          </button>
          <button 
            onClick={() => currentRoute && exportToGPX(currentRoute)}
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-hw-accent hover:text-hw-accent-light transition-colors"
          >
            Отправить в <Share2 className="w-3.5 h-3.5" /> Strava
          </button>
        </div>
        <button
          onClick={onStartNavigation}
          disabled={!currentRoute}
          className="w-full py-3.5 bg-hw-accent hover:bg-hw-accent-light disabled:opacity-50 disabled:hover:bg-hw-accent text-white rounded-xl font-black uppercase tracking-[0.25em] italic shadow-lg shadow-hw-accent/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          Начать навигацию <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
