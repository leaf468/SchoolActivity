# Supabase 통합 가이드

이 폴더는 Supabase backend 연결 및 데이터 관리 서비스를 포함합니다.

## 📁 파일 구조

```
src/supabase/
├── client.ts                    # Supabase 클라이언트 설정
├── types.ts                     # TypeScript 타입 정의
├── auth.service.ts              # 인증 서비스
├── profile.service.ts           # 사용자 프로필 서비스
├── todo.service.ts              # 할 일 관리 서비스
├── activityRecord.service.ts    # 활동 기록 서비스
├── index.ts                     # 통합 export
└── README.md                    # 이 파일
```

## 🚀 시작하기

### 1. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 또는 Create React App 사용 시
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 데이터베이스 테이블 생성

제공된 SQL 문을 Supabase SQL Editor에서 실행하여 필요한 테이블을 생성하세요:

- `user_profiles`: 사용자 프로필
- `todos`: 할 일 관리
- `activity_records`: 활동 기록 (핵심)
- `revision_history`: 재작성 이력

### 3. 구글 소셜 로그인 설정 (선택사항)

#### Google Cloud Platform (GCP) 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **사용자 인증 정보** 이동
4. **사용자 인증 정보 만들기** > **OAuth 2.0 클라이언트 ID** 선택
5. 애플리케이션 유형: **웹 애플리케이션**
6. **승인된 리디렉션 URI** 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
7. **Client ID**와 **Client Secret** 복사

#### Supabase 설정

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. **Authentication** > **Providers** 이동
3. **Google** 활성화
4. GCP에서 복사한 **Client ID**와 **Client Secret** 입력
5. **Redirect URLs**에 프론트엔드 URL 추가:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
6. 저장

## 📖 사용 예시

### 인증

```typescript
import { signUp, signIn, signInWithGoogle, signOut } from '@/supabase';

// 회원가입
const result = await signUp('user@example.com', 'password123', '홍길동');
if (result.success) {
  console.log('가입 성공:', result.data);
}

// 로그인
const loginResult = await signIn('user@example.com', 'password123');

// 구글 로그인
await signInWithGoogle();

// 로그아웃
await signOut();
```

### 프로필 관리

```typescript
import { getMyProfile, updateMyProfile } from '@/supabase';

// 내 프로필 조회
const profile = await getMyProfile();

// 프로필 업데이트
await updateMyProfile({
  school: '서울고등학교',
  grade: '3',
  target_university: '서울대학교',
  target_major: '컴퓨터공학과',
});
```

### 할 일 관리

```typescript
import { getMyTodos, createTodo, toggleTodo, deleteTodo } from '@/supabase';

// 내 할 일 조회
const todos = await getMyTodos();

// 새 할 일 추가
await createTodo({
  text: '생기부 작성하기',
  due_date: '2024-12-31T23:59:59Z',
});

// 완료 토글
await toggleTodo(todoId);

// 삭제
await deleteTodo(todoId);
```

### 활동 기록 관리

```typescript
import {
  createActivityRecord,
  updateActivityRecord,
  saveDraft,
  finalizeActivityRecord,
  getMyActivityRecords,
} from '@/supabase';

// 새 활동 기록 생성
const record = await createActivityRecord({
  session_id: 'session_123',
  title: '수학 교과세특 - 미적분 탐구',
  student_name: '홍길동',
  student_grade: 3,
  section_type: 'subject',
  subject: '수학',
  activity_summary: '미적분을 활용한 최적화 문제 탐구',
  keywords: ['미적분', '최적화', '실생활 응용'],
});

// 초안 저장
await saveDraft(
  record.data!.id,
  'AI가 생성한 초안 텍스트...',
  0.95,
  { action: '...', motivation: '...', advancedAction: '...', realization: '...' },
  ['example_1', 'example_2']
);

// 최종 확정
await finalizeActivityRecord(record.data!.id, '최종 확정된 텍스트...');

// 내 모든 활동 기록 조회
const records = await getMyActivityRecords();

// 최종 확정된 기록만 조회
const finalizedRecords = await getMyActivityRecords(true);
```

### 재작성 이력 관리

