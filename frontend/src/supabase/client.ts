/**
 * Supabase 클라이언트 설정
 *
 * 환경변수:
 * - NEXT_PUBLIC_SUPABASE_URL 또는 REACT_APP_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY 또는 REACT_APP_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (서버 사이드 전용, 현재는 미사용)
 */

import { createClient } from '@supabase/supabase-js';

// 환경변수 가져오기 (여러 형식 지원 + fallback)
const supabaseUrl =
  process.env.REACT_APP_PUBLIC_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.REACT_APP_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// 환경변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Required environment variables:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  console.error('\nPlease add these in Vercel Dashboard → Settings → Environment Variables');
}

// Supabase 클라이언트 생성
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // 인증 설정
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'school-activity-app',
      },
    },
  }
);

// 타입 추론을 위한 Database 타입 export
export type SupabaseClient = typeof supabase;
