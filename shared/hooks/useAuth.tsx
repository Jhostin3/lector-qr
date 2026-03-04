import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  UserProfile,
  UserRole,
} from '../../services/authService';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario actual al arrancar
    getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));

    // Escuchar cambios de sesión (login/logout externo, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        const profile = await getCurrentUser();
        setUser(profile);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const profile = await signIn(email, password);
    setUser(profile);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    const profile = await signUp(name, email, password, role);
    setUser(profile);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
