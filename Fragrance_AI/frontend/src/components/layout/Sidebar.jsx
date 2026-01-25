import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Beaker, ShoppingBag, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import useUserStore from '../../features/dashboard/state/useUserStore';
import Tooltip from '../ui/Tooltip';

const navItems = [
  { label: 'Home', icon: Home, to: '/dashboard' },
  { label: 'Maestro', icon: MessageCircle, to: '/dashboard/maestro' },
  { label: 'Personalization Lab', icon: Beaker, to: '/dashboard/personalization-lab' },
  { label: 'Shopping', icon: ShoppingBag, to: '/dashboard/shopping' },
];

const Sidebar = ({ collapsed }) => {
  const { isSidebarOpen, toggleSidebar } = useDashboardLayoutStore();
  const { userName, email, avatarUrl, avatarInitials } = useUserStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex items-center gap-2 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-slate-900 font-bold">
              AI
            </div>
            {!collapsed && <span className="text-sm font-semibold">Fragrance AI</span>}
          </div>
          <button
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            <ChevronRight
              className={clsx(
                'h-4 w-4 transition-transform',
                collapsed ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHome = item.to === '/dashboard';
            
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                end={isHome}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    "hover:bg-primary/15 hover:text-primary",
                    isActive && "bg-primary/20 text-primary font-medium"
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );

            return collapsed ? (
              <Tooltip key={item.to} label={item.label} side="right">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-border mt-auto">
          <button className="flex flex-row items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                avatarInitials?.()
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

