// ========================================
// 계열 및 섹션 타입
// ========================================

/**
 * 전공 계열 (5대 계열)
 */
export type MajorTrack =
  | '상경계열'      // 경영, 경제
  | '공학계열'      // 컴퓨터, 기계, 신소재
  | '인문사회계열'  // 법학, 행정, 정치외교, 미디어
  | '자연과학계열'  // 수학, 물리, 화학
  | '의생명계열';   // 의학, 생명과학

/**
 * 생활기록부 항목 타입 (5가지 섹션)
 */
export type SectionType =
  | 'subject'    // 교과 세부능력 및 특기사항 (세특)
  | 'autonomy'   // 자율활동
  | 'club'       // 동아리활동
  | 'service'    // 봉사활동
  | 'career'     // 진로활동
  | 'behavior';  // 행동특성 및 종합의견 (레거시)

/**
 * 섹션 한글명 매핑
 */
export const SECTION_NAMES: Record<SectionType, string> = {
  subject: '교과세특',
  autonomy: '자율활동',
  club: '동아리활동',
  service: '봉사활동',
  career: '진로활동',
  behavior: '행동특성 및 종합의견'
};

// ========================================
// 학생 정보
// ========================================

/**
 * 학생 기본 정보
 */
export interface StudentInfo {
  name: string;
  grade: 1 | 2 | 3;           // 학년
  desiredMajor: string;        // 희망 진로/전공 (예: "경영학과", "컴퓨터공학과")
  track: MajorTrack;           // 계열
  school?: string;
  classNumber?: string;
}

// ========================================
// 활동 입력 구조
// ========================================

/**
 * 활동 요약 입력 (사용자가 간단히 입력하는 내용)
 */
export interface ActivityInput {
  sectionType: SectionType;    // 작성 항목
  subject?: string;             // 교과세특인 경우 과목명
  activitySummary: string;      // 간단한 활동 요약 (AI가 확장할 원본)
  date?: string;                // 활동 날짜 (선택)
  keywords?: string[];          // 사용자가 강조하고 싶은 키워드
}

// ========================================
// A-M-A-R 서사 구조 (Prompt 1 핵심)
// ========================================

/**
 * A-M-A-R 서사 구조
 * - Action: 활동 (사용자가 한 행동)
 * - Motivation: 동기 (왜 이 활동을 했는가)
 * - Advanced Action: 심화 활동 (호기심을 해결하기 위한 구체적 행동)
 * - Realization: 깨달음 및 성장 (무엇을 배우고 성장했는가)
 */
export interface AMARStructure {
  action: string;           // (A) 핵심 활동
  motivation: string;       // (M) 지적 호기심/문제의식
  advancedAction: string;   // (AA) 구체적 심화 탐구
  realization: string;      // (R) 깨달음과 진로 연결
}

// ========================================
// 퓨샷 예시 데이터 구조
// ========================================

/**
 * 퓨샷 학습 예시 (Few-shot Learning Examples)
 * - 실제 합격 생기부 예시를 계열/학년/섹션별로 분류
 */
export interface FewShotExample {
  id: string;
  track: MajorTrack;              // 계열
  grade: 1 | 2 | 3;               // 학년
  sectionType: SectionType;       // 섹션
  subject?: string;               // 교과세특인 경우 과목명
  styleDescription: string;       // 스타일 설명 (예: "창체(진로) 스타일")
  exampleText: string;            // 실제 합격 생기부 예시
  amarStructure?: AMARStructure;  // 이 예시의 A-M-A-R 구조 분석 (학습용)
}

// ========================================
// AI 생성 결과
// ========================================

/**
 * AI 생성된 생기부 초안
 */
