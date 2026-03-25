import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Zap, Clock, Trophy, Target, Award, Map as MapIcon, ChevronRight, Activity, Flame, Heart, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

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
  { id: 1, title: 'Первая сотня', desc: 'Проехать 100 км суммарно', icon: <Award className="w-6 h-6" />, progress: 100, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 2, title: 'Эверест', desc: 'Набор высоты 8848 м', icon: <TrendingUp className="w-6 h-6" />, progress: 45, color: 'text-success', bg: 'bg-success/10' },
  { id: 3, title: 'Король скорости', desc: 'Разогнаться до 60 км/ч', icon: <Zap className="w-6 h-6" />, progress: 82, color: 'text-error', bg: 'bg-error/10' },
  { id: 4, title: 'Ранняя пташка', desc: '5 поездок до 7:00 утра', icon: <Wind className="w-6 h-6" />, progress: 60, color: 'text-text-secondary', bg: 'bg-surface' },
];

export default function StatsScreen() {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar relative bg-background">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase text-text-primary">Статистика</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">Анализ производительности и достижений</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-border">
          <Button variant="primary" size="sm" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest h-auto">Неделя</Button>
          <Button variant="text" size="sm" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary h-auto">Месяц</Button>
          <Button variant="text" size="sm" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary h-auto">Год</Button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Дистанция', value: '201.5', unit: 'км', icon: <MapIcon />, color: 'text-primary', trend: '+12%' },
          { label: 'Энергия', value: '6,310', unit: 'ккал', icon: <Flame />, color: 'text-error', trend: '+5%' },
          { label: 'Пульс (ср)', value: '138', unit: 'уд/м', icon: <Heart />, color: 'text-success', trend: '-2%' },
          { label: 'Время', value: '12:45', unit: 'ч', icon: <Clock />, color: 'text-text-secondary', trend: '+8%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 group hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg bg-surface border border-border", stat.color)}>
                  {stat.icon}
                </div>
                <span className={cn("text-[9px] font-bold font-mono", stat.trend.startsWith('+') ? 'text-success' : 'text-error')}>
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary opacity-60">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono tracking-tighter text-text-primary">{stat.value}</span>
                  <span className="text-[10px] font-bold text-text-secondary opacity-40 uppercase">{stat.unit}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Distance Chart */}
        <Card className="lg:col-span-2 p-6 h-80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-primary">Прогресс дистанции</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-primary">
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
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="distance" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Calories Bar Chart */}
        <Card className="p-6 h-80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error/20 to-transparent" />
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-primary mb-6">Расход энергии</h3>
          <div className="w-full h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '10px' }}
                  cursor={{ fill: 'var(--color-surface)' }}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                  {WEEKLY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? 'var(--color-error)' : 'rgba(255, 68, 68, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-primary">Достижения</h3>
          <Button variant="text" size="sm" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline h-auto p-0">Все награды</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div 
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Card className="p-4 flex flex-col gap-4 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", ach.bg, ach.color)}>
                    {ach.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-text-primary">{ach.progress}%</span>
                    <div className="w-16 h-1 bg-surface rounded-full mt-1 overflow-hidden border border-border">
                      <div className={cn("h-full transition-all", ach.color.replace('text-', 'bg-'))} style={{ width: `${ach.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-tight text-text-primary">{ach.title}</h4>
                  <p className="text-[9px] text-text-secondary mt-1 leading-tight">{ach.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
