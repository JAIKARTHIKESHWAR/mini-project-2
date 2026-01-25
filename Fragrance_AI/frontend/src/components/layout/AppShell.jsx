import React from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Header from './Header';
import Sidebar from './Sidebar';
import useDashboardLayoutStore from '../../features/dashboard/state/useDashboardLayoutStore';
import CartSidebar from '../../features/dashboard/shopping/CartSidebar';

const AppShell = () => {
  const { isSidebarOpen } = useDashboardLayoutStore();

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

