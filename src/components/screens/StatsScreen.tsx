import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Zap, Clock, Trophy, Target, Award, Map as MapIcon, ChevronRight, Activity, Flame, Heart, Wind } from 'lucide-react';
import { motion } from 'motion/react';

const WEEKLY_DATA = [
  { name: 'Пн', distance: 12, calories: 450, heartRate: 135 },
  { name: 'Вт', distance: 45, calories: 1200, heartRate: 142 },
  { name: 'Ср', distance: 8, calories: 320, heartRate: 128 },
  { name: 'Чт', distance: 22, calories: 780, heartRate: 138 },
  { name: 'Пт', distance: 31, calories: 950, heartRate: 140 },
  { name: 'Сб', distance: 68, calories: 2100, heartRate: 148 },
  { name: 'Вс', distance: 15, calories: 510, heartRate: 132 },
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Первая сотня', desc: 'Проехать 100 км суммарно', icon: <Award className="w-6 h-6" />, progress: 100, color: 'text-hw-accent', bg: 'bg-hw-accent/10' },
  { id: 2, title: 'Эверест', desc: 'Набор высоты 8848 м', icon: <TrendingUp className="w-6 h-6" />, progress: 45, color: 'text-hw-success', bg: 'bg-hw-success/10' },
  { id: 3, title: 'Король скорости', desc: 'Разогнаться до 60 км/ч', icon: <Zap className="w-6 h-6" />, progress: 82, color: 'text-hw-danger', bg: 'bg-hw-danger/10' },
  { id: 4, title: 'Ранняя пташка', desc: '5 поездок до 7:00 утра', icon: <Wind className="w-6 h-6" />, progress: 60, color: 'text-hw-label', bg: 'bg-hw-label/10' },
];

export default function StatsScreen() {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto scrollbar-none relative">
      <div className="absolute inset-0 bg-hw-bg/40 backdrop-blur-2xl -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase italic text-white">Статистика</h2>
          <p className="hw-label text-[10px] mt-1 opacity-60">Анализ производительности и достижений</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-hw-accent bg-hw-accent/10 rounded-lg">Неделя</button>
          <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-hw-label hover:text-white transition-colors">Месяц</button>
          <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-hw-label hover:text-white transition-colors">Год</button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Дистанция', value: '201.5', unit: 'км', icon: <MapIcon />, color: 'text-hw-accent', trend: '+12%' },
          { label: 'Энергия', value: '6,310', unit: 'ккал', icon: <Flame />, color: 'text-hw-danger', trend: '+5%' },
          { label: 'Пульс (ср)', value: '138', unit: 'уд/м', icon: <Heart />, color: 'text-hw-success', trend: '-2%' },
          { label: 'Время', value: '12:45', unit: 'ч', icon: <Clock />, color: 'text-hw-label', trend: '+8%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="hw-card p-5 group hover:border-hw-accent/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`text-[9px] font-black font-mono ${stat.trend.startsWith('+') ? 'text-hw-success' : 'text-hw-danger'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="hw-label text-[8px] opacity-40 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono tracking-tighter text-white">{stat.value}</span>
                <span className="text-[10px] font-bold opacity-30 uppercase">{stat.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Distance Chart */}
        <div className="lg:col-span-2 hw-card p-6 h-80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hw-accent/20 to-transparent" />
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90">Прогресс дистанции</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-hw-accent">
                <Target className="w-3.5 h-3.5" />
                <span>Цель: 250 км</span>
              </div>
            </div>
          </div>
          <div className="w-full h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA}>
                <defs>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,12,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#00f2ff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="distance" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories Bar Chart */}
        <div className="hw-card p-6 h-80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hw-danger/20 to-transparent" />
          <h3 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90 mb-6">Расход энергии</h3>
          <div className="w-full h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,12,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                  {WEEKLY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#ff4444' : 'rgba(255, 68, 68, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white/90">Достижения</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-hw-accent hover:underline">Все награды</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div 
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="hw-card p-4 flex flex-col gap-4 group cursor-pointer hover:border-hw-accent/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${ach.bg} flex items-center justify-center ${ach.color} group-hover:scale-110 transition-transform`}>
                  {ach.icon}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black text-white">{ach.progress}%</span>
                  <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full ${ach.color.replace('text-', 'bg-')} transition-all`} style={{ width: `${ach.progress}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-tight text-white/90">{ach.title}</h4>
                <p className="text-[9px] text-white/40 mt-1 leading-tight">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
