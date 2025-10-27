// 생활기록부 항목 타입
export type SectionType = 'subject' | 'autonomy' | 'club' | 'career' | 'behavior';

// 과목 세부능력 및 특기사항 (세특)
export interface SubjectActivity {
  subject: string;
  background: string;    // 활동 배경/동기
  process: string;        // 활동 과정
  result: string;         // 결과/성과
  growth: string;         // 성장/배움
}

// 자율활동
export interface AutonomyActivity {
  activityName: string;
  role: string;
  content: string;
  impact: string;
}

// 동아리활동
export interface ClubActivity {
  clubName: string;
  role: string;
  activities: string;
  achievements: string;
}

// 진로활동
export interface CareerActivity {
  activityType: string;   // 활동 유형 (진로탐색, 직업체험 등)
  content: string;
  insights: string;       // 깨달음/진로에 미친 영향
}

// 행동특성 및 종합의견
export interface BehaviorActivity {
  strengths: string;      // 강점
  collaboration: string;  // 협업/관계
  growth: string;         // 성장과정
  character: string;      // 인성/태도
}

// 활동 데이터 유니온 타입
export type ActivityDetails =
  | SubjectActivity
  | AutonomyActivity
  | ClubActivity
  | CareerActivity
  | BehaviorActivity;

// 기본 정보
export interface BasicInfo {
  grade: string;          // 학년 (1, 2, 3)
  semester: string;       // 학기 (1, 2)
  sectionType: SectionType;
  subject?: string;       // 세특인 경우 과목명
}

// AI 생성 초안
export interface DraftResult {
  draftText: string;
  qualityScore?: number;  // 0-100 품질 점수
  recommendedKeywords?: string[];
  fewShotSamples?: string[]; // 사용된 퓨샷 샘플
}

// 최종 저장 레코드
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

// SchoolActivity 전역 상태
export interface SchoolActivityState {
  userId: string;
  sessionId: string;
  basicInfo: BasicInfo | null;
  activityDetails: ActivityDetails | null;
  emphasisKeywords: string[];
  draftResult: DraftResult | null;
  finalText: string | null;
  currentStep: 'basic' | 'input' | 'draft' | 'final';
}
