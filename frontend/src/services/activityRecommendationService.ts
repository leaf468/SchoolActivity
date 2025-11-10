/**
 * 다음 학기 활동 추천 서비스
 * - 합격자 데이터 기반으로 학생에게 맞춤형 활동 추천
 */

import OpenAI from 'openai';
import {
  ActivityRecommendation,
  AdmissionRecord,
  GeneratedRecord,
  StudentInfo,
} from '../types/schoolActivity';
import { AdmissionDataService } from './admissionDataService';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class ActivityRecommendationService {
  /**
   * 다음 학기 활동 추천 생성
   */
  static async generateRecommendations(
    studentInfo: StudentInfo,
    studentRecords: GeneratedRecord[],
    targetGrade: 1 | 2 | 3,
    targetSemester: '1' | '2'
  ): Promise<ActivityRecommendation | null> {
    try {
      // 1. 같은 계열의 합격자 데이터 조회
      const admissions = await AdmissionDataService.getAdmissionsByTrack(studentInfo.track);

      if (admissions.length === 0) {
        console.warn('No admission records found for track:', studentInfo.track);
        return null;
      }

      // 2. 학생의 현재 생기부 분석
      const currentActivities = studentRecords
        .map(record => `[${record.activityInput.sectionType}] ${record.generatedText}`)
        .join('\n');

      // 3. AI를 사용하여 활동 추천
      const recommendations = await this.recommendWithAI(
        studentInfo,
        currentActivities,
        admissions,
        targetGrade,
        targetSemester
      );

      return recommendations;
    } catch (error) {
      console.error('Error generating activity recommendations:', error);
      return null;
    }
  }

  /**
   * AI 기반 활동 추천
   */
  private static async recommendWithAI(
    studentInfo: StudentInfo,
    currentActivities: string,
    admissions: AdmissionRecord[],
    targetGrade: 1 | 2 | 3,
    targetSemester: '1' | '2'
  ): Promise<ActivityRecommendation> {
    // 합격자 샘플에서 해당 학년의 활동만 추출
    const relevantAdmissions = admissions.slice(0, 10).map(admission => {
      let gradeRecords;
      if (targetGrade === 1) gradeRecords = admission.grade1Records;
      else if (targetGrade === 2) gradeRecords = admission.grade2Records;
      else gradeRecords = admission.grade3Records;

      return {
        id: admission.id,
        university: admission.university,
        major: admission.major,
        activities: gradeRecords.map(r => `[${r.sectionType}] ${r.content}`).join('\n'),
      };
    });

    const prompt = `당신은 대학 입시 전문 컨설턴트입니다. 학생의 현재 생기부를 분석하고, 다음 학기에 수행하면 좋을 활동들을 추천하세요.

## 학생 정보
- 이름: ${studentInfo.name}
- 현재 학년: ${studentInfo.grade}학년
- 희망 전공: ${studentInfo.desiredMajor}
- 계열: ${studentInfo.track}

## 추천 대상
- 목표 학년: ${targetGrade}학년
- 목표 학기: ${targetSemester}학기

## 학생의 현재 생기부
${currentActivities || '(아직 작성된 활동 없음)'}

## 참고: 같은 계열 합격자들의 ${targetGrade}학년 활동
${relevantAdmissions
  .map(
    (sample, idx) => `
### 합격자 ${idx + 1} (${sample.university} ${sample.major})
${sample.activities}
`
  )
  .join('\n\n')}

---

학생의 현재 활동과 합격자들의 활동을 비교분석하여, 다음 학기에 수행하면 좋을 활동 5~8개를 추천하세요.

아래 형식으로 JSON 응답을 생성하세요:

{
  "recommendations": [
    {
      "sectionType": "subject",
      "subject": "수학",
      "activityTitle": "미적분 심화 탐구 프로젝트",
      "activityDescription": "상세한 활동 설명 (2-3문장)",
      "expectedOutcome": "기대 효과 (1-2문장)",
      "difficulty": "medium",
      "priority": "high",
      "relatedAdmissions": ["합격자1_id", "합격자2_id"],
      "estimatedTimeWeeks": 4
    }
  ],
  "rationale": "이러한 활동들을 추천하는 전반적인 이유 (3-4문장)"
}

**중요**:
1. sectionType은 "subject", "autonomy", "club", "service", "career" 중 하나
2. difficulty는 "easy", "medium", "hard" 중 하나
3. priority는 "high", "medium", "low" 중 하나
4. 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 대학 입시 전문 컨설턴트입니다. 활동 추천 결과를 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const aiResponse = response.choices[0].message.content?.trim() || '{}';
    const parsedResult = this.parseAIResponse(aiResponse);

    // 결과 구성
    const recommendation: ActivityRecommendation = {
      id: `recommendation_${Date.now()}`,
      studentId: studentInfo.name,
      targetGrade,
      targetSemester,
      recommendations: parsedResult.recommendations || [],
      rationale: parsedResult.rationale || '추천 활동을 참고하여 계획을 세워보세요.',
      createdAt: new Date().toISOString(),
    };

    return recommendation;
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

      return {
        recommendations: [],
        rationale: '추천을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      };
    }
  }

  /**
   * 특정 섹션에 대한 활동 추천만 생성 (옵션)
   */
  static async generateSectionRecommendations(
    studentInfo: StudentInfo,
    sectionType: string,
    currentActivities: string
  ): Promise<any[]> {
    try {
      const admissions = await AdmissionDataService.getAdmissionsByTrack(studentInfo.track);

      const relevantRecords = admissions
        .slice(0, 5)
        .flatMap(admission => [
          ...admission.grade1Records,
          ...admission.grade2Records,
          ...admission.grade3Records,
        ])
        .filter(record => record.sectionType === sectionType);

      const prompt = `학생의 ${sectionType} 활동을 보완할 수 있는 구체적인 활동 3개를 추천하세요.

## 현재 활동
${currentActivities}

## 합격자 참고 사례
${relevantRecords.slice(0, 5).map(r => r.content).join('\n\n')}

JSON 배열 형식으로 응답:
[
  {
    "title": "활동 제목",
    "description": "활동 설명",
    "duration": "예상 기간"
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const aiResponse = response.choices[0].message.content?.trim() || '[]';
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generating section recommendations:', error);
      return [];
    }
  }
}
