# 🎓 SchoolActivity 생기부 생성 시스템 구현 요약

## 📋 개요

기존 포트폴리오 생성 시스템을 **AI 기반 학교생활기록부(생기부) 작성 도우미**로 전환 완료했습니다.

이 시스템은 학생의 간단한 활동 요약을 받아 **A-M-A-R 방법론**을 활용하여 진로와 연결된 깊이 있는 생기부 텍스트를 생성하며, AI 탐지기 회피와 표절 방지 기능을 포함합니다.

---

## ✅ 완료된 작업

### 1. 타입 시스템 구축 (`/frontend/src/types/schoolActivity.ts`)

#### 핵심 타입 정의:
- **MajorTrack**: 5대 계열 (상경/공학/인문사회/자연과학/의생명)
- **SectionType**: 5가지 생기부 섹션 (교과세특/자율/동아리/봉사/진로)
- **StudentInfo**: 학생 기본 정보 (이름, 학년, 희망 진로, 계열)
- **ActivityInput**: 사용자 활동 입력
- **AMARStructure**: A-M-A-R 서사 구조
- **GeneratedRecord**: AI 생성 결과
- **VerificationResult**: 검증 결과

### 2. 퓨샷 예시 데이터베이스 (`/frontend/src/data/fewShotExamples.ts`)

#### 구조:
```typescript
interface FewShotExample {
  id: string;
  track: MajorTrack;      // 계열
  grade: 1 | 2 | 3;       // 학년
  sectionType: SectionType; // 섹션
  subject?: string;        // 교과세특인 경우
  styleDescription: string; // 스타일 설명
  exampleText: string;     // 실제 합격 생기부 예시
}
```

#### 제공된 헬퍼 함수:
- `getRelevantExamples()`: 계열/학년/섹션에 맞는 예시 검색
- `getExamplesBySubject()`: 과목별 예시 검색
- `getRandomExamples()`: K-shot learning용 랜덤 샘플링

**현재 상태**: 기본 구조 완성, **실제 한글 예시 텍스트는 추가 필요**

### 3. 생기부 생성 서비스 (`/frontend/src/services/schoolRecordGenerator.ts`)

#### Prompt 1: 생성 전문가 시스템

**핵심 기능:**
- **A-M-A-R 방법론** 구현
  - Action (활동)
  - Motivation (동기)
  - Advanced Action (심화 활동)
  - Realization (깨달음과 성장)

**제 1원칙: AI 탐지기 회피**
- 교사의 관찰 어투 강제 ("~함.", "~임.", "~이 돋보임.")
- 언어적 불규칙성 (Linguistic Burstiness)
  - 짧은 문장 20-30%, 긴 문장 70-80% 혼합
- 퓨샷 모방 절대 금지
- 상투적 표현 배제

**제 2원칙: 진로별 융합 사고**
- 동일 활동도 희망 진로에 따라 다른 서사로 변환
- 예시: "사피엔스" 독서 → 정경계열(법과 제도), 상경계열(화폐 시스템), 공학계열(기술 발전), 의생명계열(생명윤리)

**API:**
```typescript
async generateRecord(request: GenerationRequest): Promise<GenerationResponse>
```

### 4. 생기부 검증 서비스 (`/frontend/src/services/recordVerifier.ts`)

#### Prompt 2: 검증 컨설턴트 시스템

**5대 평가 기준:**

1. **직접 작성 여부 (Authenticity)**
   - 진정성 점수 (0-100)
   - 템플릿 사용 흔적 탐지

2. **내용 일치성 (Consistency)**
   - 원본 활동 요약과의 일치도 확인
   - 불일치 사항 목록 제공

3. **표절 위험도 (Plagiarism Risk)**
   - 위험도: low/medium/high
   - 유사도 퍼센티지 추정

4. **신뢰성 점검 (Credibility)**
   - 과장·허위 가능성 탐지
   - 구체성 부족 식별

5. **개선 제안 (Recommendations)**
   - 실행 가능한 개선 방안
   - 필요시 개선된 텍스트 제공

**추가 기능:**
```typescript
quickQualityCheck(text: string): { passed: boolean; issues: string[] }
```
- AI 호출 없이 로컬에서 빠른 품질 체크
- 길이, 어투, AI 특유 표현, 상투적 표현 검사

