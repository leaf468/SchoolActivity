/**
 * Supabase 서비스 통합 export
 *
 * 모든 Supabase 관련 서비스를 한 곳에서 import할 수 있도록 통합
 *
 * 사용 예시:
 * ```typescript
 * import { supabase, signIn, getMyProfile, createTodo, getMyActivityRecords } from '@/supabase';
 * ```
 */

// ========================================
// Supabase 클라이언트
// ========================================
export { supabase } from './client';
export type { SupabaseClient } from './client';

// ========================================
// 타입 정의
// ========================================
export type {
  UserProfile,
  UserProfileInput,
  Todo,
  TodoInput,
  ActivityRecord,
  ActivityRecordInput,
  ActivityRecordUpdate,
  RevisionHistory,
  RevisionHistoryInput,
  ServiceResponse,
} from './types';

// ========================================
// 인증 서비스
// ========================================
export {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
} from './auth.service';

// ========================================
// 프로필 서비스
// ========================================
export {
  getMyProfile,
  getProfileByUserId,
  createProfile,
  updateMyProfile,
  checkProfileExists,
  upsertProfile,
} from './profile.service';

// ========================================
// 할 일 서비스
// ========================================
export {
  getMyTodos,
  getTodosByDate,
  getPendingTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  deleteCompletedTodos,
} from './todo.service';

// ========================================
// 활동 기록 서비스
// ========================================
export {
  getMyActivityRecords,
  getActivityRecordById,
  getActivityRecordBySessionId,
  createActivityRecord,
  updateActivityRecord,
  upsertActivityRecordBySession,
  deleteActivityRecord,
  getRevisionHistory,
  addRevisionHistory,
  finalizeActivityRecord,
  saveDraft,
  saveVerificationResult,
  getActivityRecordsBySection,
  getActivityRecordsByGrade,
  getActivityRecordsStats,
} from './activityRecord.service';

// ========================================
// 선생님용 세션 및 학생 관리 서비스
// ========================================
export {
  upsertTeacherSession,
  getMyTeacherSessions,
  getTeacherSessionBySessionId,
  completeTeacherSession,
  deleteTeacherSession,
  addTeacherStudent,
  getTeacherStudentsBySession,
  getTeacherStudentByStudentId,
  updateTeacherStudent,
  updateStudentActivity,
  saveStudentDraft,
  finalizeStudent,
  deleteTeacherStudent,
  getSessionStats,
  getSessionWithStudents,
} from './teacherSession.service';

export type {
  TeacherSessionInput,
  TeacherSessionRecord,
  TeacherStudentInput,
  TeacherStudentRecord,
} from './teacherSession.service';
