import React from 'react';
import { Bell, Menu, Search, ShoppingCart, SunMoon } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/DropdownMenu';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import useCartStore from '../../features/dashboard/state/useCartStore';
import useUserStore from '../../features/dashboard/state/useUserStore';

const Header = () => {
  const { toggleSidebar, theme, toggleTheme } = useDashboardLayoutStore();
  const { toggleCart, items } = useCartStore();
  const { userName, email, avatarUrl, avatarInitials } = useUserStore();

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <header className="header-root sticky top-0 z-50">
      <div className="header-inner flex flex-row items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="header-brand flex flex-row items-center gap-2 text-sm font-semibold text-white">
          <div className="header-logo w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-slate-900 font-bold">
            AI
          </div>
          <span className="hidden sm:inline">Fragrance Maestro</span>
        </div>

        <div className="header-actions flex flex-row items-center gap-2">
          <div className="header-search hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300">
            <Search className="h-4 w-4" />
            <Input placeholder="Search perfumes, notes, sessions..." className="w-64" />
          </div>

          <Tooltip label="Toggle theme">
            <button className="header-icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 relative" onClick={toggleTheme} aria-label="Toggle theme">
              <SunMoon className="h-5 w-5" />
            </button>
          </Tooltip>

          <Tooltip label="Notifications">
            <button className="header-icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="header-notification-dot absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
            </button>
          </Tooltip>

          <Tooltip label="Cart">
            <button className="header-icon-btn w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 relative" onClick={toggleCart} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-amber-400 text-slate-900 text-[10px] font-semibold px-1">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </Tooltip>

          <DropdownMenu
            trigger={
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <Avatar src={avatarUrl} alt={userName} fallback={avatarInitials?.()} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-slate-400">{email}</p>
                </div>
              </div>
            }
          >
            <DropdownMenuLabel>Profile</DropdownMenuLabel>
            <DropdownMenuItem>{userName}</DropdownMenuItem>
            <DropdownMenuItem className="text-slate-400">{email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Personalization</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-300">Log out</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

