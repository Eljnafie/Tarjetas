import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, AlertCircle, Bell, Users, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { Child } from '../types';
import { subscribeToChildren } from '../services/db';
import { useAuth } from '../auth/AuthProvider';
import { ChildCard } from '../components/ChildCard';
import { differenceInDays, isSameDay } from 'date-fns';
import { AddChildModal } from '../components/AddChildModal';
import { useNotifications } from '../hooks/useNotifications';

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'expiring_soon'|'expired'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { permission, requestPermission, sendNotification, updateAppBadge } = useNotifications();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChildren(user.uid, setChildren);
    return () => unsub();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    let expiringSoon = 0; // <= 7 days
    let expired = 0;
    let lost = 0;
    
    children.forEach(c => {
      if (c.isLost) {
        lost++;
      }
      const daysLeft = differenceInDays(new Date(c.expirationDate), now);
      if (daysLeft < 0 && !isSameDay(new Date(c.expirationDate), now)) {
        expired++;
      } else if (daysLeft <= 7) {
        expiringSoon++;
      }
    });

    return { total: children.length, expiringSoon, expired, lost };
  }, [children]);

  // Handle Notifications & Badge
  useEffect(() => {
    const totalAlerts = stats.expiringSoon + stats.expired;
    updateAppBadge(totalAlerts);

    if (permission === 'granted' && totalAlerts > 0) {
      const lastNotified = localStorage.getItem('lastNotificationDate');
      const today = new Date().toDateString();
      
      if (lastNotified !== today) {
        const msgs = [];
        if (stats.expired > 0) msgs.push(`${stats.expired} vencida(s)`);
        if (stats.expiringSoon > 0) msgs.push(`${stats.expiringSoon} a punto de vencer (menos de 7 días)`);
        
        sendNotification('Avisos de Tarjetas de Transporte', {
          body: `Tienes ${msgs.join(' y ')}. ¡Por favor revisa la app!`
        });
        localStorage.setItem('lastNotificationDate', today);
      }
    }
  }, [stats, permission, sendNotification, updateAppBadge]);

  const filteredChildren = useMemo(() => {
    const now = new Date();
    return children
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .filter(c => {
        if (filter === 'all') return true;
        const daysLeft = differenceInDays(new Date(c.expirationDate), now);
        const isExpired = daysLeft < 0 && !isSameDay(new Date(c.expirationDate), now);
        if (filter === 'expired') return isExpired;
        if (filter === 'expiring_soon') return daysLeft >= 0 && daysLeft <= 7;
        return true;
      })
      .sort((a, b) => a.expirationDate - b.expirationDate);
  }, [children, search, filter]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{t('dashboard')}</h2>
          <p className="text-sm text-gray-500 mt-1">Control de tarjetas de transporte</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button 
            type="button" 
            onClick={() => setFilter('expiring_soon')}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm"
            title="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            {(stats.expired + stats.expiringSoon) > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                {stats.expired + stats.expiringSoon}
              </span>
            )}
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:block">{t('add_kid')}</span>
          </button>

          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
              title="Activar Notificaciones"
            >
              <Bell size={16} />
              <span className="hidden sm:block">Notificaciones</span>
            </button>
          )}
        </div>
      </header>

      {/* Notifications area */}
      {stats.expiringSoon > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-1 rounded-full"><AlertCircle size={18} className="text-amber-600" /></div>
            <p className="font-medium text-sm">
              Tienes {stats.expiringSoon} {stats.expiringSoon === 1 ? 'tarjeta que caduca' : 'tarjetas que caducan'} en los próximos 7 días.
            </p>
          </div>
          <button onClick={() => setFilter('expiring_soon')} className="text-sm font-bold text-amber-700 hover:underline">Ver</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <CompactStatCard title={t('total_kids')} value={stats.total} icon={<Users size={20} />} colorClass="bg-blue-50 text-blue-700" />
        <CompactStatCard title={t('expiring_soon')} value={stats.expiringSoon} icon={<Clock size={20} />} colorClass="bg-amber-50 text-amber-700" />
        <CompactStatCard title={t('expired')} value={stats.expired} icon={<AlertTriangle size={20} />} colorClass="bg-red-50 text-red-700" />
        <CompactStatCard title="Tarjetas perdidas" value={stats.lost} icon={<HelpCircle size={20} />} colorClass="bg-slate-100 text-slate-700" />
      </div>

      {/* List and Filters */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
          <h3 className="text-xl font-bold text-slate-800">Lista de Seguimiento</h3>
          
          <div className="flex flex-wrap gap-2 text-sm">
            {(['all', 'expiring_soon', 'expired'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                  filter === f 
                    ? f === 'expiring_soon' ? 'bg-[#FFF8E1] border border-yellow-200 text-[#B45309]' : f === 'expired' ? 'bg-[#FDECEA] border border-red-200 text-[#D93025]' : 'bg-slate-200 border border-slate-300 text-slate-800'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t(f === 'expiring_soon' ? 'this_week' : f)}
              </button>
            ))}
          </div>
        </div>

        {filteredChildren.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
            <p className="text-gray-500">{t('no_kids')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChildren.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </section>

      {isAddModalOpen && (
        <AddChildModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

const CompactStatCard = ({ title, value, icon, colorClass }: { title: string, value: number, icon: React.ReactNode, colorClass: string }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${colorClass}`} title={title}>
    <div className="mb-1 opacity-80">{icon}</div>
    <span className="text-xl font-bold">{value}</span>
    <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight mt-1 opacity-90">{title}</span>
  </div>
);
