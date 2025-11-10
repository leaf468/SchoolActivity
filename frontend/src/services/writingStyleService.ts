/**
 * 생기부 작성 스타일 추천 서비스
 * - 학생의 현재 작성 스타일을 분석하고 합격자 기반 개선안 제시
 */

import OpenAI from 'openai';
import {
  WritingStyleRecommendation,
  AdmissionRecord,
  StudentInfo,
  SectionType,
} from '../types/schoolActivity';
import { AdmissionDataService } from './admissionDataService';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class WritingStyleService {
  /**
   * 작성 스타일 분석 및 추천
   */
  static async analyzeAndRecommend(
    studentInfo: StudentInfo,
    currentText: string,
    sectionType: SectionType,
    subject?: string
  ): Promise<WritingStyleRecommendation | null> {
    try {
      // 1. 같은 계열의 합격자 데이터 조회
      const admissions = await AdmissionDataService.getAdmissionsByTrack(studentInfo.track);

      if (admissions.length === 0) {
        console.warn('No admission records found');
        return null;
      }

      // 2. 같은 섹션의 합격자 기록 필터링
      const relevantRecords = this.filterRelevantRecords(admissions, sectionType, subject);

      if (relevantRecords.length === 0) {
        console.warn('No relevant records found');
        return null;
      }

      // 3. AI로 스타일 분석 및 개선안 생성
      const recommendation = await this.analyzeWithAI(
        studentInfo,
        currentText,
        relevantRecords,
        sectionType,
        subject
      );

      return recommendation;
    } catch (error) {
      console.error('Error analyzing writing style:', error);
      return null;
    }
  }

  /**
   * 관련 합격자 기록 필터링
   */
  private static filterRelevantRecords(
    admissions: AdmissionRecord[],
    sectionType: SectionType,
    subject?: string
  ): Array<{ admissionId: string; university: string; major: string; text: string }> {
    const records: Array<{ admissionId: string; university: string; major: string; text: string }> = [];

    for (const admission of admissions) {
      const allRecords = [
        ...admission.grade1Records,
        ...admission.grade2Records,
        ...admission.grade3Records,
      ];

      const matching = allRecords.filter(record => {
        if (record.sectionType !== sectionType) return false;
        if (subject && record.subject !== subject) return false;
        return true;
      });

      for (const record of matching) {
        records.push({
          admissionId: admission.id,
          university: admission.university,
          major: admission.major,
          text: record.content,
        });
      }

      // 최대 15개만
      if (records.length >= 15) break;
    }

    return records;
  }

  /**
   * AI 기반 스타일 분석
   */
  private static async analyzeWithAI(
    studentInfo: StudentInfo,
    currentText: string,
    relevantRecords: Array<{ admissionId: string; university: string; major: string; text: string }>,
    sectionType: SectionType,
    subject?: string
  ): Promise<WritingStyleRecommendation> {
    const sectionName = subject ? `${subject} 교과세특` : this.getSectionName(sectionType);

    const prompt = `당신은 생기부 작성 전문가입니다. 학생이 작성한 생기부의 스타일을 분석하고, 합격자 생기부를 참고하여 개선된 버전을 제시하세요.

## 학생 정보
- 이름: ${studentInfo.name}
- 학년: ${studentInfo.grade}학년
- 희망 전공: ${studentInfo.desiredMajor}
- 섹션: ${sectionName}

## 학생이 작성한 내용
${currentText}

## 같은 섹션의 합격자 생기부 예시 (${relevantRecords.length}개)
${relevantRecords
  .slice(0, 10)
  .map(
    (record, idx) => `
### 예시 ${idx + 1} (${record.university} ${record.major}, ID: ${record.admissionId})
${record.text}
`
  )
  .join('\n\n')}

---

학생의 작성물을 분석하고, 합격자 스타일을 참고하여 개선된 버전 3개를 작성하세요.

아래 형식으로 JSON 응답을 생성하세요:

{
  "currentStyle": {
    "tone": "현재 어조 (예: 객관적, 주관적, 설명적 등)",
    "structure": "현재 구조 (예: 단순 나열형, 서사형, A-M-A-R 구조 등)",
    "lengthAnalysis": "분량에 대한 평가",
    "strengthKeywords": ["잘 사용된 키워드1", "키워드2"],
    "missingElements": ["부족한 요소1", "요소2"]
  },
  "recommendedStyle": [
    {
      "referenceAdmissionId": "참고한 합격자 ID",
      "referenceText": "참고한 합격자 텍스트 (축약 가능)",
      "styleDescription": "이 스타일의 특징 설명",
      "keyDifferences": ["차이점1", "차이점2"]
    }
  ],
  "improvedVersions": [
    {
      "version": 1,
      "improvedText": "개선된 생기부 텍스트 (완성본)",
      "improvements": ["개선 포인트1", "개선 포인트2"],
      "basedOnAdmissionId": "참고한 합격자 ID"
    },
    {
      "version": 2,
      "improvedText": "또 다른 스타일의 개선본",
      "improvements": ["개선 포인트1", "개선 포인트2"],
      "basedOnAdmissionId": "참고한 합격자 ID"
    },
    {
      "version": 3,
      "improvedText": "세 번째 스타일의 개선본",
      "improvements": ["개선 포인트1", "개선 포인트2"],
      "basedOnAdmissionId": "참고한 합격자 ID"
    }
  ]
}

**중요**:
1. improvedText는 실제 생기부에 바로 사용할 수 있는 완성된 텍스트여야 합니다.
2. 각 버전은 서로 다른 스타일/접근법을 보여야 합니다.
3. A-M-A-R 구조(동기-활동-심화-깨달음)를 적극 활용하세요.
4. 반드시 유효한 JSON 형식으로만 응답하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 생기부 작성 전문가입니다. 분석 결과를 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const aiResponse = response.choices[0].message.content?.trim() || '{}';
    const parsedResult = this.parseAIResponse(aiResponse);

    // 결과 구성
    const recommendation: WritingStyleRecommendation = {
      id: `style_rec_${Date.now()}`,
      studentRecordId: `student_${studentInfo.name}_${Date.now()}`,
      currentText,
      currentStyle: parsedResult.currentStyle || {
        tone: '분석 중',
        structure: '분석 중',
        lengthAnalysis: '분석 중',
        strengthKeywords: [],
        missingElements: [],
      },
      recommendedStyle: parsedResult.recommendedStyle || [],
      improvedVersions: parsedResult.improvedVersions || [],
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
        currentStyle: {
          tone: '분석 실패',
          structure: '분석 실패',
          lengthAnalysis: '다시 시도해주세요.',
          strengthKeywords: [],
          missingElements: [],
        },
        recommendedStyle: [],
        improvedVersions: [],
      };
    }
  }

  /**
   * 섹션명 한글 변환
   */
  private static getSectionName(sectionType: SectionType): string {
    const map: Record<SectionType, string> = {
      subject: '교과세특',
      autonomy: '자율활동',
      club: '동아리활동',
      service: '봉사활동',
      career: '진로활동',
      behavior: '행동특성',
    };
    return map[sectionType] || sectionType;
  }

  /**
   * 간단한 스타일 체크 (AI 없이)
   */
  static async quickStyleCheck(text: string): Promise<{
    wordCount: number;
    hasAmarStructure: boolean;
    suggestions: string[];
  }> {
    const wordCount = text.replace(/\s/g, '').length;
    const hasKeywords = {
      motivation: /호기심|궁금|문제의식|관심/.test(text),
      action: /탐구|조사|분석|연구|활동/.test(text),
      realization: /깨달|배우|이해|성장|발전/.test(text),
    };

    const hasAmarStructure = Object.values(hasKeywords).filter(Boolean).length >= 2;

    const suggestions: string[] = [];
    if (wordCount < 200) suggestions.push('분량이 다소 부족합니다. 구체적인 내용을 추가해보세요.');
    if (!hasKeywords.motivation) suggestions.push('활동의 동기나 문제의식을 추가하면 좋습니다.');
    if (!hasKeywords.realization) suggestions.push('활동을 통한 깨달음이나 성장을 표현해보세요.');

    return {
      wordCount,
      hasAmarStructure,
      suggestions,
    };
  }
}
