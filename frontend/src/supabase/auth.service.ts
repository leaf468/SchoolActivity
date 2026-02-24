/**
 * 인증 관련 서비스
 *
 * Supabase Auth를 사용한 로그인, 회원가입, 소셜 로그인 등
 */

import { supabase } from './client';
import { ServiceResponse } from './types';
import type { User } from '@supabase/supabase-js';

// ========================================
// 회원가입
// ========================================

/**
 * 이메일/비밀번호로 회원가입
 *
 * @param email - 이메일
 * @param password - 비밀번호
 * @param name - 사용자 이름 (선택)
 * @returns ServiceResponse<User>
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<ServiceResponse<User>> {
  try {
    console.log('회원가입 시도:', { email, hasPassword: !!password, name });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          display_name: name || '',
        },
        // 이메일 확인 없이 바로 로그인 가능하도록 설정
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Supabase 회원가입 에러:', error);

      // 이미 존재하는 사용자
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return {
          success: false,
          error: '이미 가입된 이메일입니다.',
        };
      }

      // 비밀번호 정책 위반
      if (error.message.includes('Password') || error.message.includes('password')) {
        return {
          success: false,
          error: '비밀번호는 최소 6자 이상이어야 합니다.',
        };
      }

      // 이메일 형식 오류
      if (error.message.includes('email') || error.message.includes('Email')) {
        return {
          success: false,
          error: '올바른 이메일 형식을 입력해주세요.',
        };
      }

      return { success: false, error: `회원가입 실패: ${error.message}` };
    }

    if (!data.user) {
      console.error('회원가입 응답에 user 정보 없음:', data);
      return { success: false, error: '회원가입에 실패했습니다. 관리자에게 문의하세요.' };
    }

    // 회원가입 성공 로그
    console.log('✅ 회원가입 성공:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
      emailConfirmed: data.user.email_confirmed_at ? '확인됨' : '미확인',
    });

    // 세션이 있으면 자동 로그인된 것
    if (data.session) {
      console.log('✅ 자동 로그인 완료');
    } else {
      console.log('⚠️  이메일 확인 필요 - Supabase 설정에서 "Enable email confirmations" 비활성화 권장');
    }

    return { success: true, data: data.user };
  } catch (err: any) {
    console.error('회원가입 중 예외 발생:', err);
    return { success: false, error: err.message || '회원가입 중 오류가 발생했습니다.' };
  }
}

// ========================================
// 로그인
// ========================================

/**
 * 이메일/비밀번호로 로그인
 *
 * @param email - 이메일
 * @param password - 비밀번호
 * @returns ServiceResponse<User>
 */
export async function signIn(
  email: string,
  password: string
): Promise<ServiceResponse<User>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 이메일 확인 필요 에러 처리
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        return {
          success: false,
          error: '이메일 확인이 필요합니다. 회원가입 시 받은 이메일을 확인하거나 관리자에게 문의하세요.',
        };
      }

      // 잘못된 자격 증명
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // 기타 에러
      console.error('로그인 에러:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: '로그인에 실패했습니다.' };
    }

    return { success: true, data: data.user };
  } catch (err: any) {
    console.error('로그인 중 예외 발생:', err);
    return { success: false, error: err.message || '로그인 중 오류가 발생했습니다.' };
  }
}

// ========================================
// 소셜 로그인 (구글)
// ========================================

/**
 * 구글 소셜 로그인
 *
 * 주의: GCP와 Supabase에서 OAuth 설정이 완료되어야 합니다.
 *
 * GCP 설정 필요 사항:
 * 1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
 * 2. 승인된 리디렉션 URI에 Supabase Callback URL 추가
 *    예: https://<project-ref>.supabase.co/auth/v1/callback
 *
 * Supabase 설정 필요 사항:
 * 1. Authentication > Providers > Google 활성화
 * 2. Client ID와 Client Secret 입력 (GCP에서 발급받은 값)
 * 3. Redirect URLs에 프론트엔드 URL 추가 (예: http://localhost:3000)
 *
 * @param redirectTo - 로그인 후 리디렉션할 URL (선택, 기본값: 현재 origin)
 * @returns ServiceResponse<void>
 */
export async function signInWithGoogle(
  redirectTo?: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || window.location.origin,
        // 추가 옵션 (필요시):
        // queryParams: {
        //   access_type: 'offline',
        //   prompt: 'consent',
        // },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // OAuth 로그인은 리디렉션되므로 success만 반환
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '구글 로그인 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 로그아웃
// ========================================

/**
 * 로그아웃
 *
 * @returns ServiceResponse<void>
 */
export async function signOut(): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || '로그아웃 중 오류가 발생했습니다.' };
  }
}

// ========================================
// 현재 사용자 조회
// ========================================

/**
 * 현재 로그인한 사용자 정보 조회
 *
 * @returns ServiceResponse<User>
 */
export async function getCurrentUser(): Promise<ServiceResponse<User>> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!user) {
      return { success: false, error: '로그인한 사용자가 없습니다.' };
    }

    return { success: true, data: user };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '사용자 정보 조회 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 세션 조회
// ========================================

/**
 * 현재 세션 조회
 *
 * @returns ServiceResponse<Session>
 */
export async function getSession(): Promise<ServiceResponse<any>> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!session) {
      return { success: false, error: '활성화된 세션이 없습니다.' };
    }

    return { success: true, data: session };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 조회 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 인증 상태 변경 리스너
// ========================================

/**
 * 인증 상태 변경 이벤트 구독
 *
 * @param callback - 인증 상태 변경 시 호출될 콜백 함수
 * @returns 구독 취소 함수
 *
 * 사용 예시:
 * ```typescript
 * const unsubscribe = onAuthStateChange((event, session) => {
 *   console.log('Auth event:', event, session);
 * });
 *
 * // 컴포넌트 언마운트 시 구독 취소
 * return () => unsubscribe();
 * ```
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return () => subscription.unsubscribe();
}

// ========================================
// 비밀번호 재설정 (추가 기능)
// ========================================

/**
 * 비밀번호 재설정 이메일 발송
 *
 * @param email - 비밀번호를 재설정할 이메일
 * @returns ServiceResponse<void>
 */
export async function resetPassword(email: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 새 비밀번호로 업데이트
 *
 * @param newPassword - 새 비밀번호
 * @returns ServiceResponse<User>
 */
export async function updatePassword(
  newPassword: string
): Promise<ServiceResponse<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: '비밀번호 업데이트에 실패했습니다.' };
    }

    return { success: true, data: data.user };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '비밀번호 업데이트 중 오류가 발생했습니다.',
    };
  }
}
