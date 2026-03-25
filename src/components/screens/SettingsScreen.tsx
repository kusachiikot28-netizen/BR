import { 
  User, Bluetooth, Map as MapIcon, Settings as SettingsIcon, Shield, Info, LogOut, 
  ChevronRight, Bell, Moon, Globe, Zap, Smartphone, Database, HelpCircle, 
  CreditCard, Edit3, RefreshCw, Activity, Navigation, Bike, Layers, 
  Volume2, RotateCcw, Eye, Lock, Trash2, Github, AlertCircle, Check, X,
  Monitor, Ruler, Clock, Layout, Play, Share2, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SettingSectionId = 'account' | 'devices' | 'maps' | 'navigation' | 'display' | 'privacy' | 'notifications' | 'about';

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState<SettingSectionId>('account');
  const [isMobile, setIsMobile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ title: string; onConfirm: () => void } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    // Account
    userName: 'Кусачий Кот',
    userEmail: 'kusachiikot28@gmail.com',
    syncStatus: 'Синхронизировано: Сегодня, 12:45',
    
    // Devices
    searchDevices: false,
    navFields: 'speed-hr-power',
    
    // Maps
    defaultLayer: 'satellite',
    offlineRegions: '2.4 ГБ',
    
    // Navigation
    defaultBike: 'hybrid',
    avoidSteep: true,
    preferBikePaths: true,
    maxGradient: 12,
    voicePrompts: true,
    voiceMode: 'all',
    autoReroute: true,
    rerouteTimeout: 10,
    maintenanceReminder: true,
    maintenanceInterval: 500,
    
    // Display
    theme: 'dark',
    uiSize: 'medium',
    units: 'metric',
    timeFormat: '24h',
    elevationProfile: 'navigation',
    animations: true,
    
    // Privacy
    trackRecording: 'active',
    autoSave: true,
    anonStats: true,
    
    // Notifications
    pushEnabled: true,
    reminderEnabled: true,
    notificationSound: 'default'
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAction = (title: string, onConfirm: () => void) => {
    setShowConfirm({ title, onConfirm });
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateSetting('syncStatus', `Синхронизировано: ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 2000);
  };

  const handleScanNow = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 4000);
  };

  const renderToggle = (label: string, desc: string, value: boolean, onChange: (v: boolean) => void) => (
    <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/5 hover:border-hw-accent/20 transition-all">
      <div className="space-y-0.5">
        <p className="text-sm font-bold uppercase tracking-tight text-white/90">{label}</p>
        <p className="text-[10px] text-white/40 leading-tight">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-300",
          value ? "bg-hw-accent shadow-[0_0_15px_rgba(0,242,255,0.4)]" : "bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
          value ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );

  const renderSlider = (label: string, value: number, min: number, max: number, unit: string, onChange: (v: number) => void) => (
    <div className="space-y-3 p-4 glass-panel rounded-2xl border-white/5">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold uppercase tracking-tight text-white/90">{label}</p>
        <span className="text-xs font-mono font-black text-hw-accent">{value}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-hw-accent"
      />
    </div>
  );

  const renderSelect = (label: string, options: { id: string, label: string }[], value: string, onChange: (v: string) => void) => (
    <div className="space-y-3 p-4 glass-panel rounded-2xl border-white/5">
      <p className="text-sm font-bold uppercase tracking-tight text-white/90">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              value === opt.id ? "bg-hw-accent text-hw-bg shadow-lg shadow-hw-accent/20" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const sections = [
    {
      id: 'account',
      title: 'Аккаунт',
      icon: <User className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="hw-card p-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-hw-accent to-hw-accent/20 p-0.5">
              <div className="w-full h-full rounded-[22px] bg-hw-bg flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/seed/user/80/80" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-tight italic text-white">{settings.userName}</h3>
              <p className="text-xs text-white/40 font-mono">{settings.userEmail}</p>
              <button className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-hw-accent hover:text-hw-accent-light transition-colors">
                <Edit3 className="w-3 h-3" /> Редактировать профиль
              </button>
            </div>
          </div>
          
          <div className="p-4 glass-panel rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-hw-label">Статус синхронизации</p>
              <p className="text-xs text-white/80">{isSyncing ? 'Синхронизация...' : settings.syncStatus}</p>
            </div>
            <button 
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="hw-button h-10 px-4 glass-panel hover:bg-hw-accent/10 text-hw-accent disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} /> 
              {isSyncing ? 'Ждите' : 'Синхронизировать'}
            </button>
          </div>

          <button 
            onClick={() => handleAction('Выйти из аккаунта?', () => {})}
            className="w-full p-4 glass-panel rounded-2xl flex items-center justify-center gap-3 text-hw-danger hover:bg-hw-danger/10 transition-all border-hw-danger/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Выйти из системы</span>
          </button>
        </div>
      )
    },
    {
      id: 'devices',
      title: 'Датчики и устройства',
      icon: <Bluetooth className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {renderToggle('Поиск устройств', 'Bluetooth / ANT+ сканирование', settings.searchDevices, (v) => updateSetting('searchDevices', v))}
          
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-hw-label px-2">Подключенные датчики</p>
            {[
              { label: 'Скорость/Каденс', value: 'Wahoo BlueSC', status: 'connected', icon: <Zap className="w-4 h-4" /> },
              { label: 'Пульсометр', value: 'Garmin HRM-Dual', status: 'connected', icon: <Activity className="w-4 h-4" /> },
              { label: 'Мощность', value: 'Не подключено', status: 'disconnected', icon: <Zap className="w-4 h-4" /> }
            ].map(dev => (
              <div key={dev.label} className="p-4 glass-panel rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg bg-white/5", dev.status === 'connected' ? "text-hw-accent" : "text-white/20")}>
                    {dev.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight text-white/90">{dev.label}</p>
                    <p className="text-[10px] text-white/40">{dev.value}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-hw-accent/60 hover:text-hw-accent">
                  {dev.status === 'connected' ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            ))}
            {isScanning && (
              <div className="p-4 glass-panel rounded-2xl flex items-center gap-4 border-hw-accent/30 animate-pulse">
                <div className="w-4 h-4 border-2 border-hw-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-hw-accent">Поиск устройств...</span>
              </div>
            )}
            <button 
              onClick={handleScanNow}
              disabled={isScanning}
              className="w-full p-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-hw-accent hover:border-hw-accent/40 transition-all disabled:opacity-50"
            >
              {isScanning ? 'Сканирование...' : 'Сканировать новые устройства'}
            </button>
          </div>

          {renderSelect('Отображение данных', [
            { id: 'speed-hr-power', label: 'Скорость/ЧСС/Мощность' },
            { id: 'cadence-speed', label: 'Каденс/Скорость' },
            { id: 'minimal', label: 'Минималистичный' }
          ], settings.navFields, (v) => updateSetting('navFields', v))}
        </div>
      )
    },
    {
      id: 'maps',
      title: 'Карты и слои',
      icon: <MapIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-hw-label px-2">Слой по умолчанию</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'osm', label: 'OSM Standard', img: 'https://picsum.photos/seed/osm/120/80' },
                { id: 'cycle', label: 'OpenCycleMap', img: 'https://picsum.photos/seed/cycle/120/80' },
                { id: 'topo', label: 'OpenTopoMap', img: 'https://picsum.photos/seed/topo/120/80' },
                { id: 'satellite', label: 'Спутник', img: 'https://picsum.photos/seed/sat/120/80' }
              ].map(layer => (
                <button 
                  key={layer.id}
                  onClick={() => updateSetting('defaultLayer', layer.id)}
                  className={cn(
                    "relative rounded-2xl overflow-hidden aspect-[3/2] border-2 transition-all",
                    settings.defaultLayer === layer.id ? "border-hw-accent shadow-[0_0_20px_rgba(0,242,255,0.2)]" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={layer.img} alt={layer.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[8px] font-black uppercase tracking-widest text-white">{layer.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 glass-panel rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-tight text-white/90">Офлайн-карты</p>
              <p className="text-[10px] text-white/40">Занято: {settings.offlineRegions}</p>
            </div>
            <button className="hw-button h-10 px-4 glass-panel hover:bg-hw-accent/10 text-hw-accent">
              Управление
            </button>
          </div>

          <button 
            onClick={() => handleAction('Очистить кэш тайлов?', () => {})}
            className="w-full p-4 glass-panel rounded-2xl flex items-center justify-between text-white/60 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Очистить кэш</span>
            </div>
            <span className="text-[10px] font-mono opacity-40">124 МБ</span>
          </button>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Навигация',
      icon: <Navigation className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {renderSelect('Тип велосипеда', [
            { id: 'road', label: 'Шоссейный' },
            { id: 'mtb', label: 'Горный' },
            { id: 'hybrid', label: 'Гибрид' },
            { id: 'electric', label: 'Электро' }
          ], settings.defaultBike, (v) => updateSetting('defaultBike', v))}

          <div className="space-y-2">
            {renderToggle('Избегать крутых подъёмов', 'Маршрут по более ровной местности', settings.avoidSteep, (v) => updateSetting('avoidSteep', v))}
            {renderToggle('Предпочитать велодорожки', 'Приоритет инфраструктуры', settings.preferBikePaths, (v) => updateSetting('preferBikePaths', v))}
          </div>

          {renderSlider('Максимальный градиент', settings.maxGradient, 5, 25, '%', (v) => updateSetting('maxGradient', v))}

          <div className="space-y-4 pt-4 border-t border-white/5">
            {renderToggle('Голосовые подсказки', 'Озвучивание маршрута', settings.voicePrompts, (v) => updateSetting('voicePrompts', v))}
            {settings.voicePrompts && (
              <div className="pl-4 space-y-4">
                {renderSelect('Режим подсказок', [
                  { id: 'all', label: 'Все' },
                  { id: 'warnings', label: 'Только важные' }
                ], settings.voiceMode, (v) => updateSetting('voiceMode', v))}
                <button className="w-full p-3 glass-panel rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Голос: Системный (RU)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {renderToggle('Авто-перестроение', 'Автоматически при уходе с пути', settings.autoReroute, (v) => updateSetting('autoReroute', v))}
            {settings.autoReroute && renderSlider('Тайм-аут подтверждения', settings.rerouteTimeout, 0, 30, ' сек', (v) => updateSetting('rerouteTimeout', v))}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {renderToggle('Напоминания о ТО', 'По пробегу', settings.maintenanceReminder, (v) => updateSetting('maintenanceReminder', v))}
            {settings.maintenanceReminder && renderSlider('Интервал ТО', settings.maintenanceInterval, 100, 2000, ' км', (v) => updateSetting('maintenanceInterval', v))}
          </div>
        </div>
      )
    },
    {
      id: 'display',
      title: 'Интерфейс',
      icon: <Layout className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {renderSelect('Тема оформления', [
            { id: 'light', label: 'Светлая' },
            { id: 'dark', label: 'Тёмная' },
            { id: 'system', label: 'Системная' }
          ], settings.theme, (v) => updateSetting('theme', v))}

          {renderSelect('Размер элементов', [
            { id: 'small', label: 'Маленький' },
            { id: 'medium', label: 'Средний' },
            { id: 'large', label: 'Большой' }
          ], settings.uiSize, (v) => updateSetting('uiSize', v))}

          <div className="grid grid-cols-2 gap-4">
            {renderSelect('Единицы', [
              { id: 'metric', label: 'КМ/М' },
              { id: 'imperial', label: 'МИ/ФТ' }
            ], settings.units, (v) => updateSetting('units', v))}
            {renderSelect('Время', [
              { id: '24h', label: '24ч' },
              { id: '12h', label: '12ч' }
            ], settings.timeFormat, (v) => updateSetting('timeFormat', v))}
          </div>

          {renderSelect('Профиль высот', [
            { id: 'always', label: 'Всегда' },
            { id: 'navigation', label: 'При навигации' },
            { id: 'never', label: 'Никогда' }
          ], settings.elevationProfile, (v) => updateSetting('elevationProfile', v))}

          {renderToggle('Анимации интерфейса', 'Плавные переходы (влияет на батарею)', settings.animations, (v) => updateSetting('animations', v))}
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Конфиденциальность',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {renderSelect('Запись трека', [
            { id: 'always', label: 'Всегда' },
            { id: 'active', label: 'При маршруте' },
            { id: 'never', label: 'Никогда' }
          ], settings.trackRecording, (v) => updateSetting('trackRecording', v))}

          {renderToggle('Автосохранение поездок', 'Сохранять в историю после финиша', settings.autoSave, (v) => updateSetting('autoSave', v))}
          {renderToggle('Анонимная статистика', 'Помогает улучшать приложение', settings.anonStats, (v) => updateSetting('anonStats', v))}

          <button 
            onClick={() => handleAction('Очистить историю поездок?', () => {})}
            className="w-full p-4 glass-panel rounded-2xl flex items-center justify-center gap-3 text-hw-danger hover:bg-hw-danger/10 transition-all border-hw-danger/20"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Очистить историю</span>
          </button>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: <Bell className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {renderToggle('Push-уведомления', 'Системные оповещения', settings.pushEnabled, (v) => updateSetting('pushEnabled', v))}
          {renderToggle('Уведомления о ТО', 'Напоминания о сервисе', settings.reminderEnabled, (v) => updateSetting('reminderEnabled', v))}
          
          <div className="space-y-3 p-4 glass-panel rounded-2xl border-white/5">
            <p className="text-sm font-bold uppercase tracking-tight text-white/90">Звук уведомления</p>
            <button className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4" />
                <span>Default System Sound</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      title: 'О приложении',
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="hw-card p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-hw-accent/10 rounded-[2rem] flex items-center justify-center text-hw-accent shadow-[0_0_30px_rgba(0,242,255,0.1)]">
              <Bike className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">VeloRoute PRO</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Версия 2.7.4 (Build 2027.03)</p>
            </div>
            <p className="text-[10px] text-white/30 leading-relaxed max-w-[200px]">
              Открытая лицензия GPL v3. Разработано для тактической навигации.
            </p>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Исходный код', icon: <Github className="w-4 h-4" />, link: '#' },
              { label: 'Политика конфиденциальности', icon: <Lock className="w-4 h-4" />, link: '#' },
              { label: 'Сообщить об ошибке', icon: <Mail className="w-4 h-4" />, link: '#' }
            ].map(item => (
              <a key={item.label} href={item.link} className="p-4 glass-panel rounded-2xl flex items-center justify-between group hover:border-hw-accent/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-white/20 group-hover:text-hw-accent transition-colors">{item.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-tight text-white/60 group-hover:text-white">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-hw-accent" />
              </a>
            ))}
          </div>

          <button 
            onClick={() => handleAction('Сбросить все настройки?', () => {})}
            className="w-full p-4 border border-hw-danger/20 rounded-2xl flex items-center justify-center gap-3 text-hw-danger/60 hover:text-hw-danger hover:bg-hw-danger/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Сбросить настройки</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden relative">
      <div className="absolute inset-0 bg-hw-bg/40 backdrop-blur-2xl -z-10" />
      
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <div className={cn(
        "lg:w-80 border-hw-border flex flex-col shrink-0 z-10",
        isMobile ? "p-6 border-b" : "p-8 border-r bg-black/20"
      )}>
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight uppercase italic text-white">Настройки</h2>
          <p className="hw-label text-[10px] mt-1 opacity-60">Конфигурация системы</p>
        </div>

        <nav className={cn(
          "flex gap-2 lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none",
          isMobile ? "px-1" : ""
        )}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 shrink-0 lg:shrink",
                activeSection === section.id 
                  ? "bg-hw-accent text-hw-bg shadow-[0_0_20px_rgba(0,242,255,0.2)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {section.icon}
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-none">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 lg:mb-12">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">
                  {sections.find(s => s.id === activeSection)?.title}
                </h3>
                <div className="h-1 w-12 bg-hw-accent mt-4 rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
              </div>
              
              {sections.find(s => s.id === activeSection)?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-hw-bg/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border-hw-danger/30 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-hw-danger/10 rounded-3xl flex items-center justify-center text-hw-danger mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight text-white">{showConfirm.title}</h4>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 h-14 rounded-2xl bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => { showConfirm.onConfirm(); setShowConfirm(null); }}
                  className="flex-1 h-14 rounded-2xl bg-hw-danger text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-hw-danger/20 hover:scale-105 transition-all"
                >
                  Подтвердить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
