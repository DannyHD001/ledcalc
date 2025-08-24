import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user, isAdmin) => {
      setUser(user);
      setIsAdmin(isAdmin);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user && isAdmin,
    isUser: !!user, // Any authenticated user
    userEmail: user?.email || '',
  };
}
