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
  Search, Coffee
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <div className="flex flex-col h-screen w-screen bg-hw-bg text-white font-sans select-none overflow-hidden relative">
      {/* Atmospheric Background Layers */}
      <div className="atmosphere" />
      <div className="scanline" />
      
      {/* Top Bar / Header */}
      <header className="h-20 flex items-center justify-between px-8 shrink-0 z-[1010] relative">
        <div className="absolute inset-x-4 top-4 bottom-0 glass-panel rounded-2xl flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-hw-accent/10 border border-hw-accent/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)] group-hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] group-hover:bg-hw-accent/20 transition-all duration-500">
                <Bike className="w-7 h-7 text-hw-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none bg-gradient-to-r from-white to-hw-accent bg-clip-text text-transparent">VeloRoute</h1>
                <p className="hw-label text-[9px] mt-1 opacity-60">Тактическая система навигации v2.7</p>
              </div>
            </div>
            
            {/* Real-time Data Feed (Desktop) */}
            <div className="hidden lg:flex items-center gap-8 pl-8 border-l border-hw-border h-12">
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Заряд</p>
                <div className="flex items-center gap-2.5">
                  <Battery className={cn("w-4 h-4", battery < 20 ? "text-hw-danger animate-pulse" : "text-hw-success")} />
                  <span className="text-sm font-mono font-bold tracking-tighter">{Math.floor(battery)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Скорость ветра</p>
                <div className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-hw-accent-light" />
                  <span className="text-sm font-mono font-bold tracking-tighter">{weather?.windSpeed ? `${weather.windSpeed} км/ч` : 'ШТИЛЬ'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="hw-label text-[8px]">Сигнал</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-4 bg-hw-accent rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                  <div className="w-1.5 h-4 bg-hw-accent rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                  <div className="w-1.5 h-4 bg-hw-accent rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                  <div className="w-1.5 h-4 bg-hw-border rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="hw-button h-10 min-w-[100px] glass-panel hover:bg-hw-accent/10"
              >
                {isSyncing ? (
                  <div className="w-4 h-4 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Синхр.</span>
                  </>
                )}
              </button>
              <button className="hw-button h-10 glass-panel hover:bg-hw-accent/10">
                <Share2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Поделиться</span>
              </button>
            </div>
            <div className="w-px h-10 bg-hw-border mx-2 hidden md:block" />
            <button className="p-3 glass-panel rounded-xl transition-all hover:text-hw-accent hover:border-hw-accent/30">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black leading-none uppercase tracking-tight">Кусачий Кот</p>
                <p className="hw-label text-[8px] mt-1">PRO Аккаунт</p>
              </div>
              <div className="w-12 h-12 rounded-2xl glass-panel p-0.5 border-2 border-hw-border hover:border-hw-accent transition-all duration-500 cursor-pointer group">
                <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                  <img src="https://picsum.photos/seed/user/48/48" alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-hw-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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
          <div className="flex-1 relative overflow-hidden hw-card">
            {activeTab === 'map' ? (
              <>
                {/* Top Bar (Search & Weather) */}
                {!isNavigating && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[500px] z-[1001] flex gap-3">
                    <div className="flex-1 relative group">
                      <input 
                        type="text"
                        placeholder="Куда отправимся?"
                        className="w-full glass-panel rounded-2xl py-4 px-6 pl-14 text-xs focus:outline-none focus:ring-2 focus:ring-hw-accent/20 transition-all placeholder:text-white/20 font-mono text-white"
                      />
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-hw-label group-focus-within:text-hw-accent transition-colors" />
                    </div>
                    <div className="glass-panel rounded-2xl px-4 flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-hw-accent" />
                      <span className="text-[10px] font-black font-mono text-white/80 tracking-tighter">24°C</span>
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
                      className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[600px] z-[1002]"
                    >
                      <div className="glass-panel rounded-[2.5rem] p-6 flex items-center gap-8 border-hw-accent/30 shadow-[0_0_50px_rgba(0,242,255,0.15)]">
                        <div className="w-20 h-20 rounded-[2rem] bg-hw-accent flex items-center justify-center text-hw-bg shadow-[0_0_30px_rgba(0,242,255,0.5)] shrink-0">
                          <ArrowUpRight className="w-10 h-10" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl font-black font-mono tracking-tighter text-white">250</span>
                            <span className="text-sm font-black uppercase tracking-widest text-hw-accent">метров</span>
                          </div>
                          <p className="text-xl font-black uppercase tracking-tight text-white/90">ул. Космонавтов</p>
                        </div>
                        <div className="text-right space-y-1 pr-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-hw-label">Прибытие</p>
                          <p className="text-2xl font-black font-mono tracking-tighter text-white">18:42</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Map Tools (Right Side) */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1001] flex flex-col gap-4">
                  {/* Layer Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowLayerMenu(!showLayerMenu)}
                      className={cn(
                        "w-14 h-14 glass-panel rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110",
                        showLayerMenu ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-hw-label hover:text-white"
                      )}
                    >
                      <Layers className="w-6 h-6" />
                    </button>
                    <AnimatePresence>
                      {showLayerMenu && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute right-20 top-0 glass-panel p-3 rounded-2xl min-w-[180px] space-y-2 border-hw-accent/20"
                        >
                          <p className="text-[8px] font-black uppercase tracking-widest text-hw-label px-2 mb-2">Слои карты</p>
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
                                mapStyle === style.id ? "bg-hw-accent/20 text-hw-accent" : "hover:bg-white/5 text-white/60"
                              )}
                            >
                              <style.icon className="w-4 h-4" /> {style.label}
                            </button>
                          ))}
                          <div className="h-px bg-white/10 my-2" />
                          <button 
                            onClick={() => setShowPOIs(!showPOIs)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                              showPOIs ? "text-hw-success" : "text-white/40"
                            )}
                          >
                            <Coffee className="w-4 h-4" /> Точки интереса
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Planning Toggle */}
                  {!isNavigating && (
                    <button 
                      onClick={() => {
                        setIsPlanning(!isPlanning);
                        if (!isPlanning) setIsSidebarOpen(true);
                      }}
                      className={cn(
                        "w-14 h-14 glass-panel rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110",
                        isPlanning ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-hw-label hover:text-white"
                      )}
                    >
                      <Edit3 className="w-6 h-6" />
                    </button>
                  )}

                  {/* Route Menu (Three Dots) */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowRouteMenu(!showRouteMenu)}
                      className={cn(
                        "w-14 h-14 glass-panel rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110",
                        showRouteMenu ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-hw-label hover:text-white"
                      )}
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>
                    <AnimatePresence>
                      {showRouteMenu && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute right-20 bottom-0 glass-panel p-3 rounded-2xl min-w-[180px] space-y-2 border-hw-accent/20"
                        >
                          <button onClick={handleSaveRoute} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition-all">
                            <Download className="w-4 h-4" /> Сохранить
                          </button>
                          <button onClick={handleShareRoute} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition-all">
                            <Share2 className="w-4 h-4" /> Поделиться
                          </button>
                          <button onClick={handleClear} className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-hw-danger hover:bg-hw-danger/10 transition-all">
                            <Trash2 className="w-4 h-4" /> Удалить
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
                      <div className="glass-panel rounded-3xl p-2 flex gap-2 border-hw-accent/30 shadow-[0_0_40px_rgba(0,242,255,0.1)]">
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
                              activeTool === tool.id ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "text-hw-label hover:text-white hover:bg-white/5"
                            )}
                          >
                            <tool.icon className="w-6 h-6" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
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
                        <div className="glass-panel rounded-3xl p-4 flex items-center gap-4 border-hw-accent/30 shadow-[0_0_40px_rgba(0,242,255,0.2)]">
                          <div className="w-16 h-16 bg-hw-accent rounded-2xl flex items-center justify-center text-hw-bg shadow-lg shadow-hw-accent/20">
                            <Navigation className="w-10 h-10" />
                          </div>
                          <div className="flex-1">
                            <p className="hw-label text-[10px] tracking-[0.2em] mb-1">Через 250м</p>
                            <p className="text-xl font-black uppercase tracking-tight leading-none">Поверните направо</p>
                            <p className="text-[10px] text-white/40 uppercase mt-1">ул. Тверская</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black font-mono leading-none">12:45</p>
                            <p className="hw-label text-[8px] mt-1">Прибытие</p>
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
                        <div className="glass-panel rounded-[2.5rem] p-3 flex gap-4 border-hw-accent/30 shadow-[0_0_40px_rgba(0,242,255,0.1)]">
                          <button 
                            onClick={() => setIsNavigating(false)}
                            className="w-16 h-16 rounded-full bg-hw-danger/20 text-hw-danger flex items-center justify-center hover:bg-hw-danger hover:text-white transition-all shadow-[0_0_20px_rgba(255,59,48,0.2)]"
                          >
                            <X className="w-8 h-8" />
                          </button>
                          <button className="w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all">
                            <Coffee className="w-8 h-8" />
                          </button>
                          <button className="w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all">
                            <Settings className="w-8 h-8" />
                          </button>
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
                      className="absolute top-6 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-4 z-[1002] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-5 h-5 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
                      <span className="hw-label text-[10px] tracking-[0.2em]">Расчет маршрута...</span>
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
                    { lat: 55.7489, lng: 37.6256 }
                  ]);
                }
                setActiveTab('map');
                setIsPlanning(false);
              }} />
            ) : activeTab === 'stats' ? (
              <StatsScreen />
            ) : (
              <SettingsScreen />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Dock */}
      {!isNavigating && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 h-20 glass-panel rounded-3xl flex items-center justify-around px-8 z-[1003] min-w-[320px] md:min-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'map' ? "text-hw-accent scale-110" : "text-white/30 hover:text-white/60"
            )}
          >
            <Compass className="w-6 h-6" />
            <span className="hw-label text-[8px] font-black uppercase tracking-widest">Карта</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'routes' ? "text-hw-accent scale-110" : "text-white/30 hover:text-white/60"
            )}
          >
            <MapIcon className="w-6 h-6" />
            <span className="hw-label text-[8px] font-black uppercase tracking-widest">Маршруты</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'stats' ? "text-hw-accent scale-110" : "text-white/30 hover:text-white/60"
            )}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="hw-label text-[8px] font-black uppercase tracking-widest">Статы</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'settings' ? "text-hw-accent scale-110" : "text-white/30 hover:text-white/60"
            )}
          >
            <Settings className="w-6 h-6" />
            <span className="hw-label text-[8px] font-black uppercase tracking-widest">Опции</span>
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
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[3000] glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border-hw-accent/30 shadow-[0_0_50px_rgba(0,242,255,0.2)]"
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              notification.type === 'success' ? "bg-hw-success" : "bg-hw-danger"
            )} />
            <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
          </motion.div>
        )}

        {isNavigating && route && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-hw-bg/80 backdrop-blur-md z-[2000] flex flex-col items-center justify-end p-4 md:p-8 pointer-events-none"
          >
            <div className="w-full max-w-4xl bg-hw-card border border-hw-border rounded-3xl p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col gap-6 md:gap-10 overflow-y-auto max-h-[90vh]">
              {/* Nav Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-hw-accent rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-hw-accent/20">
                    <Navigation className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase italic leading-none">Живая навигация</h2>
                    <p className="hw-label text-[10px] md:text-xs mt-1">Активный маршрут • Поток данных в реальном времени</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNavigating(false)}
                  className="w-12 h-12 md:w-16 md:h-16 bg-hw-surface border border-hw-border rounded-2xl md:rounded-3xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-hw-border transition-all"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>

              {/* Nav Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-hw-surface border border-hw-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 hw-label text-[10px] md:text-xs">
                    <Compass className="w-4 h-4" /> Скорость
                  </div>
                  <div className="text-3xl md:text-6xl font-black font-mono leading-none">24.5 <span className="text-xs md:text-base font-normal text-gray-500">км/ч</span></div>
                </div>
                <div className="bg-hw-surface border border-hw-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 hw-label text-[10px] md:text-xs">
                    <Clock className="w-4 h-4" /> Осталось
                  </div>
                  <div className="text-3xl md:text-6xl font-black font-mono leading-none">45 <span className="text-xs md:text-base font-normal text-gray-500">мин</span></div>
                </div>
                <div className="bg-hw-surface border border-hw-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 hw-label text-[10px] md:text-xs">
                    <Battery className="w-4 h-4" /> Заряд
                  </div>
                  <div className="text-3xl md:text-6xl font-black font-mono leading-none text-hw-success">82 <span className="text-xs md:text-base font-normal text-gray-500">%</span></div>
                </div>
                <div className="bg-hw-surface border border-hw-border rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 hw-label text-[10px] md:text-xs">
                    <TrendingUp className="w-4 h-4" /> Уклон
                  </div>
                  <div className="text-3xl md:text-6xl font-black font-mono leading-none text-hw-danger">+8 <span className="text-xs md:text-base font-normal text-gray-500">%</span></div>
                </div>
              </div>

              {/* Safety / Alerts */}
              <div className="bg-hw-danger/10 border border-hw-danger/20 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-hw-danger/20 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 md:w-7 md:h-7 text-hw-danger" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-lg font-bold text-hw-danger uppercase tracking-tight">Внимание: Крутой спуск впереди</p>
                  <p className="text-[10px] md:text-xs text-hw-danger/60 uppercase tracking-widest font-mono">Через 400м уклон -12% • Будьте осторожны</p>
                </div>
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-hw-danger animate-pulse hidden sm:block" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
