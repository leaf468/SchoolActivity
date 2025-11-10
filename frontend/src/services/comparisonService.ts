/**
 * 합격자 생기부 비교 분석 서비스
 * - 학생의 생기부를 합격자 데이터와 비교하여 분석
 */

import OpenAI from 'openai';
import {
  AdmissionRecord,
  ComparisonResult,
  GeneratedRecord,
  StudentInfo,
} from '../types/schoolActivity';
import { AdmissionDataService } from './admissionDataService';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class ComparisonService {
  /**
   * 학생의 생기부를 합격자 데이터와 비교 분석
   */
  static async compareWithAdmissions(
    studentInfo: StudentInfo,
    studentRecords: GeneratedRecord[]
  ): Promise<ComparisonResult | null> {
    try {
      // 1. 같은 계열의 합격자 데이터 조회
      const admissions = await AdmissionDataService.getAdmissionsByTrack(studentInfo.track);

      if (admissions.length === 0) {
        console.warn('No admission records found for track:', studentInfo.track);
        return null;
      }

      // 2. 학생의 생기부 텍스트 통합
      const studentRecordText = studentRecords
        .map(record => `[${record.activityInput.sectionType}] ${record.generatedText}`)
        .join('\n\n');

      // 3. AI를 사용하여 유사도 분석 및 비교
      const comparisonResult = await this.analyzeWithAI(
        studentInfo,
        studentRecordText,
        admissions
      );

      return comparisonResult;
    } catch (error) {
      console.error('Error comparing with admissions:', error);
      return null;
    }
  }

  /**
   * AI를 사용한 비교 분석
   */
  private static async analyzeWithAI(
    studentInfo: StudentInfo,
    studentRecordText: string,
    admissions: AdmissionRecord[]
  ): Promise<ComparisonResult> {
    // 합격자 샘플 텍스트 (최대 10개만 사용)
    const admissionSamples = admissions.slice(0, 10).map(admission => ({
      id: admission.id,
      university: admission.university,
      major: admission.major,
      records: [
        ...admission.grade1Records,
        ...admission.grade2Records,
        ...admission.grade3Records,
      ]
        .map(r => `[${r.sectionType}] ${r.content}`)
        .join('\n'),
    }));

    const prompt = `당신은 대학 입시 전문 컨설턴트입니다. 학생의 생기부를 분석하고, 같은 계열의 합격자 생기부와 비교하여 상세한 피드백을 제공하세요.

## 학생 정보
- 이름: ${studentInfo.name}
- 학년: ${studentInfo.grade}학년
- 희망 전공: ${studentInfo.desiredMajor}
- 계열: ${studentInfo.track}

## 학생의 생기부
${studentRecordText}

## 참고: 같은 계열 합격자 생기부 샘플 (최근 ${admissionSamples.length}개)
${admissionSamples
  .map(
    (sample, idx) => `
### 합격자 ${idx + 1} (ID: ${sample.id})
- 대학: ${sample.university}
- 전공: ${sample.major}
- 생기부:
${sample.records}
`
  )
  .join('\n\n')}

---

아래 형식으로 JSON 응답을 생성하세요:

{
  "similarAdmissions": [
    {
      "admissionId": "합격자 ID",
      "similarityScore": 85,
      "matchingPoints": ["유사점 1", "유사점 2", "유사점 3"],
      "differencePoints": ["차이점 1", "차이점 2"]
    }
  ],
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "weaknesses": [
    {
      "area": "부족한 영역",
      "description": "상세 설명",
      "suggestedActivities": ["추천 활동 1", "추천 활동 2"]
    }
  ],
  "overallAssessment": "전체 평가 (3-5문장)",
  "competitivenessScore": 75
}

**중요**: 반드시 유효한 JSON 형식으로만 응답하세요. 추가 설명이나 마크다운은 포함하지 마세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 대학 입시 전문 컨설턴트입니다. 생기부 분석 결과를 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0].message.content?.trim() || '{}';
    const parsedResult = this.parseAIResponse(aiResponse);

    // 결과 구성
    const comparisonResult: ComparisonResult = {
      id: `comparison_${Date.now()}`,
      studentRecordId: `student_${studentInfo.name}_${Date.now()}`,
      similarAdmissions: parsedResult.similarAdmissions.map((item: any) => {
        const admission = admissions.find(a => a.id === item.admissionId);
        return {
          admissionRecord: admission || admissions[0], // fallback
          similarityScore: item.similarityScore,
          matchingPoints: item.matchingPoints,
          differencePoints: item.differencePoints,
        };
      }),
      strengths: parsedResult.strengths,
      weaknesses: parsedResult.weaknesses,
      overallAssessment: parsedResult.overallAssessment,
      competitivenessScore: parsedResult.competitivenessScore,
      createdAt: new Date().toISOString(),
    };

    return comparisonResult;
  }

  /**
   * AI 응답 파싱
   */
  private static parseAIResponse(aiResponse: string): any {
    try {
      // Remove markdown code blocks if present
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

      // Return default structure
      return {
        similarAdmissions: [],
        strengths: ['분석 중 오류가 발생했습니다.'],
        weaknesses: [],
        overallAssessment: '분석을 다시 시도해주세요.',
        competitivenessScore: 50,
      };
    }
  }

  /**
   * 간단한 유사도 계산 (벡터 기반 - 백업용)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    // 간단한 키워드 기반 유사도
    const words1 = new Set(text1.toLowerCase().match(/[\w가-힣]+/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/[\w가-힣]+/g) || []);

    const words1Array = Array.from(words1);
    const words2Array = Array.from(words2);
    const intersection = new Set(words1Array.filter(x => words2.has(x)));
    const union = new Set([...words1Array, ...words2Array]);

    return (intersection.size / union.size) * 100;
  }
}
