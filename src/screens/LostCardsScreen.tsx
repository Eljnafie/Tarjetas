import React, { useEffect, useState, useMemo } from 'react';
import { Child } from '../types';
import { useAuth } from '../auth/AuthProvider';
import { subscribeToChildren } from '../services/db';
import { ChildCard } from '../components/ChildCard';

export const LostCardsScreen: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChildren(user.uid, setChildren);
    return () => unsub();
  }, [user]);

  const lostChildren = useMemo(() => {
    return children.filter(c => c.isLost);
  }, [children]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tarjetas Perdidas</h1>
      </div>

      <div className="grid gap-4">
        {lostChildren.length > 0 ? (
          lostChildren.map(child => (
            <ChildCard key={child.id} child={child} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-2">No hay tarjetas perdidas</h3>
            <p className="text-slate-500">Las tarjetas marcadas como perdidas aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};
