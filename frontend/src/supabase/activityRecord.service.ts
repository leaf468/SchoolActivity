/**
 * 활동 기록 서비스
 *
 * activity_records 테이블 CRUD 작업
 * - 학생 기본 정보, 활동 입력, AI 생성 초안, 검증 결과, 최종 저장 데이터 관리
 */

import { supabase } from './client';
import {
  ActivityRecord,
  ActivityRecordInput,
  ActivityRecordUpdate,
  RevisionHistory,
  RevisionHistoryInput,
  ServiceResponse,
} from './types';

// ========================================
// 활동 기록 조회
// ========================================

/**
 * 현재 사용자의 모든 활동 기록 조회
 *
 * @param onlyFinalized - true일 경우 최종 확정된 기록만 조회
 * @returns ServiceResponse<ActivityRecord[]>
 */
export async function getMyActivityRecords(
  onlyFinalized: boolean = false
): Promise<ServiceResponse<ActivityRecord[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    let query = supabase
      .from('activity_records')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (onlyFinalized) {
      query = query.eq('is_finalized', true);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 활동 기록 조회 (ID로)
 *
 * @param recordId - 조회할 활동 기록 ID
 * @returns ServiceResponse<ActivityRecord>
 */
export async function getActivityRecordById(
  recordId: string
): Promise<ServiceResponse<ActivityRecord>> {
  try {
    const { data, error } = await supabase
      .from('activity_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '활동 기록을 찾을 수 없습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 세션 ID로 활동 기록 조회
 *
 * @param sessionId - 세션 ID
 * @returns ServiceResponse<ActivityRecord>
 */
export async function getActivityRecordBySessionId(
  sessionId: string
): Promise<ServiceResponse<ActivityRecord>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('activity_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '활동 기록을 찾을 수 없습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 조회 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 활동 기록 생성
// ========================================

/**
 * 새 활동 기록 생성
 *
 * @param recordData - 활동 기록 데이터
 * @returns ServiceResponse<ActivityRecord>
 */
export async function createActivityRecord(
  recordData: Omit<ActivityRecordInput, 'user_id'>
): Promise<ServiceResponse<ActivityRecord>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('activity_records')
      .insert({
        ...recordData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '활동 기록 생성에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 생성 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 활동 기록 업데이트
// ========================================

/**
 * 활동 기록 업데이트
 *
 * @param recordId - 업데이트할 활동 기록 ID
 * @param updates - 업데이트할 필드들
 * @returns ServiceResponse<ActivityRecord>
 */
export async function updateActivityRecord(
  recordId: string,
  updates: ActivityRecordUpdate
): Promise<ServiceResponse<ActivityRecord>> {
  try {
    const { data, error } = await supabase
      .from('activity_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '활동 기록 업데이트에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 업데이트 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 세션 ID로 활동 기록 업데이트 또는 생성 (upsert)
 *
 * @param sessionId - 세션 ID
 * @param recordData - 활동 기록 데이터
 * @returns ServiceResponse<ActivityRecord>
 */
export async function upsertActivityRecordBySession(
  sessionId: string,
  recordData: Omit<ActivityRecordInput, 'user_id' | 'session_id'>
): Promise<ServiceResponse<ActivityRecord>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 먼저 해당 세션의 기록이 있는지 확인
    const existing = await getActivityRecordBySessionId(sessionId);

    if (existing.success && existing.data) {
      // 이미 존재하면 업데이트
      return updateActivityRecord(existing.data.id, recordData);
    } else {
      // 없으면 새로 생성
      return createActivityRecord({
        ...recordData,
        session_id: sessionId,
      });
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 저장 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 활동 기록 삭제
// ========================================

/**
 * 활동 기록 삭제
 *
 * @param recordId - 삭제할 활동 기록 ID
 * @returns ServiceResponse<void>
 */
export async function deleteActivityRecord(
  recordId: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('activity_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 삭제 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 재작성 이력 관리
// ========================================

/**
 * 재작성 이력 조회
 *
 * @param activityRecordId - 활동 기록 ID
 * @returns ServiceResponse<RevisionHistory[]>
 */
export async function getRevisionHistory(
  activityRecordId: string
): Promise<ServiceResponse<RevisionHistory[]>> {
  try {
    const { data, error } = await supabase
      .from('revision_history')
      .select('*')
      .eq('activity_record_id', activityRecordId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '재작성 이력 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 재작성 이력 추가
 *
 * @param revisionData - 재작성 이력 데이터
 * @returns ServiceResponse<RevisionHistory>
 */
export async function addRevisionHistory(
  revisionData: Omit<RevisionHistoryInput, 'user_id'>
): Promise<ServiceResponse<RevisionHistory>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('revision_history')
      .insert({
        ...revisionData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '재작성 이력 추가에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '재작성 이력 추가 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 헬퍼 함수
// ========================================

/**
 * 활동 기록 최종 확정
 *
 * @param recordId - 확정할 활동 기록 ID
 * @param finalText - 최종 텍스트
 * @returns ServiceResponse<ActivityRecord>
 */
export async function finalizeActivityRecord(
  recordId: string,
  finalText: string
): Promise<ServiceResponse<ActivityRecord>> {
  return updateActivityRecord(recordId, {
    final_text: finalText,
    is_finalized: true,
  });
}

/**
 * 초안 저장
 *
 * @param recordId - 활동 기록 ID
 * @param draftText - 초안 텍스트
 * @param confidence - 신뢰도
 * @param amarBreakdown - A-M-A-R 분석
 * @param usedFewShots - 사용된 퓨샷 예시 ID들
 * @returns ServiceResponse<ActivityRecord>
 */
export async function saveDraft(
  recordId: string,
  draftText: string,
  confidence?: number,
  amarBreakdown?: any,
  usedFewShots?: string[]
): Promise<ServiceResponse<ActivityRecord>> {
  return updateActivityRecord(recordId, {
    generated_draft: draftText,
    draft_confidence: confidence,
    amar_breakdown: amarBreakdown,
    used_few_shots: usedFewShots,
  });
}

/**
 * 검증 결과 저장
 *
 * @param recordId - 활동 기록 ID
 * @param verificationResult - 검증 결과 객체
 * @returns ServiceResponse<ActivityRecord>
 */
export async function saveVerificationResult(
  recordId: string,
  verificationResult: any
): Promise<ServiceResponse<ActivityRecord>> {
  return updateActivityRecord(recordId, {
    verification_result: verificationResult,
  });
}

/**
 * 섹션 타입별 활동 기록 조회
 *
 * @param sectionType - 섹션 타입 (subject, autonomy, club, service, career)
 * @returns ServiceResponse<ActivityRecord[]>
 */
export async function getActivityRecordsBySection(
  sectionType: string
): Promise<ServiceResponse<ActivityRecord[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('activity_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('section_type', sectionType)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학년별 활동 기록 조회
 *
 * @param grade - 학년 (1, 2, 3)
 * @returns ServiceResponse<ActivityRecord[]>
 */
export async function getActivityRecordsByGrade(
  grade: number
): Promise<ServiceResponse<ActivityRecord[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('activity_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('student_grade', grade)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 기록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 활동 기록 통계
 *
 * @returns ServiceResponse<{ total: number; finalized: number; draft: number }>
 */
export async function getActivityRecordsStats(): Promise<
  ServiceResponse<{ total: number; finalized: number; draft: number }>
> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('activity_records')
      .select('is_finalized')
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    const total = data?.length || 0;
    const finalized = data?.filter((r) => r.is_finalized).length || 0;
    const draft = total - finalized;

    return { success: true, data: { total, finalized, draft } };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '통계 조회 중 오류가 발생했습니다.',
    };
  }
}
