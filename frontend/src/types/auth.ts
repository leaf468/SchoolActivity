/**
 * 인증 관련 타입 정의
 *
 * 참고: 데이터베이스 타입은 ../supabase/types.ts를 사용하세요
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
}

/**
 * @deprecated Use ActivityRecord from '../supabase/types' instead
 */
export interface SavedRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