export interface GeneratedRecord {
  id: string;
  studentInfo: StudentInfo;
  activityInput: ActivityInput;
  generatedText: string;          // AI가 생성한 최종 텍스트
  amarBreakdown?: AMARStructure;  // A-M-A-R 구조 분석 (디버깅용)
  confidence: number;             // 생성 신뢰도 (0-1)
  usedFewShots: string[];         // 사용된 퓨샷 예시 ID들
  createdAt: string;
  updatedAt?: string;
  verificationResult?: VerificationResult; // 검증 결과
}

// ========================================
// 검증 시스템 (Prompt 2)
// ========================================

/**
 * 표절 위험도
 */
export type PlagiarismRisk = 'low' | 'medium' | 'high';

/**
 * 검증 결과 (Prompt 2: 검증 컨설턴트)
 */
export interface VerificationResult {
  id: string;
  recordId: string;

  // 1. 직접 작성 여부
  authenticityScore: number;      // 0-100 (진정성 점수)
  templateDetected: boolean;       // 템플릿 사용 흔적
  externalSourceDetected: boolean; // 외부 문구 사용

  // 2. 내용 일치성
  consistencyIssues: string[];    // 불일치 사항

  // 3. 표절 위험도
  plagiarismRisk: PlagiarismRisk;
  similarityPercentage: number;   // 유사도 %

  // 4. 신뢰성 점검
  exaggerationIssues: string[];   // 과장/허위 가능성

  // 5. 최종 권장 사항
  recommendations: string[];       // 개선 제안
  improvedText?: string;           // 개선된 텍스트

  overallScore: number;            // 전체 점수 (0-100)
  createdAt: string;
}

/**
 * 검증 요청
 */
export interface VerificationRequest {
  recordId: string;
  generatedText: string;
  originalActivitySummary: string;
  studentInfo: StudentInfo;
  officialRecordData?: {
    // 실제 생기부에 기재된 정보 (확인용)
    awards?: string[];
    activities?: string[];
    dates?: string[];
  };
}

// ========================================
// 생성 요청/응답
// ========================================

/**
 * 생기부 생성 요청 (Prompt 1)
 */
export interface GenerationRequest {
  studentInfo: StudentInfo;
  activityInput: ActivityInput;
  additionalContext?: string;
}

/**
 * 생기부 생성 응답
 */
export interface GenerationResponse {
  success: boolean;
  record?: GeneratedRecord;
  error?: string;
  suggestions?: string[];
}

// ========================================
// 문서 및 상태 관리
// ========================================

/**
 * 학생의 전체 생기부 문서
 */
