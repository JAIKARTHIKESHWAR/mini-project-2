import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Beaker, ShoppingBag, ChevronRight, User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import useUserStore from '../../features/dashboard/state/useUserStore';
import Tooltip from '../ui/Tooltip';
import ProductLogo from '../../logo/favicon_ai.png';
import SettingsSlideover from '../settings/SettingsSlideover';

const navItems = [
  { label: 'Home', icon: Home, to: '/dashboard' },
  { label: 'Maestro', icon: MessageCircle, to: '/dashboard/maestro' },
  { label: 'Personalization Lab', icon: Beaker, to: '/dashboard/personalization-lab' },
  { label: 'Shopping', icon: ShoppingBag, to: '/dashboard/shopping' },
];

const Sidebar = ({ collapsed }) => {
  const { isSidebarOpen, toggleSidebar } = useDashboardLayoutStore();
  const { userName, email, avatarUrl, avatarInitials, logout } = useUserStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            {collapsed ? (
              <Tooltip label="Fragrance AI" side="right">
                <img
                  src={ProductLogo}
                  alt="Fragrance AI"
                  className="h-9 w-9 rounded-xl object-cover border border-white/10"
                />
              </Tooltip>
            ) : (
              <>
                <img
                  src={ProductLogo}
                  alt="Fragrance AI"
                  className="h-9 w-9 rounded-xl object-cover border border-white/10"
                />
                <span className="text-sm font-semibold">Fragrance AI</span>
              </>
            )}
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

        {/* Profile Section */}
          <div className="p-3 border-t border-border mt-auto relative">
          <div className="flex flex-col gap-1">
            {/* Profile Menu Dropdown - Above the button */}
            {!collapsed && isProfileMenuOpen && (
              <div className="mb-1 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <NavLink
                  to="/dashboard/personalization-lab"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                      "hover:bg-white/10",
                      isActive && "bg-primary/20 text-primary"
                    )
                  }
                >
                  <Beaker className="w-4 h-4 shrink-0" />
                  <span>Personalization Lab</span>
                </NavLink>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm w-full text-left transition-colors hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm w-full text-left transition-colors hover:bg-white/10"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span>Notifications</span>
                </button>

                <div className="h-px w-full bg-white/10 my-1" />

                <button
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await logout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm w-full text-left transition-colors hover:bg-red-500/20 text-red-400"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Profile Button */}
            {collapsed ? (
              <Tooltip label={`${userName} - ${email}`} side="right">
                <button 
                  className="flex flex-row items-center justify-center w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      avatarInitials?.()
                    )}
                  </div>
                </button>
              </Tooltip>
            ) : (
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex flex-row items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    avatarInitials?.()
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{email}</p>
                </div>
                <ChevronDown 
                  className={clsx(
                    "h-4 w-4 text-slate-400 transition-transform",
                    isProfileMenuOpen && "rotate-180"
                  )} 
                />
              </button>
            )}
          </div>
        </div>
      </div>
      <SettingsSlideover open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Sidebar;

