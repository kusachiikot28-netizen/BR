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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPOIs, setShowPOIs] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

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
    <div className="flex h-screen w-screen bg-[#0a0a0b] overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <Sidebar
        points={points}
        bikeType={bikeType}
        route={route}
        showPOIs={showPOIs}
        weather={weather}
        onAddPoint={handleAddPoint}
        onUpdatePoint={handleUpdatePoint}
        onRemovePoint={handleRemovePoint}
        onBikeTypeChange={setBikeType}
        onTogglePOIs={() => setShowPOIs(!showPOIs)}
        onClear={handleClear}
        onStartNavigation={() => setIsNavigating(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Map */}
        <Map
          points={points}
          route={route}
          showPOIs={showPOIs}
          onAddPoint={handleAddPoint}
          onUpdatePoint={handleUpdatePoint}
          onRemovePoint={handleRemovePoint}
        />

        {/* Loading Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#151619]/90 backdrop-blur-md border border-[#2a2b2e] px-4 py-2 rounded-full flex items-center gap-3 z-50 shadow-2xl"
            >
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Расчет маршрута...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elevation Profile */}
        {route && !isNavigating && (
          <ElevationProfile data={route.elevationProfile} />
        )}

        {/* Navigation Overlay */}
        <AnimatePresence>
          {isNavigating && route && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-end p-8 pointer-events-none"
            >
              <div className="w-full max-w-4xl bg-[#151619] border border-[#2a2b2e] rounded-3xl p-8 shadow-2xl pointer-events-auto flex flex-col gap-8">
                {/* Nav Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                      <Navigation className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Навигация активна</h2>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Следование по маршруту</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNavigating(false)}
                    className="w-12 h-12 bg-[#1c1d21] border border-[#2a2b2e] rounded-2xl flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Nav Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-2xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Compass className="w-3 h-3" /> Скорость
                    </div>
                    <div className="text-4xl font-black font-mono">24.5 <span className="text-sm font-normal text-gray-500">км/ч</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-2xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Wind className="w-3 h-3" /> Оставшееся время
                    </div>
                    <div className="text-4xl font-black font-mono">45 <span className="text-sm font-normal text-gray-500">мин</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-2xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <Battery className="w-3 h-3" /> Заряд (E-Bike)
                    </div>
                    <div className="text-4xl font-black font-mono text-green-500">82 <span className="text-sm font-normal text-gray-500">%</span></div>
                  </div>
                  <div className="bg-[#1c1d21] border border-[#2a2b2e] rounded-2xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                      <AlertTriangle className="w-3 h-3" /> Градиент
                    </div>
                    <div className="text-4xl font-black font-mono text-red-500">+8 <span className="text-sm font-normal text-gray-500">%</span></div>
                  </div>
                </div>

                {/* Safety / Alerts */}
                <div className="bg-red-900/10 border border-red-900/20 rounded-2xl p-4 flex items-center gap-4">
                  <Shield className="w-6 h-6 text-red-500" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Внимание: Опасный спуск</p>
                    <p className="text-[10px] text-red-500/60 uppercase tracking-widest font-mono">Через 400 метров градиент -12%</p>
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
