import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, LogOut, Settings, Calendar, AlertCircle } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[260px_1fr] h-screen bg-[#F0F4F2] overflow-hidden">
      {/* Sidebar Desktop / Bottom Nav Mobile */}
      <nav className="bg-white border-r border-[#E2E8F0] md:flex md:flex-col md:justify-between p-6 fixed md:relative bottom-0 w-full z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-none hidden md:flex">
        
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                T
              </span>
              {t('app_title')}
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Gestión Social</p>
          </div>

          <div className="space-y-1">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label={t('dashboard')} />
            <NavItem to="/lost" icon={<AlertCircle size={20} />} label="Tarjetas perdidas" />
          </div>
        </div>
          
        <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
              {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate" title={auth.currentUser?.email || ''}>
                {auth.currentUser?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-400">Educador</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title={t('logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile nav (visible only on small screens) */}
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-10 p-2 flex justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavItem to="/" icon={<LayoutDashboard size={24} />} label={t('dashboard')} hideLabel />
        <NavItem to="/lost" icon={<AlertCircle size={24} />} label="Tarjetas perdidas" hideLabel />
        <button 
          onClick={handleLogout}
          className="p-3 text-slate-400 hover:text-red-500 transition-colors"
          title={t('logout')}
        >
          <LogOut size={24} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto mb-16 md:mb-0">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; hideLabel?: boolean }> = ({ to, icon, label, hideLabel }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-slate-500 hover:bg-slate-50'
      }`
    }
  >
    {icon}
    {!hideLabel && <span className="text-sm">{label}</span>}
  </NavLink>
);
