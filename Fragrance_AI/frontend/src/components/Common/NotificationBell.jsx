import React, { useState, useEffect, useRef } from 'react';

const NotificationBell = () => {
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: 1, message: "New fragrance recommendations based on your preferences", time: "2 min ago" },
    { id: 2, message: "Your custom blend 'Midnight Romance' is ready", time: "1 hour ago" },
    { id: 3, message: "Special offer: 20% off on citrus scents", time: "3 hours ago" }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-3 rounded-full hover:bg-purple-500/10 transition-all duration-300 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L14 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
        </svg>
        {hasNotifications && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>
      
      {/* Dropdown with proper positioning and animation */}
      <div className={`absolute right-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-lg border border-purple-500/20 rounded-xl shadow-2xl z-50 transition-all duration-300 ease-out ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <div className="px-4 py-3 border-b border-purple-500/20 flex justify-between items-center">
          <h3 className="font-semibold text-white">Notifications</h3>
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
            {notifications.length} new
          </span>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {notifications.map(notification => (
            <div key={notification.id} className="px-4 py-3 border-b border-purple-500/10 hover:bg-purple-500/5 cursor-pointer transition-colors">
              <p className="text-sm mb-1 text-white">{notification.message}</p>
              <p className="text-xs text-gray-300">{notification.time}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 text-center text-purple-400 hover:bg-purple-500/10 cursor-pointer transition-colors">
          Mark all as read
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;