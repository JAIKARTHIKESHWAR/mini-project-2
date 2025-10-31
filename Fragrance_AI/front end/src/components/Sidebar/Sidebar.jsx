import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Sidebar = ({ onToggle }) => {
  const { state, dispatch } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const menuItems = [
    { 
      id: 'home', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>, 
      label: 'Home' 
    },
    { 
      id: 'preferences', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>, 
      label: 'Preferences' 
    },
    { 
      id: 'lab', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>, 
      label: 'Personalization Lab' 
    },
    { 
      id: 'recommendations', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>, 
      label: 'Recommendations' 
    },
    { 
      id: 'collections', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>, 
      label: 'Collections' 
    },
    { 
      id: 'gallery', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>, 
      label: 'Gallery' 
    },
    { 
      id: 'settings', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>, 
      label: 'Settings' 
    },
    { 
      id: 'feedback', 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>, 
      label: 'Feedback & Support' 
    }
  ];

  const handlePageChange = (pageId) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: pageId });
  };

  return (
    <nav className={`${isCollapsed ? 'w-16' : 'w-full lg:w-80'} bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-lg border-r border-purple-500/20 h-screen fixed left-0 top-0 flex flex-col z-50 overflow-y-auto transition-all duration-300 rounded-r-3xl`}>
      {/* Header with Hamburger */}
      <div className="p-4 lg:p-6 border-b border-purple-500/20 flex items-center justify-between">
        <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
          <h2 className="text-xl lg:text-2xl font-semibold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Fragrance AI
          </h2>
          <p className="text-xs lg:text-sm text-gray-300">
            Your Intelligent Scent Companion
          </p>
        </div>
        
        {/* Single Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
      
      {/* Navigation Menu */}
      <ul className="flex-1 py-2 lg:py-4 space-y-1">
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3 lg:px-6'} py-3 lg:py-4 text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-300 group ${
                state.currentPage === item.id 
                  ? 'bg-purple-500/15 text-white border-r-4 border-purple-400 shadow-lg shadow-purple-400/20' 
                  : ''
              }`}
              onClick={() => handlePageChange(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`${isCollapsed ? 'mr-0' : 'mr-3 lg:mr-4'} w-5 lg:w-6 text-center group-hover:scale-110 transition-transform text-purple-400`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-xs lg:text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      
    </nav>
  );
};

export default Sidebar;