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
          "transition-all duration-300 border border-border/10",
          "fixed md:relative top-0 left-0 h-[calc(100vh-24px)] z-40 my-3 ml-3",
          "bg-card/95 backdrop-blur-xl rounded-[24px]",
          isSidebarOpen ? "w-64" : "w-16",
          "md:block",
          isSidebarOpen ? "block" : "hidden md:block"
        )}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
      >
        <Sidebar collapsed={!isSidebarOpen} />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-0">
        <Header />

        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>

      <CartSidebar />
    </div>
  );
};

export default AppShell;

