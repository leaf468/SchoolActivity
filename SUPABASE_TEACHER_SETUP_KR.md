# Supabase 선생님용 테이블 설정 가이드

## 📋 개요

이 문서는 SchoolActivity 프로젝트의 선생님용 기능을 위한 Supabase 데이터베이스 설정 방법을 설명합니다.

---

## 🔧 실행 방법

### 1. Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2. SQL 실행
1. `supabase_teacher_setup.sql` 파일의 전체 내용을 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭하여 실행

---

## 📊 데이터베이스 변경 사항

### 1. **user_profiles 테이블 수정**

#### 추가된 컬럼
```sql
user_mode text DEFAULT 'student' CHECK (user_mode IN ('student', 'teacher'))
```

#### 설명
- **목적**: 사용자가 학생용인지 선생님용인지 구분
- **가능한 값**: `'student'` 또는 `'teacher'`
- **기본값**: `'student'` (기존 사용자 호환성)
- **인덱스**: 조회 성능 향상을 위한 인덱스 추가

#### 사용 예시
```typescript
// 회원가입 시
await createProfile({
  user_id: user.id,
  user_mode: 'teacher',  // 또는 'student'
  school: '서울고등학교',
  // ...
});

// 조회 시
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .eq('user_mode', 'teacher')
  .single();
```

---

### 2. **teacher_sessions 테이블 (신규 생성)**

#### 테이블 구조
| 컬럼명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `id` | uuid | 고유 ID (자동 생성) | ✅ |
| `user_id` | uuid | 선생님 사용자 ID | ✅ |
| `session_id` | text | 프론트엔드 세션 ID | ✅ |
| `grade` | integer | 학년 (1~3) | ✅ |
| `semester` | text | 학기 ('1' 또는 '2') | ✅ |
| `section_type` | text | 섹션 타입 (subject, autonomy 등) | ✅ |
| `subject` | text | 과목명 (교과세특인 경우) | ❌ |
| `teacher_name` | text | 선생님 이름 | ❌ |
| `title` | text | 세션 제목 | ❌ |
| `is_completed` | boolean | 작성 완료 여부 | ❌ |
| `student_count` | integer | 포함된 학생 수 (자동 계산) | ❌ |
| `created_at` | timestamptz | 생성 시간 | ✅ |
| `updated_at` | timestamptz | 수정 시간 | ✅ |

#### 설명
- **목적**: 선생님의 생기부 작성 세션 정보를 저장
- **세션 개념**: 같은 과목/활동의 여러 학생 생기부를 한 번에 작성하는 단위
- **자동 계산**: `student_count`는 `teacher_students` 테이블과 연동되어 자동 업데이트

#### 사용 예시
```typescript
// 세션 생성
const { data: session } = await supabase
  .from('teacher_sessions')
  .insert({
    user_id: user.id,
    session_id: `session_${Date.now()}`,
    grade: 1,
    semester: '1',
    section_type: 'subject',
    subject: '수학',
    teacher_name: '김선생',
    title: '1학년 1학기 수학 세특'
  })
  .select()
  .single();

// 세션 조회
const { data: sessions } = await supabase
  .from('teacher_sessions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// 세션 완료 표시
await supabase
  .from('teacher_sessions')
  .update({ is_completed: true })
  .eq('session_id', sessionId);
```

---

### 3. **teacher_students 테이블 (신규 생성)**

#### 테이블 구조
| 컬럼명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `id` | uuid | 고유 ID (자동 생성) | ✅ |
| `session_id` | text | 세션 ID | ✅ |
| `user_id` | uuid | 선생님 사용자 ID | ✅ |
| `student_id` | text | 학생 고유 ID (프론트엔드 생성) | ✅ |
| `student_name` | text | 학생 이름 | ✅ |
| `class_number` | text | 반/번호 (예: "3반 12번") | ❌ |
| `desired_major` | text | 희망 전공 | ❌ |
| `track` | text | 계열 | ❌ |
| `activity_details` | jsonb | 활동 상세 정보 (JSONB) | ❌ |
| `emphasis_keywords` | jsonb | 강조 키워드 배열 | ❌ |
| `generated_draft` | text | AI 생성 초안 | ❌ |
| `final_text` | text | 최종 수정 텍스트 | ❌ |
| `is_finalized` | boolean | 최종 확정 여부 | ❌ |
| `verification_result` | jsonb | 검증 결과 | ❌ |
| `draft_confidence` | numeric(3,2) | 초안 신뢰도 (0.00~1.00) | ❌ |
| `created_at` | timestamptz | 생성 시간 | ✅ |
| `updated_at` | timestamptz | 수정 시간 | ✅ |