```typescript
import { addRevisionHistory, getRevisionHistory } from '@/supabase';

// 재작성 이력 추가
await addRevisionHistory({
  activity_record_id: recordId,
  original_draft: '기존 초안...',
  revision_request: '더 구체적으로 작성해주세요',
  revised_draft: '재작성된 초안...',
});

// 재작성 이력 조회
const history = await getRevisionHistory(recordId);
```

## 🔒 보안 (Row Level Security)

모든 테이블에 RLS가 활성화되어 있어, 사용자는 자신의 데이터만 접근할 수 있습니다:

- ✅ 사용자는 자신의 프로필만 조회/수정 가능
- ✅ 사용자는 자신의 할 일만 CRUD 가능
- ✅ 사용자는 자신의 활동 기록만 CRUD 가능
- ✅ 사용자는 자신의 재작성 이력만 조회/추가 가능

## 📊 데이터베이스 스키마

### user_profiles (사용자 프로필)

| 컬럼                | 타입   | 설명              |
| ------------------- | ------ | ----------------- |
| id                  | UUID   | 기본키            |
| user_id             | UUID   | auth.users FK     |
| school              | TEXT   | 학교명            |
| grade               | TEXT   | 학년              |
| semester            | TEXT   | 학기              |
| target_university   | TEXT   | 목표 대학         |
| target_major        | TEXT   | 목표 학과         |
| university_slogan   | TEXT   | 대학 슬로건       |
| created_at          | TIMESTAMP | 생성일         |
| updated_at          | TIMESTAMP | 수정일         |

### todos (할 일)

| 컬럼       | 타입      | 설명          |
| ---------- | --------- | ------------- |
| id         | UUID      | 기본키        |
| user_id    | UUID      | auth.users FK |
| text       | TEXT      | 할 일 내용    |
| done       | BOOLEAN   | 완료 여부     |
| due_date   | TIMESTAMP | 마감일        |
| created_at | TIMESTAMP | 생성일        |
| updated_at | TIMESTAMP | 수정일        |

### activity_records (활동 기록)

| 컬럼                  | 타입      | 설명                  |
| --------------------- | --------- | --------------------- |
| id                    | UUID      | 기본키                |
| user_id               | UUID      | auth.users FK         |
| session_id            | TEXT      | 세션 ID               |
| student_name          | TEXT      | 학생 이름             |
| student_grade         | INTEGER   | 학년 (1, 2, 3)        |
| desired_major         | TEXT      | 희망 전공             |
| track                 | TEXT      | 계열                  |
| section_type          | TEXT      | 섹션 타입             |
| subject               | TEXT      | 과목명                |
| activity_summary      | TEXT      | 활동 요약             |
| keywords              | JSONB     | 키워드 배열           |
| activity_details      | JSONB     | 활동 상세             |
| generated_draft       | TEXT      | AI 생성 초안          |
| draft_confidence      | NUMERIC   | 신뢰도 (0-1)          |
| amar_breakdown        | JSONB     | A-M-A-R 분석          |
| verification_result   | JSONB     | 검증 결과             |
| final_text            | TEXT      | 최종 텍스트           |
| is_finalized          | BOOLEAN   | 최종 확정 여부        |
| title                 | TEXT      | 제목                  |
| created_at            | TIMESTAMP | 생성일                |
| updated_at            | TIMESTAMP | 수정일                |

### revision_history (재작성 이력)

| 컬럼                | 타입      | 설명                     |
| ------------------- | --------- | ------------------------ |
| id                  | UUID      | 기본키                   |
| activity_record_id  | UUID      | activity_records FK      |
| user_id             | UUID      | auth.users FK            |
| original_draft      | TEXT      | 기존 초안                |
| revision_request    | TEXT      | 재작성 요청 사항         |
| revised_draft       | TEXT      | 재작성된 초안            |
| created_at          | TIMESTAMP | 생성일                   |

## 🛠️ 트러블슈팅

### 인증 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Supabase Dashboard에서 Authentication 활성화 확인

### RLS 오류

- 사용자가 로그인되어 있는지 확인
- Supabase Dashboard에서 RLS 정책 확인

### 구글 로그인 오류

- GCP OAuth 설정 확인
- Supabase Redirect URLs 확인
- 브라우저 콘솔에서 오류 메시지 확인

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [PostgreSQL JSON 타입](https://www.postgresql.org/docs/current/datatype-json.html)
