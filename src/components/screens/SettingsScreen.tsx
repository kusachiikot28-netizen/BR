import { User, Bluetooth, Map as MapIcon, Settings as SettingsIcon, Shield, Info, LogOut, ChevronRight, Bell, Moon, Globe, Zap, Smartphone, Database, HelpCircle, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const SECTIONS = [
  {
    id: 'account',
    title: 'Аккаунт',
    icon: <User className="w-5 h-5" />,
    items: [
      { label: 'Личные данные', value: 'Иван Иванов', desc: 'Управление профилем и аватаром', icon: <User className="w-4 h-4" /> },
      { label: 'Подписка', value: 'Pro Plan', desc: 'Действует до 12.12.2027', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Безопасность', value: '2FA Вкл.', desc: 'Пароль и двухфакторная аутентификация', icon: <Shield className="w-4 h-4" /> },
    ]
  },
  {
    id: 'devices',
    title: 'Устройства и датчики',
    icon: <Bluetooth className="w-5 h-5" />,
    items: [
      { label: 'Велокомпьютер', value: 'VeloCore X1', desc: 'Подключено по ANT+', icon: <Smartphone className="w-4 h-4" /> },
      { label: 'Пульсометр', value: 'Garmin HRM', desc: 'Подключено по BLE', icon: <Activity className="w-4 h-4" /> },
      { label: 'Датчик мощности', value: 'Не найден', desc: 'Поиск новых устройств...', icon: <Zap className="w-4 h-4" /> },
    ]
  },
  {
    id: 'maps',
    title: 'Офлайн-карты',
    icon: <MapIcon className="w-5 h-5" />,
    items: [
      { label: 'Загруженные регионы', value: '2.4 ГБ', desc: 'Москва, МО, Карелия', icon: <Database className="w-4 h-4" /> },
      { label: 'Автообновление', value: 'Wi-Fi', desc: 'Обновлять карты в фоновом режиме', icon: <Globe className="w-4 h-4" /> },
    ]
  },
  {
    id: 'app',
    title: 'Система',
    icon: <SettingsIcon className="w-5 h-5" />,
    items: [
      { label: 'Единицы измерения', value: 'Метрические', desc: 'км, м, км/ч, °C', icon: <Info className="w-4 h-4" /> },
      { label: 'Уведомления', value: 'Важные', desc: 'Настройка пуш-уведомлений', icon: <Bell className="w-4 h-4" /> },
      { label: 'Тема оформления', value: 'Futuristic 2027', desc: 'Тёмная неоновая тема (OLED)', icon: <Moon className="w-4 h-4" /> },
    ]
  }
];

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default function SettingsScreen() {
  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto scrollbar-none relative">
      <div className="absolute inset-0 bg-hw-bg/40 backdrop-blur-2xl -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase italic text-white">Настройки</h2>
          <p className="hw-label text-[10px] mt-1 opacity-60">Конфигурация тактической системы</p>
        </div>
        <button className="hw-button glass-panel h-11 px-6 text-hw-danger border-hw-danger/20 hover:bg-hw-danger/10 transition-all">
          <LogOut className="w-4 h-4" /> Выйти
        </button>
      </div>

      {/* User Profile Card */}
      <div className="hw-card p-6 flex items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-hw-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-hw-accent/10 transition-colors" />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-hw-accent to-hw-accent/20 p-0.5 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
          <div className="w-full h-full rounded-[22px] bg-hw-bg flex items-center justify-center">
            <User className="w-10 h-10 text-hw-accent" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tight italic text-white">Иван Иванов</h3>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-hw-accent/10 text-hw-accent text-[8px] font-black uppercase tracking-widest border border-hw-accent/20">Pro Account</span>
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">ID: 2027-8848-X</span>
          </div>
        </div>
        <button className="hw-button glass-panel p-3 hover:text-hw-accent transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-10 pb-12">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-1">
              <div className="p-2 rounded-lg bg-white/5 text-hw-accent">
                {section.icon}
              </div>
              <h3 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.label} className="hw-card p-5 flex items-center justify-between group cursor-pointer hover:border-hw-accent/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5 text-hw-label group-hover:text-hw-accent transition-colors">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold uppercase tracking-tight group-hover:text-hw-accent transition-colors text-white/90">{item.label}</p>
                      <p className="text-[10px] text-white/40 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-black text-hw-accent/60 group-hover:text-hw-accent transition-colors uppercase tracking-widest">{item.value}</span>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-hw-accent transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        
        {/* Help & Support */}
        <div className="pt-4">
          <div className="hw-card p-6 bg-hw-accent/5 border-hw-accent/20 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-hw-accent/10 text-hw-accent">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-white">Поддержка и помощь</h4>
                <p className="text-[10px] text-white/40 mt-1">База знаний, чат с оператором</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-hw-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
