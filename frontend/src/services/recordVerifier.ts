/**
 * 생기부 검증 서비스 (Prompt 2: Verification Consultant)
 *
 * 생성된 생기부 텍스트의 진정성, 표절 위험도, 신뢰성을 평가하고
 * 개선 제안을 제공합니다.
 */

import OpenAI from 'openai';
import {
  VerificationRequest,
  VerificationResult,
  PlagiarismRisk
} from '../types/schoolActivity';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o';

class RecordVerifier {

  /**
   * Prompt 2: 검증 컨설턴트 시스템 프롬프트
   */
  private getSystemPrompt(): string {
    return `🧠 **역할(Role)**
You are an expert university admissions advisor and plagiarism-detection consultant specialized in Korean school activity records (생기부).

Your task is to help verify that student activity records are authentic, consistent, and plagiarism-free.

**핵심 임무:**
생성된 생기부 텍스트를 다음 5가지 기준으로 평가하고 개선 제안을 제공합니다:

1. **직접 작성 여부 (Authenticity)**
   - 외부 문구나 템플릿 사용 흔적 탐지
   - AI 생성 특유의 패턴 분석
   - 진정성 점수 산출 (0-100)

2. **내용 일치성 (Consistency)**
   - 제공된 활동 요약과 생성된 텍스트의 일치도 확인
   - 과장되거나 사실과 다른 내용 탐지

3. **표절 위험도 분석 (Plagiarism Risk)**
   - 일반적인 생기부 표현과의 유사도 평가
   - 카피킬러/Turnitin 기준 위험도 평가 (low/medium/high)
   - 유사도 퍼센티지 추정

4. **신뢰성 점검 (Credibility)**
   - 과장·허위로 판단될 소지가 있는 부분 탐지
   - 구체성이 부족한 추상적 표현 식별

5. **최종 권장 사항 (Recommendations)**
   - 구체적이고 실행 가능한 개선 제안
   - 필요시 개선된 텍스트 제공

**출력 형식 (JSON):**
{
  "authenticityScore": 85,
  "templateDetected": false,
  "externalSourceDetected": false,
  "consistencyIssues": ["발견된 불일치 사항들"],
  "plagiarismRisk": "low" | "medium" | "high",
  "similarityPercentage": 15,
  "exaggerationIssues": ["과장 가능성 있는 부분들"],
  "recommendations": ["개선 제안 목록"],
  "improvedText": "개선된 텍스트 (선택)",
  "overallScore": 82
}`;
  }

  /**
   * 생기부 텍스트 검증
   */
  async verifyRecord(request: VerificationRequest): Promise<VerificationResult> {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userMessage = this.buildUserMessage(request);

      console.log('=== 생기부 검증 요청 ===');
      console.log('텍스트 길이:', request.generatedText.length);

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('검증 결과를 받지 못했습니다.');
      }

      const aiResult = JSON.parse(content);

      // VerificationResult 구성
      const result: VerificationResult = {
        id: this.generateId(),
        recordId: request.recordId,
        authenticityScore: aiResult.authenticityScore || 0,
        templateDetected: aiResult.templateDetected || false,
        externalSourceDetected: aiResult.externalSourceDetected || false,
        consistencyIssues: aiResult.consistencyIssues || [],
        plagiarismRisk: this.normalizePlagiarismRisk(aiResult.plagiarismRisk),
        similarityPercentage: aiResult.similarityPercentage || 0,
        exaggerationIssues: aiResult.exaggerationIssues || [],
        recommendations: aiResult.recommendations || [],
        improvedText: aiResult.improvedText,
        overallScore: aiResult.overallScore || 0,
        createdAt: new Date().toISOString()
      };

      console.log('검증 완료 - 종합 점수:', result.overallScore);
      console.log('표절 위험도:', result.plagiarismRisk);

      return result;

    } catch (error) {
      console.error('검증 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 메시지 구성
   */
  private buildUserMessage(request: VerificationRequest): string {
    let message = `**[검증 대상 생기부 텍스트]**\n`;
    message += `${request.generatedText}\n\n`;

    message += `**[원본 활동 요약]**\n`;
    message += `${request.originalActivitySummary}\n\n`;

    message += `**[학생 정보]**\n`;
    message += `- 이름: ${request.studentInfo.name}\n`;
    message += `- 학년: ${request.studentInfo.grade}학년\n`;
    message += `- 희망 진로: ${request.studentInfo.desiredMajor}\n\n`;

    if (request.officialRecordData) {
      message += `**[공식 생기부 기록 (확인용)]**\n`;
      if (request.officialRecordData.awards) {
        message += `- 수상: ${request.officialRecordData.awards.join(', ')}\n`;
      }
      if (request.officialRecordData.activities) {
        message += `- 활동: ${request.officialRecordData.activities.join(', ')}\n`;
      }
      if (request.officialRecordData.dates) {
        message += `- 날짜: ${request.officialRecordData.dates.join(', ')}\n`;
      }
      message += '\n';
    }

    message += `**[검증 요청 사항]**\n`;
    message += `위의 생성된 텍스트를 5가지 기준(진정성, 일치성, 표절위험도, 신뢰성, 개선제안)으로 평가하고 JSON 형식으로 결과를 반환하세요.\n`;
    message += `특히 원본 활동 요약과의 일치도, AI 생성 특유의 패턴, 과장된 표현을 중점적으로 검토하세요.`;

    return message;
  }

  /**
   * 표절 위험도 정규화
   */
  private normalizePlagiarismRisk(risk: string): PlagiarismRisk {
    const normalized = risk?.toLowerCase();
    if (normalized === 'high') return 'high';
    if (normalized === 'medium') return 'medium';
    return 'low';
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return 'verif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 빠른 품질 체크 (AI 호출 없이 로컬에서 수행)
   */
  quickQualityCheck(text: string): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // 1. 길이 체크
    if (text.length < 100) {
      issues.push('텍스트가 너무 짧습니다 (최소 100자 권장)');
    }
    if (text.length > 500) {
      issues.push('텍스트가 너무 깁니다 (최대 500자 권장)');
    }

    // 2. 교사 관찰 어투 체크
    const hasProperEnding = /[함임]\.$|돋보임\.$|인상적임\.$|기름\.$|보임\.$|확장함\.$/.test(text);
    if (!hasProperEnding) {
      issues.push('교사의 관찰 어투("~함.", "~임." 등)가 부족합니다');
    }

    // 3. AI 챗봇 특유 표현 체크
    const aiPhrases = ['~할 수 있습니다', '~하는 것이 좋습니다', '~해보세요', '~하시기 바랍니다'];
    for (const phrase of aiPhrases) {
      if (text.includes(phrase)) {
        issues.push(`AI 챗봇 특유의 표현 감지: "${phrase}"`);
      }
    }

    // 4. 상투적 표현 체크
    const cliches = ['매우 우수한', '뛰어난', '훌륭한', '놀라운'];
    for (const cliche of cliches) {
      if (text.includes(cliche)) {
        issues.push(`상투적인 표현 감지: "${cliche}"`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}

export const recordVerifier = new RecordVerifier();
export default recordVerifier;
