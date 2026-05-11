import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, isSameDay, format, addDays } from 'date-fns';
import { es, ca } from 'date-fns/locale';
import { Calendar, Image as ImageIcon, MoreVertical, Edit2, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { Child } from '../types';
import { updateChild } from '../services/db';
import { EditChildModal } from './EditChildModal';

export const ChildCard: React.FC<{ child: Child }> = ({ child }) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const now = new Date();
  const expDate = new Date(child.expirationDate);
  const daysLeft = differenceInDays(expDate, now);
  const isToday = isSameDay(expDate, now);
  
  const locale = i18n.language === 'ca' ? ca : es;

  let pillColor = 'bg-[#E6F4EA] text-[#1E7E34]';
  let Icon = CheckCircle2;
  
  if (child.isLost) {
    pillColor = 'bg-slate-200 text-slate-600';
    Icon = AlertCircle;
  } else if ((daysLeft < 0 && !isToday) || daysLeft <= 3) {
    pillColor = 'bg-[#FDECEA] text-[#D93025]';
    Icon = AlertCircle;
  } else if (daysLeft <= 7) {
    pillColor = 'bg-[#FFF8E1] text-[#B45309]';
    Icon = AlertCircle;
  }

  const handleQuickRenew = async (days: number) => {
    const newDate = addDays(expDate, days).getTime();
    await updateChild(child.id, { expirationDate: newDate, isLost: false });
    setIsMenuOpen(false);
  };

  const handleMarkLost = async () => {
    await updateChild(child.id, { isLost: true });
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={`bg-white p-4 rounded-2xl shadow-sm border ${child.isLost ? 'border-dashed border-slate-300 opacity-75' : 'border-slate-100'} flex items-center justify-between gap-4 flex-wrap`}>
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 ${child.isLost ? 'grayscale opacity-50' : ''}`}>
            {child.photoUrl ? (
              <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl font-bold text-slate-500">{child.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className={`font-bold truncate ${child.isLost ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{child.name}</h4>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <Calendar size={12} />
              <span>{format(expDate, 'dd MMM yyyy', { locale })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center flex-1">
          <span className={`status-pill line-clamp-1 text-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold ${pillColor}`}>
            {child.isLost ? 'Perdida' : 
             isToday ? t('expires_today') : 
             daysLeft < 0 ? t('expired_ago', { days: Math.abs(daysLeft) }) : 
             t('days_left', { days: daysLeft })}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
            {child.notes ? child.notes.slice(0, 30) + (child.notes.length > 30 ? '...' : '') : `Vence el ${format(expDate, 'dd MMM', { locale })}`}
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
          >
            {t('edit_kid')}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"
          >
            <span>{child.isLost ? 'Opciones' : 'Renovar'}</span>
            <MoreVertical size={16} className="-mr-1 opacity-80" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('quick_renew')}
              </div>
              {!child.isLost && (
                <>
                  <button 
                    onClick={() => handleQuickRenew(30)}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <RotateCw size={16} />
                    {t('renew_30')}
                  </button>
                  <button 
                    onClick={() => handleQuickRenew(90)}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <RotateCw size={16} />
                    {t('renew_90')}
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={handleMarkLost}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    Marcar como perdida
                  </button>
                </>
              )}
              {child.isLost && (
                <button 
                  onClick={() => handleQuickRenew(0)}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Marcar como encontrada
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <EditChildModal child={child} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
};
