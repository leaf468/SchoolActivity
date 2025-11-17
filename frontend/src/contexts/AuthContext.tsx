import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import * as authService from '../supabase/auth.service';
import { AuthState } from '../types/auth';

export type UserMode = 'student' | 'teacher' | null;

interface AuthContextType extends AuthState {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  signIn: (email: string, password: string, userMode?: UserMode) => Promise<void>;
  signUp: (email: string, password: string, name?: string, userMode?: UserMode) => Promise<void>;
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

  const [userMode, setUserModeState] = useState<UserMode>(() => {
    const saved = localStorage.getItem('user_mode');
    return (saved === 'student' || saved === 'teacher') ? saved : null;
  });

  useEffect(() => {
    let subscription: any = null;

    const initializeAuth = async () => {
      // 1. Supabase 세션을 먼저 확인 (최우선)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Supabase 세션이 있으면 localStorage를 clear하고 세션 사용
        localStorage.removeItem('admin_session');
        localStorage.removeItem('guest_mode');

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
        // Supabase 세션이 없으면 localStorage 확인
        const adminSession = localStorage.getItem('admin_session');
        if (adminSession) {
          const adminUser = JSON.parse(adminSession);
          setAuthState({
            user: adminUser,
            isAuthenticated: true,
            isGuest: false,
            loading: false,
          });
          return; // admin은 Supabase listener 불필요
        }

        const guestMode = localStorage.getItem('guest_mode');
        if (guestMode === 'true') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isGuest: true,
            loading: false,
          });
          return; // guest도 listener 불필요
        }

        // 어떤 세션도 없으면 로딩 종료
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes (항상 등록)
    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // 로그인 성공 시 localStorage clear
        localStorage.removeItem('admin_session');
        localStorage.removeItem('guest_mode');

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
        // 로그아웃 시
        setAuthState({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          loading: false,
        });
      }
    });

    subscription = sub;

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    if (mode) {
      localStorage.setItem('user_mode', mode);
    } else {
      localStorage.removeItem('user_mode');
    }
  };

  const signIn = async (email: string, password: string, mode?: UserMode) => {
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

      // Set user mode if provided
      if (mode) {
        setUserMode(mode);
      }
      return;
    }

    // Clear localStorage before Supabase login
    localStorage.removeItem('admin_session');
    localStorage.removeItem('guest_mode');

    // Proceed with Supabase authentication using service layer
    const result = await authService.signIn(email, password);
    if (!result.success) {
      throw new Error(result.error || '로그인에 실패했습니다.');
    }

    // Set user mode if provided
    if (mode) {
      setUserMode(mode);
    }
    // onAuthStateChange listener가 자동으로 상태를 업데이트함
  };

  const signUp = async (email: string, password: string, name?: string, mode?: UserMode) => {
    const result = await authService.signUp(email, password, name);
    if (!result.success) {
      throw new Error(result.error || '회원가입에 실패했습니다.');
    }

    // Set user mode if provided
    if (mode) {
      setUserMode(mode);
    }
  };

  const signInWithGoogle = async () => {
    const result = await authService.signInWithGoogle(window.location.origin);
    if (!result.success) {
      throw new Error(result.error || '구글 로그인에 실패했습니다.');
    }
  };

  const signOut = async () => {
    // Clear localStorage for admin session and user mode
    localStorage.removeItem('admin_session');
    localStorage.removeItem('guest_mode');
    localStorage.removeItem('user_mode');

    const result = await authService.signOut();
    if (!result.success) {
      throw new Error(result.error || '로그아웃에 실패했습니다.');
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      loading: false,
    });

    setUserModeState(null);
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
        userMode,
        setUserMode,
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