#### 설명
- **목적**: 선생님이 관리하는 학생 정보와 생성된 생기부를 저장
- **JSONB 사용**: 복잡한 객체 구조를 유연하게 저장
- **학생별 관리**: 각 학생마다 별도의 레코드로 관리
- **진행 상황 추적**: `is_finalized`로 완료 여부 확인

#### 사용 예시
```typescript
// 학생 추가
const { data: student } = await supabase
  .from('teacher_students')
  .insert({
    session_id: sessionId,
    user_id: user.id,
    student_id: `student_${Date.now()}`,
    student_name: '김학생',
    class_number: '3반 12번',
    desired_major: '경영학과',
    track: '상경계열'
  })
  .select()
  .single();

// 활동 정보 업데이트
await supabase
  .from('teacher_students')
  .update({
    activity_details: {
      subject: '수학',
      activities: [
        {
          id: 'act1',
          content: '미적분 심화 탐구',
          learnings: '극한의 개념 이해'
        }
      ]
    },
    emphasis_keywords: ['미적분', '심화탐구', '문제해결']
  })
  .eq('student_id', studentId);

// AI 초안 저장
await supabase
  .from('teacher_students')
  .update({
    generated_draft: aiGeneratedText,
    draft_confidence: 0.92
  })
  .eq('student_id', studentId);

// 최종 확정
await supabase
  .from('teacher_students')
  .update({
    final_text: finalEditedText,
    is_finalized: true
  })
  .eq('student_id', studentId);

// 세션별 학생 조회
const { data: students } = await supabase
  .from('teacher_students')
  .select('*')
  .eq('session_id', sessionId)
  .order('student_name');
```

---

## 🔒 보안 설정 (Row Level Security)

### RLS 정책 설명

모든 테이블에 RLS(Row Level Security)가 활성화되어 있으며, 각 사용자는 **자신의 데이터만** 접근할 수 있습니다.

#### teacher_sessions 정책
- ✅ **SELECT**: 자신이 생성한 세션만 조회 가능
- ✅ **INSERT**: 자신의 user_id로만 세션 생성 가능
- ✅ **UPDATE**: 자신의 세션만 수정 가능
- ✅ **DELETE**: 자신의 세션만 삭제 가능

#### teacher_students 정책
- ✅ **SELECT**: 자신이 추가한 학생만 조회 가능
- ✅ **INSERT**: 자신의 user_id로만 학생 추가 가능
- ✅ **UPDATE**: 자신의 학생 데이터만 수정 가능
- ✅ **DELETE**: 자신의 학생 데이터만 삭제 가능

### 보안 특징
- 🔐 **자동 적용**: Supabase 클라이언트에서 자동으로 user_id 필터링
- 🔐 **SQL Injection 방지**: Supabase의 내장 보안 기능
- 🔐 **데이터 격리**: 다른 선생님의 데이터는 절대 조회 불가

---

## 🚀 자동화 기능

### 1. student_count 자동 업데이트

**동작 방식:**
- `teacher_students` 테이블에 학생이 추가/수정/삭제될 때
- 해당 세션의 `teacher_sessions.student_count`가 자동으로 업데이트됨

**트리거:**
```sql
CREATE TRIGGER trigger_update_student_count_insert
AFTER INSERT ON public.teacher_students
FOR EACH ROW
EXECUTE FUNCTION update_teacher_session_student_count();
```

**예시:**
```typescript
// 학생 추가
await supabase.from('teacher_students').insert({
  session_id: 'session_123',
  student_name: '김학생',
  // ...
});

// teacher_sessions의 student_count가 자동으로 1 증가됨!
```

### 2. updated_at 자동 업데이트

**동작 방식:**
- 모든 테이블의 레코드가 UPDATE될 때
- `updated_at` 컬럼이 자동으로 현재 시간으로 업데이트됨

---

## 📝 프론트엔드 연동 가이드

### 1. 선생님용 서비스 파일 생성

```typescript
// /frontend/src/supabase/teacherSession.service.ts

import { supabase } from './client';

// 세션 생성
export async function createTeacherSession(sessionData: {
  session_id: string;
  grade: number;
  semester: string;
  section_type: string;
  subject?: string;
  teacher_name?: string;
  title?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { data, error } = await supabase
    .from('teacher_sessions')
    .insert({ ...sessionData, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// 세션 조회
export async function getTeacherSessions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { data, error } = await supabase
    .from('teacher_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// 학생 추가
export async function addTeacherStudent(studentData: {
  session_id: string;
  student_id: string;
  student_name: string;
  class_number?: string;
  desired_major?: string;
  track?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { data, error } = await supabase
    .from('teacher_students')
    .insert({ ...studentData, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// 학생 목록 조회
export async function getTeacherStudents(sessionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { data, error } = await supabase
    .from('teacher_students')
    .select('*')
    .eq('session_id', sessionId)
    .order('student_name');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// 생기부 초안 저장
export async function saveStudentDraft(
  studentId: string,
  draftText: string,
  confidence?: number
) {
  const { data, error } = await supabase
    .from('teacher_students')
    .update({
      generated_draft: draftText,
      draft_confidence: confidence
    })
    .eq('student_id', studentId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// 최종 텍스트 저장
export async function finalizeStudent(
  studentId: string,
  finalText: string
) {
  const { data, error } = await supabase
    .from('teacher_students')
    .update({
      final_text: finalText,
      is_finalized: true
    })
    .eq('student_id', studentId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
```

