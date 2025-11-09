/**
 * 사용자 프로필 서비스
 *
 * user_profiles 테이블 CRUD 작업
 */

import { supabase } from './client';
import { UserProfile, UserProfileInput, ServiceResponse } from './types';

// ========================================
// 프로필 조회
// ========================================

/**
 * 현재 사용자의 프로필 조회
 *
 * @returns ServiceResponse<UserProfile>
 */
export async function getMyProfile(): Promise<ServiceResponse<UserProfile>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '프로필을 찾을 수 없습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 사용자의 프로필 조회 (user_id로)
 *
 * @param userId - 조회할 사용자 ID
 * @returns ServiceResponse<UserProfile>
 */
export async function getProfileByUserId(
  userId: string
): Promise<ServiceResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '프로필을 찾을 수 없습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 조회 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 프로필 생성
// ========================================

/**
 * 프로필 생성
 *
 * 참고: 회원가입 시 트리거로 자동 생성되므로 직접 호출할 일은 적음
 *
 * @param profileData - 프로필 데이터
 * @returns ServiceResponse<UserProfile>
 */
export async function createProfile(
  profileData: UserProfileInput
): Promise<ServiceResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '프로필 생성에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 생성 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 프로필 업데이트
// ========================================

/**
 * 현재 사용자의 프로필 업데이트
 *
 * @param updates - 업데이트할 필드들
 * @returns ServiceResponse<UserProfile>
 */
export async function updateMyProfile(
  updates: Partial<Omit<UserProfileInput, 'user_id'>>
): Promise<ServiceResponse<UserProfile>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '프로필 업데이트에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 업데이트 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 프로필 존재 여부 확인
// ========================================

/**
 * 현재 사용자의 프로필 존재 여부 확인
 *
 * @returns ServiceResponse<boolean>
 */
export async function checkProfileExists(): Promise<ServiceResponse<boolean>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found
      return { success: false, error: error.message };
    }

    return { success: true, data: !!data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 확인 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 헬퍼 함수
// ========================================

/**
 * 프로필이 없으면 생성, 있으면 업데이트
 *
 * @param profileData - 프로필 데이터
 * @returns ServiceResponse<UserProfile>
 */
export async function upsertProfile(
  profileData: UserProfileInput
): Promise<ServiceResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '프로필 저장에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '프로필 저장 중 오류가 발생했습니다.',
    };
  }
}