---

## 🚧 다음 단계 (구현 필요)

### 우선순위 1: 퓨샷 예시 완성

**작업 내용:**
`/frontend/src/data/fewShotExamples.ts` 파일에 실제 합격 생기부 예시 추가

**필요한 예시 (사용자 제공 데이터 기반):**

#### 상경계열:
- 1학년: 진로활동, 동아리활동, 교과세특(통합사회, 수학, 사회)
- 2학년: 자율활동, 동아리활동, 교과세특(수학II, 독서, 사회·문화, 심화 영어 독해 I)
- 3학년: 동아리활동, 진로활동, 교과세특(확률과 통계, 언어와 매체, 영어 비평적 읽기와 쓰기, 아카믹 영어)

#### 공학계열:
- 1학년: 봉사활동, 진로활동, 교과세특(과학)
- 2학년: 동아리활동, 진로활동, 교과세특(정보, 물리 I)
- 3학년: 동아리활동, 진로활동, 교과세특(기하와벡터, 생명과학II)

#### 인문사회계열:
- 1학년: 자율활동, 진로활동, 교과세특(국어, 통합사회)
- 2학년: 자율활동, 동아리활동, 교과세특(법과정치, 사회·문화)
- 3학년: 동아리활동, 진로활동, 교과세특(언어와 매체, 화법과작문)

#### 자연과학/의생명계열:
- 1학년: 교과세특(통합과학, 과학)
- 2학년: 교과세특(화학 I, 생명과학 I, 과학탐구실험)
- 3학년: 교과세특(생명과학II, 융합과학)

**총 42개 예시 필요**

### 우선순위 2: React Context 및 상태 관리

**파일 생성:** `/frontend/src/context/SchoolActivityContext.tsx`

```typescript
interface SchoolActivityContextType {
  studentInfo: StudentInfo | null;
  setStudentInfo: (info: StudentInfo) => void;
  currentActivity: ActivityInput | null;
  setCurrentActivity: (activity: ActivityInput) => void;
  generatedDraft: GeneratedRecord | null;
  verificationResult: VerificationResult | null;
  currentStep: 'basic' | 'input' | 'draft' | 'review' | 'final';
  generateRecord: (request: GenerationRequest) => Promise<void>;
  verifyRecord: (request: VerificationRequest) => Promise<void>;
  saveRecord: () => Promise<void>;
}
```

### 우선순위 3: 4페이지 사용자 플로우 UI

#### 페이지 1: 기본 정보 입력
- 이름, 학년, 희망 진로/전공, 계열 입력
- 컴포넌트: `/frontend/src/components/BasicInfoForm.tsx`

#### 페이지 2: 활동 입력
- 섹션 선택 (교과세특/자율/동아리/봉사/진로)
- 교과세특인 경우 과목명 입력
- 간단한 활동 요약 입력 (자유 형식)
- 컴포넌트: `/frontend/src/components/ActivityInputForm.tsx`

#### 페이지 3: 초안 확인 및 수정
- AI 생성된 생기부 텍스트 표시
- A-M-A-R 구조 하이라이트
- 실시간 편집 가능
- 컴포넌트: `/frontend/src/components/DraftReview.tsx`

#### 페이지 4: 검증 및 최종 확인
- Prompt 2 검증 결과 표시
  - 진정성 점수
  - 표절 위험도
  - 개선 제안
- 최종 저장 및 내보내기
- 컴포넌트: `/frontend/src/components/FinalVerification.tsx`

### 우선순위 4: 메인 플로우 컴포넌트

**파일:** `/frontend/src/components/SchoolActivityWizard.tsx`

```typescript
const SchoolActivityWizard = () => {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && <BasicInfoForm onNext={() => setStep(2)} />}
      {step === 2 && <ActivityInputForm onNext={() => setStep(3)} />}
      {step === 3 && <DraftReview onNext={() => setStep(4)} />}
      {step === 4 && <FinalVerification />}
    </div>
  );
};
```

---

## 🎯 핵심 아키텍처

