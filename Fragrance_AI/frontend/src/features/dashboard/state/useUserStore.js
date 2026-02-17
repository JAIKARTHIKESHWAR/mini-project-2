import { create } from 'zustand';

const initialsFromName = (name) => {
  if (!name) return 'GU';
  const parts = name.trim().split(' ');
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

const useUserStore = create((set, get) => ({
  userId: null,
  userName: 'Guest User',
  email: 'guest@fragrance.ai',
  avatarUrl: '',
  isEmailLinked: false,
  isLoading: false,
  setUser: ({ userId, userName, email, avatarUrl, isEmailLinked }) =>
    set((state) => ({
      userId: userId || state.userId,
      userName: userName || state.userName,
      email: email || state.email,
      avatarUrl: avatarUrl ?? state.avatarUrl,
      isEmailLinked: isEmailLinked ?? state.isEmailLinked,
    })),
  fetchUserProfile: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        const { id, username, email, profileImage, firstName, lastName } = data.user;

        // Prioritize username from DB first, then fallback to other options
        const displayName = username ||
          (firstName && lastName ? `${firstName} ${lastName}` : null) ||
          (firstName || lastName) ||
          (email ? email.split('@')[0] : 'Guest User');

        set({
          userId: id,
          userName: username || displayName, // Use username from DB first
          email: email || get().email,
          avatarUrl: profileImage || '',
          isLoading: false,
        });

        // Store user data in localStorage for quick access (not tokens)
        localStorage.setItem('fragrance_user', JSON.stringify({
          id,
          username: username || displayName, // Store actual username from DB
          email,
          profileImage,
          firstName,
          lastName,
        }));
      } else {
        console.error('Failed to fetch user profile:', data.message);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ isLoading: false });
    }
  },
  avatarInitials: () => initialsFromName(useUserStore.getState().userName),
  logout: async () => {
    // Import toast dynamically to avoid issues
    const { toast } = await import('sonner');

    // Show loading toast
    const toastId = toast.loading('Logging out...', {
      style: {
        background: '#000000',
        color: '#fbbf24',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      },
    });

    try {
      // Call logout API endpoint (cookies will be sent automatically)
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Continue with logout even if API call fails
    }

    // Wait 3000ms before showing success, clearing data, and redirecting
    // Keep profile visible during this time
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success('Logged out successfully', {
        style: {
          background: '#000000',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      });

      // Clear user data from localStorage (tokens are in cookies, not localStorage)
      localStorage.removeItem('fragrance_user');

      // Reset store to default values only right before redirect
      set({
        userId: null,
        userName: 'Guest User',
        email: 'guest@fragrance.ai',
        avatarUrl: '',
        isEmailLinked: false,
        isLoading: false,
      });

      // Redirect to landing page immediately after clearing data
      window.location.href = '/';
    }, 3000);
  },
}));

export default useUserStore;

