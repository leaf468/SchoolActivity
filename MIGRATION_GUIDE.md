# Supabase Backend 통합 마이그레이션 가이드

이 문서는 기존 프론트엔드 전용 코드에서 Supabase backend로의 마이그레이션 과정과 완료된 작업을 설명합니다.

## 📋 목차

1. [통합 개요](#통합-개요)
2. [완료된 작업](#완료된-작업)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [사용 방법](#사용-방법)
6. [향후 작업](#향후-작업)

---

## 통합 개요

### 변경 사항

**이전 (Frontend only)**
```
localStorage
  └─ 모든 데이터 저장 (비로그인 지원)
```

**이후 (Supabase Backend)**
```
Supabase PostgreSQL
  ├─ user_profiles (사용자 프로필)
  ├─ todos (할 일)
  ├─ activity_records (활동 기록)
  └─ revision_history (재작성 이력)

+ 서비스 레이어
  ├─ auth.service.ts
  ├─ profile.service.ts
  ├─ todo.service.ts
  └─ activityRecord.service.ts
```

### 통합 목표

✅ **완료**
- [x] Supabase 클라이언트 통합
- [x] 인증 서비스 레이어 구축
- [x] 데이터베이스 테이블 설계
- [x] 기존 코드와의 통합 (AuthContext, MyPage)
- [x] 타입 정의 통합

🔄 **향후 작업**
- [ ] 전체 페이지 마이그레이션 (Page1~4)
- [ ] localStorage → Supabase 완전 전환
- [ ] 오프라인 지원 (선택)

---

## 완료된 작업

### 1. Supabase 클라이언트 통합

**파일**: `/frontend/src/supabase/client.ts`

```typescript
// 환경변수 자동 감지 (REACT_APP_*, NEXT_PUBLIC_* 모두 지원)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**파일**: `/frontend/src/config/supabase.ts` (레거시 호환)

```typescript
// 기존 코드 호환성을 위해 re-export
export { supabase } from '../supabase/client';
```

### 2. 서비스 레이어 구축

#### 인증 서비스 (`/supabase/auth.service.ts`)

```typescript
// 회원가입
await signUp(email, password, name);

// 로그인
await signIn(email, password);

// 구글 소셜 로그인
await signInWithGoogle();

// 로그아웃
await signOut();
```

#### 프로필 서비스 (`/supabase/profile.service.ts`)

```typescript
// 내 프로필 조회
const profile = await getMyProfile();

// 프로필 업데이트
await updateMyProfile({ school: '서울고', target_university: '서울대' });
```

#### 할 일 서비스 (`/supabase/todo.service.ts`)

```typescript
// 할 일 조회
const todos = await getMyTodos();

// 할 일 생성
await createTodo({ text: '생기부 작성', due_date: '2024-12-31' });

// 완료 토글
await toggleTodo(todoId);
```

#### 활동 기록 서비스 (`/supabase/activityRecord.service.ts`)

```typescript
// 활동 기록 생성
await createActivityRecord({
  session_id: 'session_123',
  title: '수학 교과세특',
  student_grade: 3,
  section_type: 'subject',
  activity_summary: '미적분 탐구',
});

// 초안 저장
await saveDraft(recordId, '초안 텍스트', 0.95);

// 최종 확정
await finalizeActivityRecord(recordId, '최종 텍스트');
```

### 3. 기존 코드 마이그레이션

#### AuthContext ✅

**변경 전**:
```typescript
import { supabase } from '../config/supabase';
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

**변경 후**:
```typescript
import * as authService from '../supabase/auth.service';
const result = await authService.signIn(email, password);
```

#### MyPage ✅

**변경 전**:
```typescript
import { supabase } from '../config/supabase';
const { data } = await supabase.from('school_activity_records').select('*');
```

**변경 후**:
```typescript
import { getMyActivityRecords, deleteActivityRecord } from '../supabase';
const result = await getMyActivityRecords();
```

### 4. 타입 정의 통합

**파일**: `/frontend/src/supabase/types.ts`

모든 데이터베이스 타입을 중앙에서 관리:
- `UserProfile`
- `Todo`
- `ActivityRecord`
- `RevisionHistory`
- `ServiceResponse<T>`

**파일**: `/frontend/src/types/auth.ts`

인증 관련 타입만 유지 (deprecated 마크 추가):
```typescript
/**
 * @deprecated Use ActivityRecord from '../supabase/types' instead
 */
export interface SavedRecord { ... }
```

---

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호, 지역 선택
4. 생성 완료 대기 (~2분)

### 2. SQL 실행

**위치**: Supabase Dashboard > SQL Editor

**파일**: 프로젝트 루트의 SQL 문 (위에서 제공한 테이블 생성 SQL)

다음 순서대로 실행:
1. `user_profiles` 테이블 생성
2. `todos` 테이블 생성
3. `activity_records` 테이블 생성
4. `revision_history` 테이블 생성
5. RLS 정책 설정
6. 트리거 설정

### 3. API 키 복사

**위치**: Supabase Dashboard > Settings > API

필요한 값:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 환경 변수 설정

### 파일: `/frontend/.env`

```bash
# Supabase 설정
REACT_APP_NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 또는 (자동 감지됨)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Next.js 사용 시
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**참고**: 클라이언트는 다음 순서로 환경변수를 찾습니다:
1. `REACT_APP_NEXT_PUBLIC_SUPABASE_URL`
2. `REACT_APP_SUPABASE_URL`
3. `NEXT_PUBLIC_SUPABASE_URL`
4. Fallback: `https://placeholder.supabase.co`

### 구글 소셜 로그인 설정 (선택)

#### 1. Google Cloud Platform

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

#### 2. Supabase

1. Authentication > Providers > Google 활성화
2. GCP Client ID/Secret 입력
3. Redirect URLs 추가:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

---

## 사용 방법

### 통합 Import

```typescript
// 모든 서비스를 한 번에 import
import {
  // 클라이언트
  supabase,

  // 인증
  signIn,
  signUp,
  signOut,
  signInWithGoogle,

  // 프로필
  getMyProfile,
  updateMyProfile,

  // 할 일
  getMyTodos,
  createTodo,
  toggleTodo,
  deleteTodo,

  // 활동 기록
  getMyActivityRecords,
  createActivityRecord,
  saveDraft,
  finalizeActivityRecord,

  // 타입
  ActivityRecord,
  UserProfile,
  Todo,
} from '@/supabase';
```

### 컴포넌트에서 사용

```typescript
// Page2ActivityInput.tsx 예시
import { createActivityRecord, saveDraft } from '@/supabase';

const handleSubmit = async () => {
  // 1. 활동 기록 생성
  const result = await createActivityRecord({
    session_id: state.sessionId,
    title: `${basicInfo.subject} - ${basicInfo.grade}학년`,
    student_grade: parseInt(basicInfo.grade),
    section_type: basicInfo.sectionType,
    activity_summary: activityDetails.content,
  });

  if (!result.success) {
    alert('저장 실패: ' + result.error);
    return;
  }

  // 2. AI 생성 후 초안 저장
  const draft = await generateDraft(...);
  await saveDraft(result.data!.id, draft, 0.95);
};
```

### Context에서 사용

```typescript
// SchoolActivityContext.tsx 예시
import { upsertActivityRecordBySession } from '@/supabase';

const saveToDatabase = async () => {
  const result = await upsertActivityRecordBySession(
    state.sessionId,
    {
      title: generateTitle(),
      student_name: state.studentInfo?.name,
      activity_summary: state.currentActivity?.activitySummary,
      generated_draft: state.generatedDraft?.generatedText,
      // ... 기타 필드
    }
  );

  if (result.success) {
    console.log('저장 완료:', result.data);
  }
};
```

---

## 향후 작업

### 1. 전체 페이지 마이그레이션

현재 `AuthContext`와 `MyPage`만 마이그레이션됨. 나머지 페이지도 마이그레이션 필요:

- [ ] `Page1BasicInfo.tsx` - 학생 정보 저장
- [ ] `Page2ActivityInput.tsx` - 활동 입력 저장
- [ ] `Page3DraftReview.tsx` - 초안 및 재작성 저장
- [ ] `Page4FinalEdit.tsx` - 최종 저장

### 2. SchoolActivityContext 마이그레이션

현재 `SchoolActivityContext`는 localStorage만 사용. Supabase 통합 필요:

```typescript
// 예시
const setDraftResult = async (result: DraftResult) => {
  dispatch({ type: 'SET_DRAFT_RESULT', payload: result });

  // Supabase에도 저장
  if (state.currentRecordId) {
    await saveDraft(state.currentRecordId, result.draftText);
  }
};
```

### 3. 오프라인 지원 (선택)

- [ ] localStorage를 캐시로 활용
- [ ] 온라인 복귀 시 Supabase 동기화
- [ ] Service Worker 구현

### 4. 실시간 기능 (선택)

```typescript
// 다른 기기에서 수정 시 실시간 반영
import { supabase } from '@/supabase';

supabase
  .channel('activity_records')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'activity_records' },
    (payload) => {
      console.log('변경 감지:', payload);
      // UI 업데이트
    }
  )
  .subscribe();
```

---

## 트러블슈팅

### 환경 변수 인식 안 됨

**증상**: `console.log`에 `undefined` 출력

**해결**:
1. `.env` 파일 위치 확인: `/frontend/.env`
2. 환경변수 이름 확인:
   - Create React App: `REACT_APP_*`
   - Next.js: `NEXT_PUBLIC_*`
3. 서버 재시작: `npm start`

### RLS 권한 오류

**증상**: `new row violates row-level security policy`

**해결**:
1. Supabase Dashboard > Authentication 확인
2. 로그인 상태 확인
3. RLS 정책 재확인 (SQL Editor)

### 테이블 없음 오류

**증상**: `relation "activity_records" does not exist`

**해결**:
1. Supabase Dashboard > Table Editor 확인
2. SQL 실행 여부 확인
3. SQL 재실행

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [프로젝트 Supabase 서비스 문서](/frontend/src/supabase/README.md)

---

## 요약

✅ **완료된 작업**
- Supabase 클라이언트 및 서비스 레이어 구축
- 데이터베이스 테이블 설계 (4개 테이블)
- AuthContext 마이그레이션
- MyPage 마이그레이션
- 타입 정의 통합

🚀 **다음 단계**
1. `.env` 파일에 Supabase URL/Key 추가
2. Supabase SQL Editor에서 테이블 생성
3. 나머지 페이지 점진적 마이그레이션

💡 **핵심**
- 기존 코드는 대부분 그대로 작동 (하위 호환성 유지)
- 새로운 기능은 `@/supabase`의 서비스 레이어 사용
- localStorage는 당분간 유지 (점진적 전환)
