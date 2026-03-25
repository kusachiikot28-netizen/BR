import { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import ElevationProfile from './components/ElevationProfile';
import RoutesScreen from './components/screens/RoutesScreen';
import StatsScreen from './components/screens/StatsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import { BikeType, RoutePoint, RouteInfo } from './types';
import { fetchRoute } from './services/routing';
import { fetchWeather, WeatherInfo } from './services/weather';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Compass, Shield, Battery, Wind, AlertTriangle, X, 
  MapPin, List, TrendingUp, Settings, Bike, Layers, Share2, 
  Cloud, Clock, Edit3, Check, Trash2, Undo2, Redo2, Plus, Info,
  Bluetooth, Map as MapIcon, MoreVertical, ArrowUpRight, Download, Move,
  Search, Coffee, Sun, Moon
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal } from './components/ui/Modal';
import { Card } from './components/ui/Card';

export default function App() {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [bikeType, setBikeType] = useState<BikeType>('hybrid');
  const [route, setRoute] = useState<RouteInfo | undefined>();
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPOIs, setShowPOIs] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'routes' | 'stats' | 'settings'>('map');
  const [isSyncing, setIsSyncing] = useState(false);
  const [battery, setBattery] = useState(82);
  const [activeTool, setActiveTool] = useState<'add' | 'move' | 'delete' | null>(null);
  const [showRouteMenu, setShowRouteMenu] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street' | 'topo'>('satellite');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  // Theme logic
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Simulate battery drain
  useEffect(() => {
    const interval = setInterval(() => {
      setBattery(prev => Math.max(0, prev - (isNavigating ? 0.1 : 0.01)));
    }, 10000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  // Close sidebar on mobile by default and set active tab
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
      setActiveTab('map');
    }
  }, []);

  // Sync sidebar open state with active tab on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (activeTab === 'map') {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    }
  }, [activeTab]);

  const currentRoute = route?.alternatives && selectedRouteIndex > 0 
    ? route.alternatives[selectedRouteIndex - 1] 
    : route;

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem('bikeRoute_points');
    const savedBikeType = localStorage.getItem('bikeRoute_bikeType');
    if (savedPoints) setPoints(JSON.parse(savedPoints));
    if (savedBikeType) setBikeType(savedBikeType as BikeType);
  }, []);

  // Save to LocalStorage when points or bikeType change
  useEffect(() => {
    localStorage.setItem('bikeRoute_points', JSON.stringify(points));
    localStorage.setItem('bikeRoute_bikeType', bikeType);
  }, [points, bikeType]);

  // Update route when points or bikeType change
  useEffect(() => {
    if (points.length >= 2) {
      const updateRoute = async () => {
        setIsLoading(true);
        try {
          const newRoute = await fetchRoute(points, bikeType);
          setRoute(newRoute);
          setSelectedRouteIndex(0); // Reset to main route
          
          // Fetch weather for the start point
          const weatherData = await fetchWeather(points[0].lat, points[0].lng);
          setWeather(weatherData);
        } catch (error) {
          console.error('Failed to update route:', error);
        } finally {
          setIsLoading(false);
        }
      };
      updateRoute();
    } else {
      setRoute(undefined);
      setSelectedRouteIndex(0);
      setWeather(null);
    }
  }, [points, bikeType]);

  const handleAddPoint = useCallback((point: RoutePoint) => {
    setPoints(prev => [...prev, point]);
  }, []);

  const handleUpdatePoint = useCallback((index: number, point: RoutePoint) => {
    setPoints(prev => {
      const next = [...prev];
      next[index] = point;
      return next;
    });
  }, []);

  const handleRemovePoint = useCallback((index: number) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClear = useCallback(() => {
    setPoints([]);
    setRoute(undefined);
    setIsNavigating(false);
    setShowRouteMenu(false);
  }, []);

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveRoute = useCallback(() => {
    if (!route) return;
    const savedRoutes = JSON.parse(localStorage.getItem('bikeRoute_savedRoutes') || '[]');
    const newSavedRoute = {
      id: Date.now().toString(),
      name: `Маршрут ${new Date().toLocaleDateString()}`,
      points: [...points],
      distance: route.distance,
      duration: route.duration,
      elevationGain: route.elevationGain,
      date: new Date().toISOString()
    };
    localStorage.setItem('bikeRoute_savedRoutes', JSON.stringify([...savedRoutes, newSavedRoute]));
    setShowRouteMenu(false);
    showNotification("Маршрут успешно сохранен!");
  }, [route, points]);

  const handleShareRoute = useCallback(() => {
    if (!route) return;
    const shareUrl = `${window.location.origin}/?points=${encodeURIComponent(JSON.stringify(points))}`;
    navigator.clipboard.writeText(shareUrl);
    setShowRouteMenu(false);
    showNotification("Ссылка скопирована в буфер обмена!");
  }, [route, points]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text-primary font-sans select-none overflow-hidden relative transition-colors duration-300">
      {/* Atmospheric Background Layers */}
      <div className="atmosphere" />
      
      {/* Top Bar / Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 shrink-0 z-[1010] relative">
        <div className="absolute inset-x-2 md:inset-x-4 top-4 bottom-0 bg-surface/80 backdrop-blur-md rounded-2xl flex items-center justify-between px-4 md:px-6 shadow-card border border-border">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => setActiveTab('map')}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary/20 transition-all duration-500">
                <Bike className="w-6 h-6 md:w-7 md:h-7 text-primary" strokeWidth={1.5} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">VeloRoute</h1>
                <p className="text-[9px] font-medium uppercase tracking-widest text-text-secondary opacity-60">Тактическая навигация</p>
              </div>
            </div>
            
            {/* Real-time Data Feed (Desktop) */}
            <div className="hidden lg:flex items-center gap-8 pl-8 border-l border-border h-12">
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Заряд</p>
                <div className="flex items-center gap-2">
                  <Battery className={cn("w-4 h-4", battery < 20 ? "text-error animate-pulse" : "text-success")} strokeWidth={1.5} />
                  <span className="text-sm font-bold">{Math.floor(battery)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Ветер</p>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span className="text-sm font-bold">{weather?.windSpeed ? `${weather.windSpeed} км/ч` : 'ШТИЛЬ'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-10 min-w-[100px]"
              >
                {isSyncing ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Cloud className="w-4 h-4" strokeWidth={1.5} />
                    <span>Синхр.</span>
                  </>
                )}
              </Button>
              <Button variant="secondary" size="sm" className="h-10">
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                <span>Поделиться</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
              </Button>
              <Button 
                variant="icon"
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "w-10 h-10",
                  activeTab === 'settings' && "bg-primary/10 text-primary"
                )}
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">Кусачий Кот</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mt-1">PRO Аккаунт</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all cursor-pointer">
                <img src="https://picsum.photos/seed/user/48/48" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative p-4 gap-4">
        {/* Sidebar (Only for Map screen) */}
        <AnimatePresence mode="wait">
          {activeTab === 'map' && isSidebarOpen && (
            <Sidebar
              points={points}
              bikeType={bikeType}
              route={route}
              selectedRouteIndex={selectedRouteIndex}
              showPOIs={showPOIs}
              weather={weather}
              activeTab={isPlanning ? 'route' : 'guide'}
              onAddPoint={handleAddPoint}
              onUpdatePoint={handleUpdatePoint}
              onRemovePoint={handleRemovePoint}
              onBikeTypeChange={setBikeType}
              onSelectRoute={setSelectedRouteIndex}
              onTogglePOIs={() => setShowPOIs(!showPOIs)}
              onClear={handleClear}
              onStartNavigation={() => {
                setIsNavigating(true);
                setIsPlanning(false);
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              onClose={() => {
                setIsSidebarOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden flex flex-col gap-4">
          <div className="flex-1 relative overflow-hidden bg-background rounded-2xl shadow-card border border-border">
            {activeTab === 'map' ? (
              <>
                {/* Top Bar (Search & Weather) */}
                {!isNavigating && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[500px] z-[1001] flex gap-3">
                    <div className="flex-1 relative group">
                      <Input 
                        type="text"
                        placeholder="Куда отправимся?"
                        className="pl-12 rounded-2xl shadow-md"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-hint group-focus-within:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="bg-surface rounded-2xl px-4 flex items-center gap-2 border border-border shadow-md">
                      <Cloud className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-bold text-text-primary">24°C</span>
                    </div>
                  </div>
                )}

                {/* Navigation HUD (Top) */}
                <AnimatePresence>
                  {isNavigating && (
                    <motion.div 
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -100, opacity: 0 }}
                      className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[600px] z-[1002]"
                    >
                      <div className="bg-black/70 dark:bg-black/85 backdrop-blur-md rounded-[2.5rem] p-6 flex items-center gap-8 shadow-modal text-white">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                          <ArrowUpRight className="w-8 h-8" strokeWidth={2} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold tracking-tight">250</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">метров</span>
                          </div>
                          <p className="text-lg font-bold uppercase tracking-tight opacity-90">ул. Космонавтов</p>
                        </div>
                        <div className="text-right space-y-1 pr-2">
                          <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Прибытие</p>
                          <p className="text-xl font-bold">18:42</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Map Tools (Right Side) */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1001] flex flex-col gap-4">
                  {/* Layer Button */}
                  <div className="relative">
                    <Button 
                      variant="secondary"
                      onClick={() => setShowLayerMenu(!showLayerMenu)}
                      className={cn(
                        "w-14 h-14 rounded-2xl shadow-md",
                        showLayerMenu && "bg-primary text-white border-primary"
                      )}
                    >
                      <Layers className="w-6 h-6" strokeWidth={1.5} />
                    </Button>
                    <AnimatePresence>
                      {showLayerMenu && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute right-20 top-0 bg-surface/90 backdrop-blur-md p-3 rounded-2xl min-w-[180px] space-y-2 border border-border shadow-modal"
                        >
                          <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary px-2 mb-2">Слои карты</p>
                          {[
                            { id: 'satellite', label: 'Спутник', icon: Cloud },
                            { id: 'street', label: 'Улицы', icon: MapIcon },
                            { id: 'topo', label: 'Рельеф', icon: TrendingUp }
                          ].map(style => (
                            <button 
                              key={style.id}
                              onClick={() => { setMapStyle(style.id as any); setShowLayerMenu(false); }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                mapStyle === style.id ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-text-secondary hover:text-text-primary"
                              )}
                            >
                              <style.icon className="w-4 h-4" strokeWidth={1.5} /> {style.label}
                            </button>
                          ))}
                          <div className="h-px bg-border my-2" />
                          <button 
                            onClick={() => setShowPOIs(!showPOIs)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                              showPOIs ? "text-success" : "text-text-secondary hover:text-text-primary"
                            )}
                          >
                            <Coffee className="w-4 h-4" strokeWidth={1.5} /> Точки интереса
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Planning Toggle */}
                  {!isNavigating && (
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setIsPlanning(!isPlanning);
                        if (!isPlanning) setIsSidebarOpen(true);
                      }}
                      className={cn(
                        "w-14 h-14 rounded-2xl shadow-md",
                        isPlanning && "bg-primary text-white border-primary"
                      )}
                    >
                      <Edit3 className="w-6 h-6" strokeWidth={1.5} />
                    </Button>
                  )}

                  {/* Route Menu (Three Dots) */}
                  <div className="relative">
                    <Button 
                      variant="secondary"
                      onClick={() => setShowRouteMenu(!showRouteMenu)}
                      className={cn(
                        "w-14 h-14 rounded-2xl shadow-md",
                        showRouteMenu && "bg-primary text-white border-primary"
                      )}
                    >
                      <MoreVertical className="w-6 h-6" strokeWidth={1.5} />
                    </Button>
                    <AnimatePresence>
                      {showRouteMenu && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute right-20 bottom-0 bg-surface/90 backdrop-blur-md p-3 rounded-2xl min-w-[180px] space-y-2 border border-border shadow-modal"
                        >
                          <button onClick={handleSaveRoute} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:bg-primary/5 hover:text-text-primary transition-all">
                            <Download className="w-4 h-4" strokeWidth={1.5} /> Сохранить
                          </button>
                          <button onClick={handleShareRoute} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:bg-primary/5 hover:text-text-primary transition-all">
                            <Share2 className="w-4 h-4" strokeWidth={1.5} /> Поделиться
                          </button>
                          <button onClick={handleClear} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-error hover:bg-error/5 transition-all">
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Удалить
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Planning Toolbar (Bottom Center) */}
                <AnimatePresence>
                  {isPlanning && (
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[1001]"
                    >
                      <div className="bg-surface/90 backdrop-blur-md rounded-3xl p-2 flex gap-2 border border-border shadow-modal">
                        {[
                          { id: 'add', icon: Plus, label: 'Добавить' },
                          { id: 'move', icon: Move, label: 'Переместить' },
                          { id: 'delete', icon: Trash2, label: 'Удалить' }
                        ].map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={cn(
                              "flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500 gap-2",
                              activeTool === tool.id ? "bg-primary text-white shadow-lg" : "text-text-secondary hover:text-text-primary hover:bg-primary/5"
                            )}
                          >
                            <tool.icon className="w-6 h-6" strokeWidth={1.5} />
                            <span className="text-[8px] font-bold uppercase tracking-widest">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation HUD (Top & Bottom Quick Access) */}
                <AnimatePresence>
                  {isNavigating && route && (
                    <>
                      {/* Top HUD: Next Turn */}
                      <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-[1002] w-full max-w-md px-4"
                      >
                        <div className="bg-black/80 backdrop-blur-md rounded-3xl p-4 flex items-center gap-4 border border-white/10 shadow-modal text-white">
                          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Navigation className="w-10 h-10" strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Через 250м</p>
                            <p className="text-xl font-bold uppercase tracking-tight leading-none">Поверните направо</p>
                            <p className="text-[10px] text-white/40 uppercase mt-1 font-bold">ул. Тверская</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold font-mono leading-none">12:45</p>
                            <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-1">Прибытие</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Bottom HUD: Quick Controls */}
                      <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[1002]"
                      >
                        <div className="bg-surface/90 backdrop-blur-md rounded-[2.5rem] p-3 flex gap-4 border border-border shadow-modal">
                          <Button 
                            variant="icon"
                            onClick={() => setIsNavigating(false)}
                            className="w-16 h-16 rounded-full bg-error/10 text-error hover:bg-error hover:text-white transition-all shadow-md"
                          >
                            <X className="w-8 h-8" strokeWidth={1.5} />
                          </Button>
                          <Button variant="icon" className="w-16 h-16 rounded-full bg-surface border border-border shadow-md">
                            <Coffee className="w-8 h-8" strokeWidth={1.5} />
                          </Button>
                          <Button variant="icon" className="w-16 h-16 rounded-full bg-surface border border-border shadow-md">
                            <Settings className="w-8 h-8" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Map */}
                <Map 
                  points={points} 
                  route={route} 
                  selectedRouteIndex={selectedRouteIndex}
                  showPOIs={showPOIs}
                  isNavigating={isNavigating}
                  activeTool={activeTool}
                  mapStyle={mapStyle}
                  onAddPoint={handleAddPoint}
                  onUpdatePoint={handleUpdatePoint}
                  onRemovePoint={handleRemovePoint}
                  onSelectRoute={setSelectedRouteIndex}
                />

                {/* Loading Indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 z-[1002] shadow-modal border border-border"
                    >
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Расчет маршрута...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Elevation Profile */}
                {currentRoute && !isNavigating && (
                  <div className="absolute bottom-6 inset-x-6 z-[1002]">
                    <ElevationProfile 
                      data={currentRoute.elevationProfile} 
                      instructions={currentRoute.instructions}
                    />
                  </div>
                )}
              </>
            ) : activeTab === 'routes' ? (
              <RoutesScreen onSelectRoute={(r) => {
                if (r.points && r.points.length > 0) {
                  setPoints(r.points);
                } else {
                  // Fallback for mock routes
                  setPoints([
                    { lat: 55.7558, lng: 37.6173 },
                    { lat: 55.7512, lng: 37.6184 },
                    { lat: 55.7489, lng: 37.6212 }
                  ]);
                }
                setActiveTab('map');
              }} />
            ) : activeTab === 'stats' ? (
              <StatsScreen />
            ) : (
              <SettingsScreen />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Dock */}
      {!isNavigating && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 h-20 bg-surface/90 backdrop-blur-md rounded-3xl flex items-center justify-around px-4 md:px-8 z-[1003] min-w-[320px] md:min-w-[400px] shadow-modal border border-border">
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 w-16",
              activeTab === 'map' ? "text-primary scale-110" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Compass className="w-6 h-6" strokeWidth={activeTab === 'map' ? 2 : 1.5} fill={activeTab === 'map' ? "currentColor" : "none"} fillOpacity={0.1} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Карта</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 w-16",
              activeTab === 'routes' ? "text-primary scale-110" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <MapIcon className="w-6 h-6" strokeWidth={activeTab === 'routes' ? 2 : 1.5} fill={activeTab === 'routes' ? "currentColor" : "none"} fillOpacity={0.1} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Маршруты</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 w-16",
              activeTab === 'stats' ? "text-primary scale-110" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <TrendingUp className="w-6 h-6" strokeWidth={activeTab === 'stats' ? 2 : 1.5} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Статы</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 w-16",
              activeTab === 'settings' ? "text-primary scale-110" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Settings className="w-6 h-6" strokeWidth={activeTab === 'settings' ? 2 : 1.5} fill={activeTab === 'settings' ? "currentColor" : "none"} fillOpacity={0.1} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Опции</span>
          </button>
        </div>
      )}

      {/* Navigation Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[3000] bg-surface px-6 py-3 rounded-2xl flex items-center gap-3 border border-primary/30 shadow-modal"
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              notification.type === 'success' ? "bg-success" : "bg-error"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">{notification.message}</span>
          </motion.div>
        )}

        {isNavigating && route && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[2000] flex flex-col items-center justify-end p-4 md:p-8 pointer-events-none"
          >
            <div className="w-full max-w-4xl bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-modal pointer-events-auto flex flex-col gap-6 md:gap-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Nav Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight uppercase leading-none text-text-primary">Навигация</h2>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary mt-1">Активный маршрут • В реальном времени</p>
                  </div>
                </div>
                <Button
                  variant="icon"
                  onClick={() => setIsNavigating(false)}
                  className="w-12 h-12 md:w-16 md:h-16 bg-surface border border-border"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                </Button>
              </div>

              {/* Nav Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-background border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">
                    <Compass className="w-4 h-4" strokeWidth={1.5} /> Скорость
                  </div>
                  <div className="text-3xl md:text-6xl font-bold text-text-primary">24.5 <span className="text-xs md:text-base font-normal text-text-secondary">км/ч</span></div>
                </div>
                <div className="bg-background border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">
                    <Clock className="w-4 h-4" strokeWidth={1.5} /> Осталось
                  </div>
                  <div className="text-3xl md:text-6xl font-bold text-text-primary">45 <span className="text-xs md:text-base font-normal text-text-secondary">мин</span></div>
                </div>
                <div className="bg-background border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">
                    <Battery className="w-4 h-4" strokeWidth={1.5} /> Заряд
                  </div>
                  <div className="text-3xl md:text-6xl font-bold text-success">82 <span className="text-xs md:text-base font-normal text-text-secondary">%</span></div>
                </div>
                <div className="bg-background border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> Уклон
                  </div>
                  <div className="text-3xl md:text-6xl font-bold text-error">+8 <span className="text-xs md:text-base font-normal text-text-secondary">%</span></div>
                </div>
              </div>

              {/* Safety / Alerts */}
              <div className="bg-error/10 border border-error/20 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-error/20 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 md:w-7 md:h-7 text-error" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-lg font-bold text-error uppercase tracking-tight">Внимание: Крутой спуск впереди</p>
                  <p className="text-[10px] md:text-xs text-error/60 uppercase tracking-widest font-mono">Через 400м уклон -12% • Будьте осторожны</p>
                </div>
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-error animate-pulse hidden sm:block" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
