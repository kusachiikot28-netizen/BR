import { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import ElevationProfile from './components/ElevationProfile';
import { BikeType, RoutePoint, RouteInfo } from './types';
import { fetchRoute } from './services/routing';
import { fetchWeather, WeatherInfo } from './services/weather';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Compass, Shield, Battery, Wind, AlertTriangle, X, MapPin, List, TrendingUp, Settings, Bike, Layers, Share2, Cloud, Clock } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPOIs, setShowPOIs] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'route' | 'guide' | 'stats'>('map');
  const [isSyncing, setIsSyncing] = useState(false);
  const [battery, setBattery] = useState(82);

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
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-hw-bg text-white font-sans select-none overflow-hidden">
      {/* Top Bar / Header */}
      <header className="h-16 bg-hw-surface border-b border-hw-border flex items-center justify-between px-6 shrink-0 z-[1010]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hw-accent rounded-xl flex items-center justify-center shadow-lg shadow-hw-accent/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase italic leading-none">VeloRoute</h1>
              <p className="hw-label text-[8px] mt-0.5">Тактическая система навигации</p>
            </div>
          </div>
          
          {/* Real-time Data Feed (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-hw-border h-10">
            <div className="space-y-0.5">
              <p className="hw-label text-[8px]">Заряд</p>
              <div className="flex items-center gap-2">
                <Battery className={cn("w-3.5 h-3.5", battery < 20 ? "text-hw-danger animate-pulse" : "text-hw-success")} />
                <span className="text-xs font-mono font-bold">{Math.floor(battery)}%</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="hw-label text-[8px]">Скорость ветра</p>
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-hw-accent-light" />
                <span className="text-xs font-mono font-bold">{weather?.windSpeed ? `${weather.windSpeed} км/ч` : 'ШТИЛЬ'}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="hw-label text-[8px]">Сигнал</p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-hw-accent rounded-full" />
                <div className="w-1 h-3 bg-hw-accent rounded-full" />
                <div className="w-1 h-3 bg-hw-accent rounded-full" />
                <div className="w-1 h-3 bg-hw-border rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="hw-button flex items-center gap-2 bg-hw-border/20 min-w-[80px] justify-center"
            >
              {isSyncing ? (
                <div className="w-3 h-3 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Синхр.</span>
                </>
              )}
            </button>
            <button className="hw-button flex items-center gap-2 bg-hw-border/20">
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Поделиться</span>
            </button>
          </div>
          <div className="w-px h-8 bg-hw-border mx-2 hidden md:block" />
          <button className="p-2 hover:bg-hw-border rounded-xl transition-colors text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold leading-none">Кусачий Кот</p>
              <p className="hw-label text-[8px]">PRO Аккаунт</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-hw-border flex items-center justify-center overflow-hidden border-2 border-hw-border hover:border-hw-accent transition-colors cursor-pointer">
              <img src="https://picsum.photos/seed/user/40/40" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <Sidebar
              points={points}
              bikeType={bikeType}
              route={route}
              selectedRouteIndex={selectedRouteIndex}
              showPOIs={showPOIs}
              weather={weather}
              activeTab={activeTab}
              onAddPoint={handleAddPoint}
              onUpdatePoint={handleUpdatePoint}
              onRemovePoint={handleRemovePoint}
              onBikeTypeChange={setBikeType}
              onSelectRoute={setSelectedRouteIndex}
              onTogglePOIs={() => setShowPOIs(!showPOIs)}
              onClear={handleClear}
              onStartNavigation={() => {
                setIsNavigating(true);
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                  setActiveTab('map');
                }
              }}
              onClose={() => {
                setIsSidebarOpen(false);
                setActiveTab('map');
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {/* Mobile Menu Toggle */}
            {!isSidebarOpen && !isNavigating && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsSidebarOpen(true)}
                className="flex absolute top-4 left-4 z-[1001] w-12 h-12 bg-hw-surface border border-hw-border rounded-xl items-center justify-center text-white shadow-2xl hover:bg-hw-border transition-all"
              >
                <Navigation className="w-6 h-6 rotate-90 text-hw-accent" />
              </motion.button>
            )}

            {/* Map */}
            <Map 
              points={points} 
              route={route} 
              selectedRouteIndex={selectedRouteIndex}
              showPOIs={showPOIs}
              isNavigating={isNavigating}
              onAddPoint={handleAddPoint}
              onUpdatePoint={handleUpdatePoint}
              onRemovePoint={handleRemovePoint}
              onSelectRoute={setSelectedRouteIndex}
            />

            {/* Loading Indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 bg-hw-surface/90 backdrop-blur-md border border-hw-border px-4 py-2 rounded-full flex items-center gap-3 z-[1002] shadow-2xl"
                >
                  <div className="w-4 h-4 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
                  <span className="hw-label text-[9px]">Расчет маршрута...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Elevation Profile */}
            {currentRoute && !isNavigating && activeTab === 'map' && (
              <ElevationProfile 
                data={currentRoute.elevationProfile} 
                instructions={currentRoute.instructions}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Dock (Mobile Only) */}
      {!isNavigating && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-hw-surface border-t border-hw-border flex items-center justify-around px-6 z-[1003]">
          <button
            onClick={() => {
              setActiveTab('map');
              setIsSidebarOpen(false);
            }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'map' ? "text-hw-accent scale-110" : "text-gray-500"
            )}
          >
            <Compass className="w-6 h-6" />
            <span className="hw-label text-[8px]">Карта</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('route');
              setIsSidebarOpen(true);
            }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'route' ? "text-hw-accent scale-110" : "text-gray-500"
            )}
          >
            <MapPin className="w-6 h-6" />
            <span className="hw-label text-[8px]">Маршрут</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('guide');
              setIsSidebarOpen(true);
            }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'guide' ? "text-hw-accent scale-110" : "text-gray-500"
            )}
          >
            <List className="w-6 h-6" />
            <span className="hw-label text-[8px]">Гайд</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('stats');
              setIsSidebarOpen(true);
            }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              activeTab === 'stats' ? "text-hw-accent scale-110" : "text-gray-500"
            )}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="hw-label text-[8px]">Статы</span>
          </button>
        </div>
      )}

      {/* Navigation Overlay */}
      <AnimatePresence>
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