export interface SchoolActivityDocument {
  id: string;
  studentInfo: StudentInfo;
  records: GeneratedRecord[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 편집 이력
 */
export interface EditHistory {
  recordId: string;
  previousText: string;
  newText: string;
  editedAt: string;
  editedBy: 'user' | 'ai';
  reason?: string;
}

/**
 * 전역 상태 (React Context용)
 */
export interface SchoolActivityState {
  userId: string;
  sessionId: string;
  studentInfo: StudentInfo | null;
  currentActivity: ActivityInput | null;
  generatedDraft: GeneratedRecord | null;
  verificationResult: VerificationResult | null;
  currentStep: 'basic' | 'input' | 'draft' | 'review' | 'final';
  allRecords: GeneratedRecord[];
  // 레거시 지원 (기존 코드 호환용) - 명시적으로 레거시 타입 사용
  basicInfo: BasicInfo | null;
  activityDetails: ActivityDetails | null;
  emphasisKeywords: string[];
  draftResult: DraftResult | null;
  finalText: string | null;
}

// ========================================
// 레거시 타입 (기존 코드 호환용)
// ========================================

export interface BasicInfo {
  grade: string;
  semester: string;
  sectionType: SectionType;
  subject?: string;
}

// 단일 활동 항목 (사용자가 추가할 수 있는 각각의 활동)
export interface SingleActivity {
  id: string;  // 활동 고유 ID
  period?: string;  // 활동 기간 (예: "2024년 3월~6월")
  role?: string;  // 맡은 역할
  content: string;  // 활동 내용 (구체적 활동)
  learnings?: string;  // 깨달은 바 / 배운 점
  keywords?: string[];  // 이 활동에서 강조하고 싶은 키워드
}

export interface SubjectActivity {
  subject: string;
  activities: SingleActivity[];  // 여러 활동 지원
  overallEmphasis?: string;  // 전체적으로 강조하고 싶은 점
  overallKeywords?: string[];  // 전체적으로 강조하고 싶은 키워드
  maxCharacters: 500;  // 최종 글자수 제한
}

export interface AutonomyActivity {
  activities: SingleActivity[];  // 여러 활동 지원
  overallEmphasis?: string;  // 전체적으로 강조하고 싶은 점
  overallKeywords?: string[];  // 전체적으로 강조하고 싶은 키워드
  maxCharacters: 500;  // 최종 글자수 제한
}

export interface ClubActivity {
  clubName: string;
  activities: SingleActivity[];  // 여러 활동 지원
  overallEmphasis?: string;  // 전체적으로 강조하고 싶은 점
  overallKeywords?: string[];  // 전체적으로 강조하고 싶은 키워드
  maxCharacters: 500;  // 최종 글자수 제한
}

export interface CareerActivity {
  activities: SingleActivity[];  // 여러 활동 지원
  overallEmphasis?: string;  // 전체적으로 강조하고 싶은 점
  overallKeywords?: string[];  // 전체적으로 강조하고 싶은 키워드
  maxCharacters: 700;  // 진로활동은 700자
}

export interface BehaviorActivity {
  activities: SingleActivity[];  // 여러 활동 지원
  overallEmphasis?: string;  // 전체적으로 강조하고 싶은 점
  overallKeywords?: string[];  // 전체적으로 강조하고 싶은 키워드
  maxCharacters: 500;  // 최종 글자수 제한
}

export type ActivityDetails =
  | SubjectActivity
  | AutonomyActivity
  | ClubActivity
  | CareerActivity
  | BehaviorActivity;

export interface DraftResult {
  draftText: string;
  qualityScore?: number;
  recommendedKeywords?: string[];
  fewShotSamples?: string[];
}

export interface FinalRecord {
  userId: string;
  sessionId: string;
  basicInfo: BasicInfo;
  activityDetails: ActivityDetails;
  emphasisKeywords: string[];
  aiDraft: string;
  finalText: string;
  diffSummary?: string;
  createdAt: string;
}

// ========================================
// 합격자 생기부 데이터 (Admission Data)
// ========================================

/**
 * 합격자 생기부 원본 데이터
 * - 실제 합격한 학생의 생기부 전체 기록
 */
export interface AdmissionRecord {
  id: string;

  // 기본 정보
  university: string;           // 합격 대학 (예: "서울대학교")
  major: string;                // 합격 학과 (예: "경영학과")
  track: MajorTrack;            // 계열
  admissionYear: number;        // 합격 연도 (예: 2024)
  admissionType: string;        // 전형 유형 (예: "학생부종합전형", "학생부교과전형")

  // 학생 정보
  highSchool?: string;          // 출신 고등학교
  region?: string;              // 지역 (예: "서울", "경기")

  // 생기부 내용 (학년별)
  grade1Records: SectionRecord[];  // 1학년 생기부
  grade2Records: SectionRecord[];  // 2학년 생기부
  grade3Records: SectionRecord[];  // 3학년 생기부

  // 메타데이터
  tags?: string[];              // 특징 태그 (예: ["리더십", "연구", "봉사"])
  overallStrength?: string;     // 전반적인 강점 분석
  createdAt: string;
}

/**
 * 섹션별 생기부 기록
 */
export interface SectionRecord {
  sectionType: SectionType;
  subject?: string;             // 교과세특인 경우 과목명
  content: string;              // 실제 생기부 텍스트
  grade: 1 | 2 | 3;            // 학년
  amarAnalysis?: AMARStructure; // A-M-A-R 구조 분석
  keywords?: string[];          // 추출된 키워드
}

/**
 * 합격자 데이터 비교 결과
 */
export interface ComparisonResult {
  id: string;
  studentRecordId: string;      // 비교 대상 학생 기록 ID

  // 유사한 합격자 목록 (상위 5개)
  similarAdmissions: {
    admissionRecord: AdmissionRecord;
    similarityScore: number;    // 유사도 점수 (0-100)
    matchingPoints: string[];   // 유사한 점
    differencePoints: string[]; // 다른 점
  }[];

  // 강점 분석
  strengths: string[];          // 학생의 강점

  // 개선점 분석
  weaknesses: {
    area: string;               // 개선 영역
    description: string;        // 설명
    suggestedActivities: string[]; // 추천 활동
  }[];

  // 전체 평가
  overallAssessment: string;
  competitivenessScore: number; // 경쟁력 점수 (0-100)

  createdAt: string;
}

// ========================================
// 합격자 성적 데이터 (엑셀 업로드용)
// ========================================

/**
 * 내신 성적 정보
 */
export interface GradeRecord {
  overall: number;              // 전체 내신 평균 등급 (1.0 ~ 9.0)
  grade1?: number;              // 1학년 평균 등급
  grade2?: number;              // 2학년 평균 등급
  grade3?: number;              // 3학년 1학기 등급
  korean?: number;              // 국어 평균 등급
  math?: number;                // 수학 평균 등급
  english?: number;             // 영어 평균 등급
  science?: number;             // 과학탐구 평균 등급
  social?: number;              // 사회탐구 평균 등급
  history?: number;             // 한국사 등급
}

/**
 * 모의고사/수능 성적 정보
 */
export interface MockExamRecord {
  type: 'mock' | 'sat';           // 모의고사 또는 수능
  examName?: string;              // 시험명 (예: "6월 모의", "9월 모의", "수능")
  date?: string;                  // 시험 날짜 (예: "2024-06", "2024-11")
  korean?: {
    raw?: number;                 // 원점수
    standard?: number;            // 표준점수
    percentile?: number;          // 백분위
    grade?: number;               // 등급
  };
  math?: {
    raw?: number;
    standard?: number;
    percentile?: number;
    grade?: number;
    type?: string;                // 수학 유형 (확통, 미적분, 기하)
  };
  english?: {
    raw?: number;
    grade?: number;               // 영어는 등급만 (절대평가)
  };
  history?: {
    raw?: number;
    grade?: number;               // 한국사도 등급만 (절대평가)
  };
  inquiry1?: {                    // 탐구1
    subject?: string;             // 과목명
    raw?: number;
    standard?: number;
    percentile?: number;
    grade?: number;
  };
  inquiry2?: {                    // 탐구2
    subject?: string;
    raw?: number;
    standard?: number;
    percentile?: number;
    grade?: number;
  };
  totalStandard?: number;         // 합산 표준점수 (국+수+탐)
  averagePercentile?: number;     // 평균 백분위
}

/**
 * 전형 정보
 */
export interface AdmissionTypeInfo {
  method: 'early' | 'regular';    // 수시 / 정시
  typeName: string;               // 전형명 (학생부종합, 학생부교과, 논술, 정시 등)
  subType?: string;               // 세부 전형 (서울대 일반, 지역균형 등)
  hasMinimumRequirement?: boolean; // 수능 최저 적용 여부
  minimumRequirement?: string;     // 수능 최저 내용 (예: "3합 5등급")
}

/**
 * 확장된 합격자 데이터 (엑셀 업로드 지원)
 */
export interface ExtendedAdmissionRecord extends AdmissionRecord {
  // 성적 정보
  gradeRecord?: GradeRecord;      // 내신 성적
  mockExams?: MockExamRecord[];   // 모의고사/수능 성적들

  // 전형 상세 정보
  admissionTypeInfo?: AdmissionTypeInfo;

  // 합격 상세
  admissionResult: 'accepted' | 'additional' | 'rejected' | 'waitlist';  // 합격/추합/불합/예비
  additionalOrder?: number;       // 추가합격 순번 (추합인 경우)
  enrolled?: boolean;             // 실제 등록 여부

  // 학교 정보 확장
  highSchoolType?: 'general' | 'special' | 'autonomous' | 'foreign';  // 일반고/특목고/자사고/외고
  highSchoolRegion?: string;      // 고등학교 지역

  // 비교군 분석용
  competitionRate?: number;       // 경쟁률
  acceptedGradeRange?: {          // 합격자 내신 범위
    min: number;
    max: number;
    average: number;
  };
}

/**
 * 엑셀 파싱 결과
 */
export interface ExcelParseResult {
  success: boolean;
  data: ExtendedAdmissionRecord[];
  errors: {
    row: number;
    column: string;
    message: string;
  }[];
  warnings: {
    row: number;
    message: string;
  }[];
  summary: {
    totalRows: number;
    successRows: number;
    failedRows: number;
    duplicateRows: number;
  };
}

/**
 * 합격자 비교 필터
 */
export interface AdmissionComparisonFilter {
  universities?: string[];        // 대학 필터
  majors?: string[];              // 학과 필터
  tracks?: MajorTrack[];          // 계열 필터
  years?: number[];               // 연도 필터
  admissionTypes?: string[];      // 전형 필터
  gradeRange?: {                  // 내신 범위 필터
    min: number;
    max: number;
  };
  highSchoolTypes?: ('general' | 'special' | 'autonomous' | 'foreign')[];
}

/**
 * 합격자 통계 요약
 */
export interface AdmissionStatistics {
  totalCount: number;
  byUniversity: { name: string; count: number; avgGrade: number }[];
  byTrack: { track: MajorTrack; count: number; avgGrade: number }[];
  byAdmissionType: { type: string; count: number; avgGrade: number }[];
  byYear: { year: number; count: number }[];
  gradeDistribution: {
    range: string;                // 예: "1.0-1.5", "1.5-2.0"
    count: number;
  }[];
  mockExamDistribution?: {
    percentileRange: string;      // 예: "95-100", "90-95"
    count: number;
  }[];
}

/**
 * 다음 학기 활동 추천
 */
export interface ActivityRecommendation {
  id: string;
  studentId: string;
  targetGrade: 1 | 2 | 3;
  targetSemester: '1' | '2';

  // 추천 활동 목록
  recommendations: {
    sectionType: SectionType;
    subject?: string;
    activityTitle: string;       // 활동 제목
    activityDescription: string; // 활동 상세 설명
    expectedOutcome: string;     // 기대 효과
    difficulty: 'easy' | 'medium' | 'hard'; // 난이도
    priority: 'high' | 'medium' | 'low';    // 우선순위
    relatedAdmissions: string[]; // 참고한 합격자 기록 ID들
    estimatedTimeWeeks?: number; // 예상 소요 기간 (주)
  }[];

  // 추천 이유
  rationale: string;

  createdAt: string;
}

/**
 * 작성 스타일 추천
 */
export interface WritingStyleRecommendation {
  id: string;
  studentRecordId: string;
  currentText: string;          // 현재 학생이 작성한 텍스트

  // 스타일 분석
  currentStyle: {
    tone: string;               // 현재 어조 (예: "객관적", "주관적")
    structure: string;          // 현재 구조 (예: "단순 나열형", "서사형")
    lengthAnalysis: string;     // 분량 분석
    strengthKeywords: string[]; // 잘 사용된 키워드
    missingElements: string[];  // 빠진 요소
  };

  // 추천 스타일 (합격자 기록 기반)
  recommendedStyle: {
    referenceAdmissionId: string; // 참고 합격자 기록 ID
    referenceText: string;          // 참고 텍스트
    styleDescription: string;       // 스타일 설명
    keyDifferences: string[];       // 주요 차이점
  }[];

  // 개선된 버전
  improvedVersions: {
    version: number;
    improvedText: string;
    improvements: string[];     // 개선 포인트
    basedOnAdmissionId: string; // 기반한 합격자 기록
  }[];

  createdAt: string;
}

/**
 * 미래 설계 (진로 로드맵)
 */
export interface FuturePlan {
  id: string;
  studentId: string;

  // 현재 상태
  currentStatus: {
    grade: 1 | 2 | 3;
    completedActivities: string[];     // 완료한 활동
    strengths: string[];               // 현재 강점
    interests: string[];               // 관심 분야
  };

  // 목표
  goals: {
    dreamUniversity: string;           // 목표 대학
    dreamMajor: string;                // 목표 전공
    dreamCareer: string;               // 최종 진로 (예: "경영 컨설턴트")
  };

  // 로드맵
  roadmap: {
    // 고등학교 단계
    highSchool: {
      grade1: RoadmapStage;
      grade2: RoadmapStage;
      grade3: RoadmapStage;
    };

    // 대학 단계
    university: {
      year1: RoadmapStage;
      year2: RoadmapStage;
      year3: RoadmapStage;
      year4: RoadmapStage;
    };

    // 졸업 후
    postGraduation: {
      shortTerm: string;    // 단기 (졸업 직후~3년)
      midTerm: string;      // 중기 (3~7년)
      longTerm: string;     // 장기 (7년 이후)
    };
  };

  // 면접 대비
  interviewPrep: {
    expectedQuestions: {
      question: string;
      suggestedAnswer: string;
      relatedActivities: string[]; // 관련 생기부 활동
    }[];

    narrativeTheme: string;  // 일관된 서사 주제
    keyMessages: string[];   // 핵심 메시지
  };

  // 참고한 합격자 사례
  referenceAdmissions: string[];

  createdAt: string;
  updatedAt?: string;
}

/**
 * 로드맵 단계
 */
export interface RoadmapStage {
  period: string;              // 기간 (예: "고1", "대1")
  goals: string[];             // 목표
  activities: string[];        // 수행할 활동
  milestones: string[];        // 마일스톤
  skillsToDevelop: string[];   // 개발할 역량
}

// ========================================
// 선생용 타입 (Teacher Mode)
// ========================================

/**
 * 선생용 기본 정보
 * - 같은 과목/섹션으로 여러 학생 관리
 */
export interface TeacherBasicInfo {
  grade: 1 | 2 | 3;
  semester: '1' | '2';
  sectionType: SectionType;
  subject?: string;  // 교과세특인 경우
  teacherName?: string;
}

/**
 * 선생용 학생 정보 (간소화)
 */
export interface TeacherStudentInfo {
  id: string;  // 고유 ID
  name: string;
  classNumber?: string;  // 반/번호 (예: "3반 12번")
  desiredMajor?: string;
  track?: MajorTrack;
}

/**
 * 선생용 학생별 활동 데이터
 */
export interface TeacherStudentActivity {
  studentId: string;
  studentName: string;
  activityDetails: ActivityDetails;  // 기존 활동 타입 재사용
  emphasisKeywords?: string[];
}

/**
 * 선생용 생성 결과 (학생별)
 */
export interface TeacherGeneratedRecord {
  studentId: string;
  studentName: string;
  generatedRecord: GeneratedRecord;  // 기존 생성 타입 재사용
}

/**
 * 선생용 전역 상태
 */
export interface TeacherState {
  teacherId: string;
  sessionId: string;
  basicInfo: TeacherBasicInfo | null;
  students: TeacherStudentInfo[];  // 학생 목록
  studentActivities: TeacherStudentActivity[];  // 학생별 활동
  generatedRecords: TeacherGeneratedRecord[];  // 생성 결과
  currentStep: 'basic' | 'students' | 'activities' | 'review';
}
