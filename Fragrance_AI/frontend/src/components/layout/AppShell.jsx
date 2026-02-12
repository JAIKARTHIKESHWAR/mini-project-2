import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Header from './Header';
import Sidebar from './Sidebar';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import useUserStore from '../../features/dashboard/state/useUserStore';
import CartSidebar from '../../features/dashboard/shopping/CartSidebar';

const AppShell = () => {
  const { isSidebarOpen } = useDashboardLayoutStore();
  const { fetchUserProfile, setUser } = useUserStore();

  // Fetch user profile from database when dashboard loads
  useEffect(() => {
    // First, try to get user data from localStorage as a fallback
    try {
      const storedUser = localStorage.getItem('fragrance_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.username || user.email) {
          const displayName = user.username || 
                             (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                             (user.firstName || user.lastName) ||
                             (user.email ? user.email.split('@')[0] : 'Guest User');
          
          setUser({
            userName: displayName,
            email: user.email || 'guest@fragrance.ai',
            avatarUrl: user.profileImage || '',
          });
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }

    // Then fetch fresh data from the database
    fetchUserProfile();
  }, [fetchUserProfile, setUser]);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background text-white">
      
      {/* SIDEBAR */}
      <aside
        className={clsx(
          "transition-all duration-300 border-r border-border",
          "fixed md:relative top-0 left-0 h-screen z-40",
          isSidebarOpen ? "w-64" : "w-16",
          "md:block",
          isSidebarOpen ? "block" : "hidden md:block"
        )}
      >
        <Sidebar collapsed={!isSidebarOpen} />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-0">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <CartSidebar />
    </div>
  );
};

export default AppShell;

