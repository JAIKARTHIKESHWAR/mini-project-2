import { create } from 'zustand';

const initialsFromName = (name) => {
  if (!name) return 'GU';
  const parts = name.trim().split(' ');
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

const useUserStore = create((set) => ({
  userName: 'Guest User',
  email: 'guest@fragrance.ai',
  avatarUrl: '',
  isEmailLinked: false,
  setUser: ({ userName, email, avatarUrl, isEmailLinked }) =>
    set((state) => ({
      userName: userName || state.userName,
      email: email || state.email,
      avatarUrl: avatarUrl ?? state.avatarUrl,
      isEmailLinked: isEmailLinked ?? state.isEmailLinked,
    })),
  avatarInitials: () => initialsFromName(useUserStore.getState().userName),
}));

export default useUserStore;