### 2. TeacherContext 수정

```typescript
// /frontend/src/contexts/TeacherContext.tsx

import { createTeacherSession, getTeacherSessions } from '../supabase/teacherSession.service';

// Context에서 Supabase 연동
const saveToSupabase = async () => {
  if (!isAuthenticated || isGuest) return;

  const result = await createTeacherSession({
    session_id: state.sessionId,
    grade: state.basicInfo.grade,
    semester: state.basicInfo.semester,
    section_type: state.basicInfo.sectionType,
    subject: state.basicInfo.subject,
    teacher_name: state.basicInfo.teacherName,
    title: `${state.basicInfo.grade}학년 ${state.basicInfo.semester}학기 ${state.basicInfo.subject || '활동'}`
  });

  if (!result.success) {
    console.error('Supabase 저장 실패:', result.error);
  }
};
```

---

## 🧪 테스트 방법

### 1. SQL Editor에서 테스트

```sql
-- 1. user_mode 확인
SELECT id, email, user_mode FROM user_profiles LIMIT 10;

-- 2. teacher_sessions 조회
SELECT * FROM teacher_sessions ORDER BY created_at DESC LIMIT 10;

-- 3. teacher_students 조회
SELECT
  ts.session_id,
  ts.title,
  ts.student_count,
  COUNT(tstd.id) as actual_count
FROM teacher_sessions ts
LEFT JOIN teacher_students tstd ON ts.session_id = tstd.session_id
GROUP BY ts.session_id, ts.title, ts.student_count;

-- 4. 특정 세션의 학생 목록
SELECT
  student_name,
  class_number,
  is_finalized,
  LENGTH(final_text) as text_length
FROM teacher_students
WHERE session_id = 'your_session_id_here'
ORDER BY student_name;
```

### 2. 프론트엔드에서 테스트

```typescript
// 1. 선생님으로 회원가입/로그인
await signUp(email, password, name, 'teacher');

// 2. 세션 생성 테스트
const session = await createTeacherSession({
  session_id: `session_${Date.now()}`,
  grade: 1,
  semester: '1',
  section_type: 'subject',
  subject: '수학',
  teacher_name: '김선생',
  title: '1학년 1학기 수학 세특'
});

// 3. 학생 추가 테스트
const student = await addTeacherStudent({
  session_id: session.data.session_id,
  student_id: `student_${Date.now()}`,
  student_name: '김학생',
  class_number: '3반 12번'
});

// 4. student_count 자동 업데이트 확인
const updated = await getTeacherSessions();
console.log('Student count:', updated.data[0].student_count); // 1이어야 함
```

---

## ⚠️ 주의사항

### 1. 데이터 백업
- SQL 실행 전 반드시 데이터베이스 백업 수행
- Supabase Dashboard → Database → Backups 확인

### 2. 기존 데이터
- 기존 user_profiles의 user_mode는 자동으로 'student'로 설정됨
- 기존 학생용 데이터는 영향을 받지 않음

### 3. 성능
- 대량의 학생 데이터 처리 시 배치 작업 고려
- 인덱스가 자동으로 생성되므로 조회 성능 최적화됨

### 4. RLS 정책
- 테스트 시 항상 로그인 상태 확인
- RLS로 인해 다른 사용자 데이터는 조회 불가

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL JSONB 타입](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 체크리스트

SQL 실행 후 다음 사항을 확인하세요:

- [ ] `user_profiles` 테이블에 `user_mode` 컬럼이 추가되었나요?
- [ ] `teacher_sessions` 테이블이 생성되었나요?
- [ ] `teacher_students` 테이블이 생성되었나요?
- [ ] RLS 정책이 모두 활성화되었나요?
- [ ] 인덱스가 정상적으로 생성되었나요?
- [ ] 트리거가 정상적으로 작동하나요? (student_count 자동 업데이트)
- [ ] 프론트엔드에서 데이터 저장/조회가 정상적으로 되나요?

---

**설정 완료!** 🎉

이제 선생님용 기능이 Supabase와 완전히 연동되었습니다.
