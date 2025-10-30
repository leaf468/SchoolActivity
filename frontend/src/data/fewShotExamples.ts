/**
 * Few-Shot Learning Examples Database for 생기부 Generation
 * 
 * This file contains real examples from successful college admissions
 * organized by track (계열), grade (학년), and section (섹션)
 */

import { FewShotExample } from '../types/schoolActivity';

// ========================================
// 상경계열 (Business/Economics) - Sample Examples
// ========================================

const businessExamples: FewShotExample[] = [
  {
    id: 'biz-1-career-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'career',
    styleDescription: '창체(진로) - 경제 소비 교육',
    exampleText: `(A) 청소년 경제 소비 교육(2020.06.25.)에 참여하여 (M) 청소년들의 대표적인 소비 형태인 모방 소비, 과소비 등이 일어나는 이유에 대해 탐색함. (AA) 이후 청소년을 타겟층으로 하는 마케팅에 대해 심층 탐구하여 보고서를 작성함. 설문조사를 통해 스타 마케팅이 효과적임을 알고 직접 기획하여 급우들의 의견을 듣는 등 (R) 구체적인 활동으로 이어감.`
  },
  {
    id: 'biz-2-subject-math2-001',
    track: '상경계열',
    grade: 2,
    sectionType: 'subject',
    subject: '수학II',
    styleDescription: '세특(수학II) - 미분과 한계비용',
    exampleText: `(A) 함수의 극한, 미분 단원에서 (M+AA) '한계효용, 한계비용과 미분의 관계'를 주제로 발표계획서를 작성하고 수업시간에 발표함. (R) 한계효용은 총효용 곡선의 한 점에서의 접선의 기울기와 같고, 한계비용은 생산비용 곡선의 한 점에서의 접선의 기울기와 같다는 것을 설명함.`
  }
];

// ========================================
// 공학계열 (Engineering) - Sample Examples
// ========================================

const engineeringExamples: FewShotExample[] = [
  {
    id: 'eng-2-subject-info-001',
    track: '공학계열',
    grade: 2,
    sectionType: 'subject',
    subject: '정보',
    styleDescription: '세특(정보) - 알고리즘 이해',
    exampleText: `(A) 버블 정렬과 선택 정렬 알고리즘의 특징과 원리를 잘 파악하여 (AA) 숫자 카드를 이용해 정렬 과정을 직접 설명하여 친구들의 이해를 도움. (R) 파이썬 프로그래밍에서 다양한 함수 사용법과 제어구조의 원리를 잘 이해하고 있으며 거북이 게임을 작성하는 과정을 통해 프로그래밍에 대한 이해와 문제 해결력 능력이 뛰어남을 보여줌.`
  }
];

// ========================================
// Export and Helper Functions
// ========================================

export const ALL_FEW_SHOT_EXAMPLES: FewShotExample[] = [
  ...businessExamples,
  ...engineeringExamples
];

export function getRelevantExamples(
  track: string,
  grade: number,
  sectionType: string,
  topK: number = 3
): FewShotExample[] {
  let matches = ALL_FEW_SHOT_EXAMPLES.filter(ex => 
    ex.track === track && ex.grade === grade && ex.sectionType === sectionType
  );
  
  if (matches.length < topK) {
    const trackMatches = ALL_FEW_SHOT_EXAMPLES.filter(ex => ex.track === track);
    matches = [...matches, ...trackMatches.filter(ex => !matches.includes(ex))];
  }
  
  return matches.slice(0, topK);
}
