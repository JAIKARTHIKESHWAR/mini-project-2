import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useAuth() {
  const { state } = useApp();

  const user = useMemo(() => {
    if (state?.user?.email) return state.user;
    try {
      const stored = localStorage.getItem('fragrance_user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  }, [state]);

  return { user };
}


