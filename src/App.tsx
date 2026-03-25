import { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import ElevationProfile from './components/ElevationProfile';
import { BikeType, RoutePoint, RouteInfo } from './types';
import { fetchRoute } from './services/routing';
import { fetchWeather, WeatherInfo } from './services/weather';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Compass, Shield, Battery, Wind, AlertTriangle, X } from 'lucide-react';

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

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

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
    <div className="flex h-screen w-screen bg-[#0a0a0b] overflow-hidden font-sans select-none relative">
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
            onAddPoint={handleAddPoint}
            onUpdatePoint={handleUpdatePoint}
            onRemovePoint={handleRemovePoint}
            onBikeTypeChange={setBikeType}
            onSelectRoute={setSelectedRouteIndex}
            onTogglePOIs={() => setShowPOIs(!showPOIs)}
            onClear={handleClear}
            onStartNavigation={() => {
              setIsNavigating(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Mobile Menu Toggle */}
        {!isSidebarOpen && !isNavigating && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-[60] w-12 h-12 bg-[#151619] border border-[#2a2b2e] rounded-2xl flex items-center justify-center text-white shadow-2xl hover:border-gray-600 transition-all"
          >
            <Navigation className="w-6 h-6 rotate-90" />
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
              className="absolute top-20 md:top-6 left-1/2 -translate-x-1/2 bg-[#151619]/90 backdrop-blur-md border border-[#2a2b2e] px-4 py-2 rounded-full flex items-center gap-3 z-50 shadow-2xl"
            >
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Расчет маршрута...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elevation Profile */}
        {currentRoute && !isNavigating && (
          <ElevationProfile 
            data={currentRoute.elevationProfile} 
            instructions={currentRoute.instructions}
          />
        )}

        {/* Navigation Overlay */}
        <AnimatePresence>
          {isNavigating && route && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-end p-4 md:p-8 pointer-events-none"
            >
              <div className="w-full max-w-4xl bg-[#151619] border border-[#2a2b2e] rounded-3xl p-4 md:p-8 shadow-2xl pointer-events-auto flex flex-col gap-4 md:gap-8 overflow-y-auto max-h-[90vh]">
                {/* Nav Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                      <Navigation className="w-5 h-5 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight">Навигация активна</h2>
                      <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">Следование по маршруту • Нажмите на карту, чтобы добавить точку</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNavigating(false)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-[#1c1d21] border border-[#2a2b2e] rounded-xl md:rounded-2xl flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                {/* Nav Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Compass className="w-3 h-3" /> Скорость
                    </div>
                    <div className="text-2xl md:text-4xl font-black font-mono">24.5 <span className="text-[10px] md:text-sm font-normal text-gray-500">км/ч</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Wind className="w-3 h-3" /> Оставшееся время
                    </div>
                    <div className="text-2xl md:text-4xl font-black font-mono">45 <span className="text-[10px] md:text-sm font-normal text-gray-500">мин</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Battery className="w-3 h-3" /> Заряд (E-Bike)
                    </div>
                    <div className="text-2xl md:text-4xl font-black font-mono text-green-500">82 <span className="text-[10px] md:text-sm font-normal text-gray-500">%</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <AlertTriangle className="w-3 h-3" /> Градиент
                    </div>
                    <div className="text-2xl md:text-4xl font-black font-mono text-red-500">+8 <span className="text-[10px] md:text-sm font-normal text-gray-500">%</span></div>
                  </div>
                </div>

                {/* Safety / Alerts */}
                <div className="bg-red-900/10 border border-red-900/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                  <div className="flex-1">
                    <p className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider">Внимание: Опасный спуск</p>
                    <p className="text-[8px] md:text-[10px] text-red-500/60 uppercase tracking-widest font-mono">Через 400 метров градиент -12%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
