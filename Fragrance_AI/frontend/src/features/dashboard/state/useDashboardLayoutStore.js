import { create } from 'zustand';

// Initialize theme from localStorage or default to 'dark'
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  }
  return 'dark';
};

const useDashboardLayoutStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      // Apply theme to document
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
}));

// Apply initial theme on store creation
if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}

export default useDashboardLayoutStore;

