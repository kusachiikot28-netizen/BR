import { Search, Filter, Download, Plus, MapPin, Calendar, Clock, Ruler, ChevronRight, MoreVertical, FileText, Share2, Trash2, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RouteItem {
  id: string;
  name: string;
  date: string;
  distance: number;
  duration: number;
  ascent: number;
  type: 'road' | 'mtb' | 'gravel';
  isFavorite?: boolean;
  points?: any[];
}

const MOCK_ROUTES: RouteItem[] = [
  { id: '1', name: 'Вечерний заезд в парке', date: '2024-03-20', distance: 15.4, duration: 2700, ascent: 120, type: 'road', isFavorite: true },
  { id: '2', name: 'Лесной трейл "Медвежий угол"', date: '2024-03-18', distance: 32.1, duration: 7200, ascent: 450, type: 'mtb' },
  { id: '3', name: 'Городской маршрут: Центр', date: '2024-03-15', distance: 12.8, duration: 2100, ascent: 80, type: 'road' },
  { id: '4', name: 'Загородная трасса А105', date: '2024-03-10', distance: 64.5, duration: 10800, ascent: 320, type: 'road' },
];

export default function RoutesScreen({ onSelectRoute }: { onSelectRoute: (route: any) => void }) {
  const [savedRoutes, setSavedRoutes] = useState<RouteItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bikeRoute_savedRoutes') || '[]');
    setSavedRoutes(saved.map((r: any) => ({
      ...r,
      ascent: r.elevationGain || 0,
      type: 'road' // Default type for saved routes
    })));
  }, []);

  const allRoutes = [...savedRoutes, ...MOCK_ROUTES];

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto scrollbar-none relative">
      <div className="absolute inset-0 bg-hw-bg/40 backdrop-blur-2xl -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase italic text-white">Мои маршруты</h2>
          <p className="hw-label text-[10px] mt-1 opacity-60">Библиотека сохраненных путей</p>
        </div>
        <div className="flex gap-3">
          <button className="hw-button glass-panel h-12 px-6 border-hw-accent/30 text-hw-accent">
            <Plus className="w-5 h-5" /> Создать
          </button>
          <button className="hw-button glass-panel h-12 px-6">
            <Download className="w-5 h-5" /> Импорт
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <input 
            type="text"
            placeholder="Поиск по названию..."
            className="w-full glass-panel rounded-2xl py-4 px-6 pl-14 text-xs focus:outline-none focus:ring-2 focus:ring-hw-accent/20 transition-all placeholder:text-white/20 font-mono text-white"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-hw-label group-focus-within:text-hw-accent transition-colors" />
        </div>
        <button className="glass-panel rounded-2xl px-5 flex items-center gap-3 hover:bg-white/5 transition-all text-hw-label hover:text-white">
          <Filter className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Фильтры</span>
        </button>
        <button className="glass-panel rounded-2xl px-5 flex items-center gap-3 hover:bg-white/5 transition-all text-hw-label hover:text-white">
          <Folder className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Папки</span>
        </button>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRoutes.map((route, i) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="hw-card p-6 group hover:border-hw-accent/30 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectRoute(route)}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-5 h-5 text-hw-label" />
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-hw-accent/10 border border-hw-accent/20 flex items-center justify-center text-hw-accent shrink-0">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black tracking-tight uppercase italic truncate text-white/90">{route.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-hw-accent bg-hw-accent/10 px-2 py-0.5 rounded-md">{route.type}</span>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{route.date}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-hw-border">
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Дистанция</p>
                <p className="text-sm font-mono font-black text-white">{route.distance} км</p>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Время</p>
                <p className="text-sm font-mono font-black text-white">{(route.duration / 60).toFixed(0)} мин</p>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Подъем</p>
                <p className="text-sm font-mono font-black text-hw-success">+{route.ascent}м</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
