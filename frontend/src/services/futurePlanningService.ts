/**
 * 미래 설계 (진로 로드맵) 서비스
 * - 생기부 기반 면접 대비, 진로 설계, 로드맵 생성
 */

import OpenAI from 'openai';
import {
  FuturePlan,
  StudentInfo,
  GeneratedRecord,
  AdmissionRecord,
} from '../types/schoolActivity';
import { AdmissionDataService } from './admissionDataService';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class FuturePlanningService {
  /**
   * 종합 미래 계획 생성
   */
  static async generateFuturePlan(
    studentInfo: StudentInfo,
    studentRecords: GeneratedRecord[],
    dreamUniversity: string,
    dreamMajor: string,
    dreamCareer: string
  ): Promise<FuturePlan | null> {
    try {
      // 1. 합격자 데이터 조회
      const admissions = await AdmissionDataService.getAdmissionsByTrack(studentInfo.track);

      // 2. 학생의 현재 활동 정리
      const currentActivities = studentRecords
        .map(record => `[${record.activityInput.sectionType}] ${record.generatedText}`)
        .join('\n');

      // 3. AI로 미래 계획 생성
      const futurePlan = await this.generateWithAI(
        studentInfo,
        currentActivities,
        admissions,
        dreamUniversity,
        dreamMajor,
        dreamCareer
      );

      return futurePlan;
    } catch (error) {
      console.error('Error generating future plan:', error);
      return null;
    }
  }

  /**
   * AI 기반 미래 계획 생성
   */
  private static async generateWithAI(
    studentInfo: StudentInfo,
    currentActivities: string,
    admissions: AdmissionRecord[],
    dreamUniversity: string,
    dreamMajor: string,
    dreamCareer: string
  ): Promise<FuturePlan> {
    // 같은 대학/전공 합격자 찾기
    const relevantAdmissions = admissions.filter(
      a => a.university === dreamUniversity || a.major === dreamMajor
    );

    const prompt = `당신은 대학 입시 및 진로 설계 전문가입니다. 학생의 현재 상태와 목표를 바탕으로 구체적인 미래 로드맵을 작성하세요.

## 학생 정보
- 이름: ${studentInfo.name}
- 현재 학년: ${studentInfo.grade}학년
- 희망 전공: ${studentInfo.desiredMajor}
- 계열: ${studentInfo.track}

## 학생의 목표
- 목표 대학: ${dreamUniversity}
- 목표 전공: ${dreamMajor}
- 최종 진로: ${dreamCareer}

## 학생의 현재 생기부 활동
${currentActivities}

## 참고: 같은 목표의 합격자 사례 (${relevantAdmissions.length}명)
${relevantAdmissions
  .slice(0, 3)
  .map(
    (adm, idx) => `
### 합격자 ${idx + 1} (${adm.university} ${adm.major})
${[...adm.grade1Records, ...adm.grade2Records, ...adm.grade3Records]
  .map(r => `[${r.sectionType}] ${r.content}`)
  .slice(0, 3)
  .join('\n')}
`
  )
  .join('\n\n')}

---

학생의 목표 달성을 위한 구체적인 로드맵을 작성하세요:
1. 고등학교 각 학년별 목표와 활동
2. 대학교 각 학년별 목표와 활동
3. 졸업 후 단기/중기/장기 계획
4. 면접 대비 (예상 질문과 답변, 일관된 서사)

아래 형식으로 JSON 응답을 생성하세요:

{
  "currentStatus": {
    "grade": ${studentInfo.grade},
    "completedActivities": ["완료한 활동1", "활동2"],
    "strengths": ["강점1", "강점2", "강점3"],
    "interests": ["관심 분야1", "분야2"]
  },
  "goals": {
    "dreamUniversity": "${dreamUniversity}",
    "dreamMajor": "${dreamMajor}",
    "dreamCareer": "${dreamCareer}"
  },
  "roadmap": {
    "highSchool": {
      "grade1": {
        "period": "고1",
        "goals": ["목표1", "목표2"],
        "activities": ["활동1", "활동2", "활동3"],
        "milestones": ["마일스톤1", "마일스톤2"],
        "skillsToDevelop": ["역량1", "역량2"]
      },
      "grade2": {
        "period": "고2",
        "goals": ["목표1", "목표2"],
        "activities": ["활동1", "활동2", "활동3"],
        "milestones": ["마일스톤1", "마일스톤2"],
        "skillsToDevelop": ["역량1", "역량2"]
      },
      "grade3": {
        "period": "고3",
        "goals": ["목표1", "목표2"],
        "activities": ["활동1", "활동2"],
        "milestones": ["수시 지원", "최종 합격"],
        "skillsToDevelop": ["역량1", "역량2"]
      }
    },
    "university": {
      "year1": {
        "period": "대1",
        "goals": ["대학 생활 적응", "전공 기초 다지기"],
        "activities": ["수업", "동아리", "대외활동"],
        "milestones": ["학점 관리", "네트워킹"],
        "skillsToDevelop": ["전공 지식", "소프트 스킬"]
      },
      "year2": {
        "period": "대2",
        "goals": ["전공 심화", "실무 경험"],
        "activities": ["심화 수업", "인턴십", "프로젝트"],
        "milestones": ["인턴 경험", "포트폴리오 구축"],
        "skillsToDevelop": ["실무 능력", "협업"]
      },
      "year3": {
        "period": "대3",
        "goals": ["전문성 강화", "진로 구체화"],
        "activities": ["전공 프로젝트", "연구 참여", "해외 경험"],
        "milestones": ["논문 게재", "자격증 취득"],
        "skillsToDevelop": ["전문 지식", "글로벌 역량"]
      },
      "year4": {
        "period": "대4",
        "goals": ["취업/진학 준비", "졸업 프로젝트"],
        "activities": ["취업 준비", "졸업 논문", "최종 프로젝트"],
        "milestones": ["졸업", "취업/진학 확정"],
        "skillsToDevelop": ["직무 역량", "리더십"]
      }
    },
    "postGraduation": {
      "shortTerm": "졸업 직후~3년: ${dreamCareer} 분야 신입으로 시작, 실무 경험 쌓기",
      "midTerm": "3~7년: 전문가로 성장, 주요 프로젝트 리딩",
      "longTerm": "7년 이후: 해당 분야 리더로 자리매김, 후배 양성"
    }
  },
  "interviewPrep": {
    "expectedQuestions": [
      {
        "question": "예상 면접 질문 1",
        "suggestedAnswer": "추천 답변 (생기부 활동과 연결)",
        "relatedActivities": ["관련 생기부 활동1", "활동2"]
      },
      {
        "question": "예상 면접 질문 2",
        "suggestedAnswer": "추천 답변",
        "relatedActivities": ["관련 활동"]
      },
      {
        "question": "예상 면접 질문 3",
        "suggestedAnswer": "추천 답변",
        "relatedActivities": ["관련 활동"]
      },
      {
        "question": "예상 면접 질문 4",
        "suggestedAnswer": "추천 답변",
        "relatedActivities": ["관련 활동"]
      },
      {
        "question": "예상 면접 질문 5",
        "suggestedAnswer": "추천 답변",
        "relatedActivities": ["관련 활동"]
      }
    ],
    "narrativeTheme": "학생의 일관된 스토리 라인 (2-3문장)",
    "keyMessages": ["핵심 메시지1", "메시지2", "메시지3"]
  },
  "referenceAdmissions": ${JSON.stringify(relevantAdmissions.slice(0, 3).map(a => a.id))}
}

**중요**:
1. 각 단계는 구체적이고 실행 가능해야 합니다.
2. 면접 질문은 실제 입시 면접에서 나올 법한 질문이어야 합니다.
3. 답변은 학생의 생기부 활동과 자연스럽게 연결되어야 합니다.
4. 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 진로 설계 전문가입니다. 로드맵을 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0].message.content?.trim() || '{}';
    const parsedResult = this.parseAIResponse(aiResponse);

    // 결과 구성
    const futurePlan: FuturePlan = {
      id: `future_plan_${Date.now()}`,
      studentId: studentInfo.name,
      currentStatus: parsedResult.currentStatus || {
        grade: studentInfo.grade,
        completedActivities: [],
        strengths: [],
        interests: [],
      },
      goals: parsedResult.goals || {
        dreamUniversity,
        dreamMajor,
        dreamCareer,
      },
      roadmap: parsedResult.roadmap || this.getDefaultRoadmap(),
      interviewPrep: parsedResult.interviewPrep || {
        expectedQuestions: [],
        narrativeTheme: '분석 중입니다.',
        keyMessages: [],
      },
      referenceAdmissions: parsedResult.referenceAdmissions || [],
      createdAt: new Date().toISOString(),
    };

    return futurePlan;
  }

  /**
   * AI 응답 파싱
   */
  private static parseAIResponse(aiResponse: string): any {
    try {
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', aiResponse);
      return {};
    }
  }

  /**
   * 기본 로드맵 구조
   */
  private static getDefaultRoadmap() {
    return {
      highSchool: {
        grade1: {
          period: '고1',
          goals: ['기본 역량 다지기'],
          activities: ['교과 활동'],
          milestones: [],
          skillsToDevelop: [],
        },
        grade2: {
          period: '고2',
          goals: ['심화 활동'],
          activities: ['전공 관련 활동'],
          milestones: [],
          skillsToDevelop: [],
        },
        grade3: {
          period: '고3',
          goals: ['입시 준비'],
          activities: ['최종 마무리'],
          milestones: [],
          skillsToDevelop: [],
        },
      },
      university: {
        year1: {
          period: '대1',
          goals: ['적응'],
          activities: ['기초 수업'],
          milestones: [],
          skillsToDevelop: [],
        },
        year2: {
          period: '대2',
          goals: ['심화'],
          activities: ['전공 심화'],
          milestones: [],
          skillsToDevelop: [],
        },
        year3: {
          period: '대3',
          goals: ['전문성'],
          activities: ['실무 경험'],
          milestones: [],
          skillsToDevelop: [],
        },
        year4: {
          period: '대4',
          goals: ['진로 확정'],
          activities: ['취업 준비'],
          milestones: [],
          skillsToDevelop: [],
        },
      },
      postGraduation: {
        shortTerm: '진로 시작',
        midTerm: '전문가 성장',
        longTerm: '리더 역할',
      },
    };
  }

  /**
   * 면접 질문만 생성 (간단 버전)
   */
  static async generateInterviewQuestions(
    studentInfo: StudentInfo,
    studentRecords: GeneratedRecord[]
  ): Promise<Array<{ question: string; suggestedAnswer: string; relatedActivities: string[] }>> {
    try {
      const activities = studentRecords
        .map(record => `[${record.activityInput.sectionType}] ${record.generatedText}`)
        .join('\n');

      const prompt = `학생의 생기부를 보고 입시 면접에서 나올 수 있는 질문 5개와 추천 답변을 작성하세요.

## 학생 정보
- 학년: ${studentInfo.grade}학년
- 희망 전공: ${studentInfo.desiredMajor}

## 생기부
${activities}

JSON 배열 형식으로 응답:
[
  {
    "question": "질문",
    "suggestedAnswer": "추천 답변",
    "relatedActivities": ["관련 활동"]
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = response.choices[0].message.content?.trim() || '[]';
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return [];
    }
  }
}