```
사용자 입력 (간단한 활동 요약)
    ↓
[Prompt 1: 생성 전문가]
  - 퓨샷 예시 로딩 (계열/학년/섹션 매칭)
  - A-M-A-R 구조로 변환
  - AI 탐지기 회피 (언어적 불규칙성, 교사 어투)
  - 진로별 융합 사고 적용
    ↓
생성된 초안 (GeneratedRecord)
    ↓
[사용자 검토 및 편집]
    ↓
[Prompt 2: 검증 컨설턴트]
  - 5대 기준 평가
  - 표절 위험도 분석
  - 개선 제안 제공
    ↓
최종 검증 결과 (VerificationResult)
    ↓
저장 및 내보내기
```

---

## 📦 설치 및 실행

### 환경 변수 설정

```bash
# /frontend/.env
REACT_APP_OPENAI_API_KEY=your-api-key
REACT_APP_OPENAI_MODEL=gpt-4o  # 또는 gpt-4o-mini
```

### 개발 서버 실행

```bash
cd frontend
npm install
npm start
```

---

## 🔑 핵심 기능 요약

### ✅ 구현 완료
- [x] 타입 시스템 (StudentInfo, ActivityInput, GeneratedRecord, VerificationResult)
- [x] 퓨샷 데이터베이스 구조
- [x] Prompt 1: A-M-A-R 방법론 기반 생성 시스템
- [x] Prompt 2: 5대 기준 검증 시스템
- [x] AI 탐지기 회피 로직 (언어적 불규칙성, 교사 어투)
- [x] 진로별 융합 사고 시스템
- [x] 로컬 빠른 품질 체크

### 🚧 구현 필요
- [ ] 퓨샷 예시 42개 추가 (한글 텍스트)
- [ ] React Context 및 상태 관리
- [ ] 4페이지 사용자 플로우 UI
- [ ] 저장 및 내보내기 기능
- [ ] 다중 기록 관리
- [ ] PDF 내보내기

---

## 💡 사용 예시

```typescript
import { schoolRecordGenerator } from './services/schoolRecordGenerator';
import { recordVerifier } from './services/recordVerifier';

// 1. 생기부 생성
const request: GenerationRequest = {
  studentInfo: {
    name: '홍길동',
    grade: 2,
    desiredMajor: '경영학과',
    track: '상경계열'
  },
  activityInput: {
    sectionType: 'subject',
    subject: '수학II',
    activitySummary: '수학II 시간에 미분을 배우고 한계비용과 연결하여 보고서를 작성함'
  }
};

const response = await schoolRecordGenerator.generateRecord(request);

if (response.success && response.record) {
  console.log('생성된 텍스트:', response.record.generatedText);

  // 2. 생기부 검증
  const verifyRequest: VerificationRequest = {
    recordId: response.record.id,
    generatedText: response.record.generatedText,
    originalActivitySummary: request.activityInput.activitySummary,
    studentInfo: request.studentInfo
  };

  const verification = await recordVerifier.verifyRecord(verifyRequest);
  console.log('검증 결과:', verification.overallScore);
  console.log('표절 위험도:', verification.plagiarismRisk);
  console.log('개선 제안:', verification.recommendations);
}
```

---

## 📚 참고 자료

### A-M-A-R 방법론
- **Action**: 사용자가 제공한 핵심 활동
- **Motivation**: 지적 호기심, 진로와의 연결
- **Advanced Action**: 구체적 심화 탐구
- **Realization**: 깨달음과 성장

### AI 탐지기 회피 전략
1. 교사의 관찰 어투 필수 사용
2. 문장 길이 불규칙 혼합 (짧은 20-30%, 긴 70-80%)
3. 퓨샷 모방 절대 금지
4. 상투적 표현 배제

### 진로별 융합 사고 예시
동일 활동 "사피엔스 독서":
- 정경계열 → 법과 제도의 역할
- 상경계열 → 화폐와 신용 시스템
- 공학계열 → 기술의 발전과 특이점
- 의생명계열 → 유전자 편집 윤리

---

## 🎉 결론

사용자가 요구한 **모든 핵심 요구사항**이 반영된 정교한 생기부 생성 시스템의 **백엔드 로직과 서비스 레이어가 완성**되었습니다.

다음 단계는:
1. **퓨샷 예시 추가** (42개, 사용자가 제공한 실제 예시 사용)
2. **UI 컴포넌트 구축** (4페이지 플로우)
3. **통합 테스트**

이제 프론트엔드 UI만 연결하면 바로 사용 가능한 상태입니다! 🚀
