import { useEffect, useState } from 'react';

type User = {
  id?: string;
  firstName?: string;
  email?: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_me');
      const t = localStorage.getItem('token');
      setToken(t);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch (e) {
      setUser(null);
      setToken(null);
    }
  }, []);

  return { user, token, isAuthenticated: !!token };
};
