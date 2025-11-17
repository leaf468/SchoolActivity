/**
 * 선생님용 세션 및 학생 관리 서비스
 *
 * teacher_sessions, teacher_students 테이블 CRUD 작업
 */

import { supabase } from './client';

// ========================================
// 타입 정의
// ========================================

export interface TeacherSessionInput {
  session_id: string;
  grade: number;
  semester: string;
  section_type: string;
  subject?: string;
  teacher_name?: string;
  title?: string;
}

export interface TeacherSessionRecord {
  id: string;
  user_id: string;
  session_id: string;
  grade: number;
  semester: string;
  section_type: string;
  subject?: string;
  teacher_name?: string;
  title?: string;
  is_completed: boolean;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherStudentInput {
  session_id: string;
  student_id: string;
  student_name: string;
  class_number?: string;
  desired_major?: string;
  track?: string;
  activity_details?: any;
  emphasis_keywords?: string[];
}

export interface TeacherStudentRecord {
  id: string;
  session_id: string;
  user_id: string;
  student_id: string;
  student_name: string;
  class_number?: string;
  desired_major?: string;
  track?: string;
  activity_details?: any;
  emphasis_keywords?: string[];
  generated_draft?: string;
  final_text?: string;
  is_finalized: boolean;
  verification_result?: any;
  draft_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// teacher_sessions 관련 함수
// ========================================

/**
 * 선생님 세션 생성 또는 업데이트 (upsert)
 */
export async function upsertTeacherSession(
  sessionData: TeacherSessionInput
): Promise<ServiceResponse<TeacherSessionRecord>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 먼저 해당 session_id가 있는지 확인
    const { data: existing } = await supabase
      .from('teacher_sessions')
      .select('*')
      .eq('session_id', sessionData.session_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // 이미 존재하면 업데이트
      const { data, error } = await supabase
        .from('teacher_sessions')
        .update({
          grade: sessionData.grade,
          semester: sessionData.semester,
          section_type: sessionData.section_type,
          subject: sessionData.subject,
          teacher_name: sessionData.teacher_name,
          title: sessionData.title,
        })
        .eq('session_id', sessionData.session_id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      // 없으면 생성
      const { data, error } = await supabase
        .from('teacher_sessions')
        .insert({
          ...sessionData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 저장 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 내 모든 선생님 세션 조회
 */
export async function getMyTeacherSessions(): Promise<ServiceResponse<TeacherSessionRecord[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * session_id로 특정 세션 조회
 */
export async function getTeacherSessionBySessionId(
  sessionId: string
): Promise<ServiceResponse<TeacherSessionRecord>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: '세션을 찾을 수 없습니다.' };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 세션 완료 표시
 */
export async function completeTeacherSession(
  sessionId: string
): Promise<ServiceResponse<TeacherSessionRecord>> {
  try {
    const { data, error } = await supabase
      .from('teacher_sessions')
      .update({ is_completed: true })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 완료 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 세션 삭제
 */
export async function deleteTeacherSession(
  sessionId: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('teacher_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 삭제 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// teacher_students 관련 함수
// ========================================

/**
 * 학생 추가
 */
export async function addTeacherStudent(
  studentData: TeacherStudentInput
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_students')
      .insert({
        ...studentData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '학생 추가 중 오류가 발생했습니다.',
    };
  }
}

/**
 * session_id로 학생 목록 조회
 */
export async function getTeacherStudentsBySession(
  sessionId: string
): Promise<ServiceResponse<TeacherStudentRecord[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_students')
      .select('*')
      .eq('session_id', sessionId)
      .order('student_name');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '학생 목록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * student_id로 특정 학생 조회
 */
export async function getTeacherStudentByStudentId(
  studentId: string
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_students')
      .select('*')
      .eq('user_id', user.id)
      .eq('student_id', studentId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: '학생을 찾을 수 없습니다.' };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '학생 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학생 정보 업데이트
 */
export async function updateTeacherStudent(
  studentId: string,
  updates: Partial<TeacherStudentInput>
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data, error } = await supabase
      .from('teacher_students')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '학생 정보 업데이트 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학생의 활동 정보 업데이트
 */
export async function updateStudentActivity(
  studentId: string,
  activityDetails: any,
  emphasisKeywords?: string[]
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data, error } = await supabase
      .from('teacher_students')
      .update({
        activity_details: activityDetails,
        emphasis_keywords: emphasisKeywords || null,
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '활동 정보 업데이트 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학생의 AI 생성 초안 저장
 */
export async function saveStudentDraft(
  studentId: string,
  draftText: string,
  confidence?: number,
  verificationResult?: any
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data, error } = await supabase
      .from('teacher_students')
      .update({
        generated_draft: draftText,
        draft_confidence: confidence || null,
        verification_result: verificationResult || null,
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '초안 저장 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학생의 최종 텍스트 저장 및 확정
 */
export async function finalizeStudent(
  studentId: string,
  finalText: string
): Promise<ServiceResponse<TeacherStudentRecord>> {
  try {
    const { data, error } = await supabase
      .from('teacher_students')
      .update({
        final_text: finalText,
        is_finalized: true,
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '최종 저장 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 학생 삭제
 */
export async function deleteTeacherStudent(
  studentId: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('teacher_students')
      .delete()
      .eq('student_id', studentId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '학생 삭제 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 통계 및 헬퍼 함수
// ========================================

/**
 * 세션별 통계 조회
 */
export async function getSessionStats(
  sessionId: string
): Promise<ServiceResponse<{
  total: number;
  finalized: number;
  pending: number;
}>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('teacher_students')
      .select('is_finalized')
      .eq('session_id', sessionId);

    if (error) return { success: false, error: error.message };

    const total = data?.length || 0;
    const finalized = data?.filter(s => s.is_finalized).length || 0;
    const pending = total - finalized;

    return { success: true, data: { total, finalized, pending } };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '통계 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 세션의 모든 학생 일괄 조회 (활동 정보 포함)
 */
export async function getSessionWithStudents(
  sessionId: string
): Promise<ServiceResponse<{
  session: TeacherSessionRecord;
  students: TeacherStudentRecord[];
}>> {
  try {
    const sessionResult = await getTeacherSessionBySessionId(sessionId);
    if (!sessionResult.success || !sessionResult.data) {
      return { success: false, error: sessionResult.error };
    }

    const studentsResult = await getTeacherStudentsBySession(sessionId);
    if (!studentsResult.success) {
      return { success: false, error: studentsResult.error };
    }

    return {
      success: true,
      data: {
        session: sessionResult.data,
        students: studentsResult.data || [],
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '세션 및 학생 정보 조회 중 오류가 발생했습니다.',
    };
  }
}
