/**
 * Supabase 데이터베이스 타입 정의
 *
 * 이 파일은 데이터베이스 스키마와 일치하는 TypeScript 타입을 정의합니다.
 */

// ========================================
// 데이터베이스 테이블 타입
// ========================================

/**
 * user_profiles 테이블
 * 사용자 프로필 정보 (마이페이지 - 현재 정보 + 목표)
 */
export interface UserProfile {
  id: string;
  user_id: string;

  // 현재 정보
  school: string | null;
  grade: string | null;
  semester: string | null;

  // 목표
  target_university: string | null;
  target_major: string | null;
  university_slogan: string | null;

  // 메타데이터
  created_at: string;
  updated_at: string;
}

/**
 * user_profiles 입력 타입 (INSERT/UPDATE용)
 */
export interface UserProfileInput {
  user_id: string;
  school?: string | null;
  grade?: string | null;
  semester?: string | null;
  target_university?: string | null;
  target_major?: string | null;
  university_slogan?: string | null;
}

/**
 * todos 테이블
 * 할 일 관리
 */
export interface Todo {
  id: string;
  user_id: string;
  text: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * todos 입력 타입 (INSERT/UPDATE용)
 */
export interface TodoInput {
  user_id: string;
  text: string;
  done?: boolean;
  due_date?: string | null;
}

/**
 * activity_records 테이블
 * 생기부 작성 전체 과정 데이터
 */
export interface ActivityRecord {
  id: string;
  user_id: string;
  session_id: string;

  // 학생 기본 정보
  student_name: string | null;
  student_grade: number | null;
  desired_major: string | null;
  track: string | null;
  school: string | null;
  class_number: string | null;

  // 활동 입력 정보
  section_type: string | null;
  subject: string | null;
  activity_summary: string | null;
  activity_date: string | null;
  keywords: string[] | null; // JSONB
  activity_details: any | null; // JSONB

  // AI 생성 초안
  generated_draft: string | null;
  draft_confidence: number | null;
  used_few_shots: string[] | null; // JSONB
  amar_breakdown: any | null; // JSONB

  // 검증 결과
  verification_result: any | null; // JSONB

  // 최종 결과
  final_text: string | null;
  is_finalized: boolean;

  // 메타데이터
  title: string;
  created_at: string;
  updated_at: string;
}

/**
 * activity_records 입력 타입 (INSERT용)
 */
export interface ActivityRecordInput {
  user_id: string;
  session_id: string;
  title: string;

  // 학생 기본 정보
  student_name?: string | null;
  student_grade?: number | null;
  desired_major?: string | null;
  track?: string | null;
  school?: string | null;
  class_number?: string | null;

  // 활동 입력 정보
  section_type?: string | null;
  subject?: string | null;
  activity_summary?: string | null;
  activity_date?: string | null;
  keywords?: string[] | null;
  activity_details?: any | null;

  // AI 생성 초안
  generated_draft?: string | null;
  draft_confidence?: number | null;
  used_few_shots?: string[] | null;
  amar_breakdown?: any | null;

  // 검증 결과
  verification_result?: any | null;

  // 최종 결과
  final_text?: string | null;
  is_finalized?: boolean;
}

/**
 * activity_records 업데이트 타입 (UPDATE용)
 */
export interface ActivityRecordUpdate {
  title?: string;

  // 학생 기본 정보
  student_name?: string | null;
  student_grade?: number | null;
  desired_major?: string | null;
  track?: string | null;
  school?: string | null;
  class_number?: string | null;

  // 활동 입력 정보
  section_type?: string | null;
  subject?: string | null;
  activity_summary?: string | null;
  activity_date?: string | null;
  keywords?: string[] | null;
  activity_details?: any | null;

  // AI 생성 초안
  generated_draft?: string | null;
  draft_confidence?: number | null;
  used_few_shots?: string[] | null;
  amar_breakdown?: any | null;

  // 검증 결과
  verification_result?: any | null;

  // 최종 결과
  final_text?: string | null;
  is_finalized?: boolean;
}

/**
 * revision_history 테이블
 * 초안 재작성 이력
 */
export interface RevisionHistory {
  id: string;
  activity_record_id: string;
  user_id: string;

  // 재작성 정보
  original_draft: string;
  revision_request: string | null;
  revised_draft: string;

  // 메타데이터
  created_at: string;
}

/**
 * revision_history 입력 타입 (INSERT용)
 */
export interface RevisionHistoryInput {
  activity_record_id: string;
  user_id: string;
  original_draft: string;
  revision_request?: string | null;
  revised_draft: string;
}

// ========================================
// 서비스 응답 타입
// ========================================

/**
 * API 응답 공통 타입
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
