import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { AuthState } from '../types/auth';
import type { User } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isGuest: false,
    loading: true,
  });

  useEffect(() => {
    // Check for hardcoded admin session in localStorage
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const adminUser = JSON.parse(adminSession);
      setAuthState({
        user: adminUser,
        isAuthenticated: true,
        isGuest: false,
        loading: false,
      });
      return;
    }

    // Check for guest mode
    const guestMode = localStorage.getItem('guest_mode');
    if (guestMode === 'true') {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isGuest: true,
        loading: false,
      });
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
          },
          isAuthenticated: true,
          isGuest: false,
          loading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
          },
          isAuthenticated: true,
          isGuest: false,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check for hardcoded admin credentials
    if (email === 'admin@gmail.com' && password === 'admin8') {
      const adminUser = {
        id: 'admin-user',
        email: 'admin@gmail.com',
        name: '관리자',
        created_at: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem('admin_session', JSON.stringify(adminUser));
      localStorage.removeItem('guest_mode');

      setAuthState({
        user: adminUser,
        isAuthenticated: true,
        isGuest: false,
        loading: false,
      });
      return;
    }

    // Otherwise, proceed with Supabase authentication
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    // Clear localStorage for admin session
    localStorage.removeItem('admin_session');
    localStorage.removeItem('guest_mode');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setAuthState({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      loading: false,
    });
  };

  const continueAsGuest = () => {
    localStorage.setItem('guest_mode', 'true');
    localStorage.removeItem('admin_session');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
