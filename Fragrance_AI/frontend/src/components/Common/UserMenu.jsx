import React, { useState, useEffect, useRef } from 'react';

const UserMenu = ({ onLogout }) => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-2 rounded-full hover:bg-purple-500/10 transition-all duration-300 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        </div>
      </button>
      
      {/* Dropdown with proper positioning and animation */}
      <div className={`absolute right-0 top-full mt-2 min-w-48 bg-slate-800/95 backdrop-blur-lg border border-purple-500/20 rounded-xl shadow-2xl z-50 transition-all duration-300 ease-out ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <div className="px-4 py-3 border-b border-purple-500/20">
          <p className="font-semibold text-white">Fragrance Explorer</p>
          <p className="text-xs text-gray-300">Premium Member</p>
        </div>
        <div className="px-4 py-2 hover:bg-purple-500/10 cursor-pointer transition-colors text-white">Profile</div>
        <div className="px-4 py-2 hover:bg-purple-500/10 cursor-pointer transition-colors text-white">My Blends</div>
        <div className="px-4 py-2 hover:bg-purple-500/10 cursor-pointer transition-colors text-white">Settings</div>
        <div className="border-t border-purple-500/20 my-1"></div>
        <div 
          className="px-4 py-2 text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
          onClick={() => {
            onLogout();
            setIsOpen(false);
          }}
        >
          Logout
        </div>
      </div>
    </div>
  );
};

export default UserMenu;