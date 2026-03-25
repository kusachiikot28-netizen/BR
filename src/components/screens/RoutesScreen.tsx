import { Search, Filter, Download, Plus, MapPin, Calendar, Clock, Ruler, ChevronRight, MoreVertical, FileText, Share2, Trash2, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

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
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar relative bg-background">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase text-text-primary">Мои маршруты</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">Библиотека сохраненных путей</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="sm" className="h-12 px-6">
            <Plus className="w-5 h-5 mr-2" /> Создать
          </Button>
          <Button variant="secondary" size="sm" className="h-12 px-6">
            <Download className="w-5 h-5 mr-2" /> Импорт
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Input 
            type="text"
            placeholder="Поиск по названию..."
            className="pl-14 h-14 rounded-2xl"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
        </div>
        <Button variant="secondary" className="h-14 rounded-2xl px-5 flex items-center gap-3">
          <Filter className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Фильтры</span>
        </Button>
        <Button variant="secondary" className="h-14 rounded-2xl px-5 flex items-center gap-3">
          <Folder className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Папки</span>
        </Button>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRoutes.map((route, i) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectRoute(route)}
          >
            <Card className="p-6 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5 text-text-secondary" />
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold tracking-tight uppercase truncate text-text-primary">{route.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">{route.type}</span>
                    <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">{route.date}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Дистанция</p>
                  <p className="text-sm font-mono font-bold text-text-primary">{route.distance} км</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Время</p>
                  <p className="text-sm font-mono font-bold text-text-primary">{(route.duration / 60).toFixed(0)} мин</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Подъем</p>
                  <p className="text-sm font-mono font-bold text-primary">+{route.ascent}м</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
