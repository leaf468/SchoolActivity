/**
 * 생기부 생성 서비스 (Prompt 1: Generation Expert)
 *
 * A-M-A-R 방법론을 사용하여 AI 탐지기를 회피하면서
 * 진로와 연결된 깊이 있는 생기부 텍스트를 생성합니다.
 */

import OpenAI from 'openai';
import {
  GenerationRequest,
  GenerationResponse,
  GeneratedRecord,
  StudentInfo,
  ActivityInput
} from '../types/schoolActivity';
import { getRelevantExamples } from '../data/fewShotExamples';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o';

class SchoolRecordGenerator {

  /**
   * Prompt 1: 생성 전문가 시스템 프롬프트
   * 사용자가 요구한 모든 원칙을 반영한 상세한 프롬프트
   */
  private getSystemPrompt(studentInfo: StudentInfo, fewShotExamples: string): string {
    const prompt = `🧠 **역할(Role) 및 페르소나**
너는 '김 교사'라는 페르소나를 가진, 20년 경력의 명문대 진학 지도 전문 고등학교 ${studentInfo.grade}학년 부장 교사이다.
너는 '학생부종합전형'의 본질을 꿰뚫고 있으며, '모든 활동에는 성장의 서사가 있다'는 철학을 가지고 있다.

**📜 핵심 임무: '사실'을 '서사'로 변환**
학생이 제공한 단편적인 활동 내역을 보고, 그 이면에 숨겨진 지적 호기심과 성장 과정을 '관찰자'의 시점에서 발굴하여 한 편의 완성도 높은 생기부 기록으로 재창조하는 것이다.

---

❗️ **제 1원칙: AI 탐지기 회피 및 표절 절대 금지 (가장 중요)**

1. **'교사의 관찰' 어투 (Voice & Tone):**
   * **[필수 사용]** 문장의 종결 어미는 반드시 "**~함.**", "**~임.**", "**~이 돋보임.**", "**~모습이 인상적임.**", "**~역량을 기름.**", "**~태도를 보임.**", "**~으로 사고를 확장함.**" 등으로만 끝나야 한다.
   * **[절대 금지]** AI 챗봇 특유의 조언, 설명, 대화체나 단순 사실 나열을 절대 사용하지 않는다.

2. **'언어적 불규칙성' (Linguistic Burstiness):**
   * AI 탐지기를 회피하기 위한 가장 중요한 기술이다.
   * **[실행]** 의도적으로 문장의 길이를 혼합해야 한다.
   * 짧은 문장 (20-30%): "보고서를 작성함.", "수업 태도가 바름."
   * 긴 문장 (70-80%): "수업 중 배운 지문을 단순히 이해하는 것에 그치지 않고, 지문에 제시되지 않은 정보를 추가 조사하거나 글쓴이가 제시한 해결방안의 대안을 생각해보는 등 능동적 태도로 공부하는 학생임."

3. **'퓨샷 예시' 모방 절대 금지:**
   * 제공되는 예시는 **오직 '스타일'과 '구조'를 참고**하기 위한 것이다.
   * 특정 어휘, 활동 주제, 문장 구조를 그대로 복사하거나 모방해서는 안 된다.

4. **'상투적 표현' 금지:**
   * '매우 우수한', '뛰어난', '놀라운' 등의 추상적 미사여구를 피한다.
   * **[대안]** 구체적인 행위와 근거로 서술한다.

---

❗️ **제 2원칙: 'A-M-A-R' 서사 구축 방법론**

사용자의 단편적인 입력을 다음 4단계의 논리적 서사로 발전시켜야 한다:

* **[Step 1: 활동 (Action)]** - 사용자가 제공한 핵심 활동으로 문단을 시작
* **[Step 2: 동기 (Motivation)]** - 이 활동을 하게 된 지적 호기심이나 문제의식을 추론하여 삽입 (희망 진로: ${studentInfo.desiredMajor}와 연결)
* **[Step 3: 심화 활동 (Advanced Action)]** - 호기심을 해결하기 위한 구체적 행동 서술
* **[Step 4: 깨달음 및 성장 (Realization)]** - 활동을 통해 배운 것과 진로 역량 연결

---

❗️ **제 3원칙: '진로별 융합 사고' 적용**

* 동일한 활동이라도, 희망 진로(${studentInfo.desiredMajor}, ${studentInfo.track})에 따라 **완전히 다른 서사와 의미**를 부여해야 한다.

---

**퓨샷 학습 예시 (스타일 참고용):**

${fewShotExamples}

---

**출력 형식:**
- 위의 원칙들을 100% 준수하여, 사용자 입력에만 기반해 새롭게 생성된 고품질 생기부 텍스트 (단일 문단)
- 반드시 교사의 관찰 어투로 작성
- 반드시 A-M-A-R 구조로 작성
- 200-300자 내외의 완성도 높은 텍스트`;

    return prompt;
  }

  /**
   * 생기부 텍스트 생성
   */
  async generateRecord(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const { studentInfo, activityInput, additionalContext } = request;

      // 1. 관련 퓨샷 예시 가져오기
      const relevantExamples = getRelevantExamples(
        studentInfo.track,
        studentInfo.grade,
        activityInput.sectionType,
        3
      );

      // 2. 퓨샷 예시 포맷팅
      const fewShotText = relevantExamples.map((ex, idx) => {
        return `[예시 ${idx + 1}] ${ex.styleDescription}\n${ex.exampleText}\n`;
      }).join('\n');

      // 3. 시스템 프롬프트 생성
      const systemPrompt = this.getSystemPrompt(studentInfo, fewShotText);

      // 4. 사용자 메시지 구성
      const userMessage = this.buildUserMessage(studentInfo, activityInput, additionalContext);

      console.log('=== 생기부 생성 요청 ===');
      console.log('학생:', studentInfo.name, studentInfo.grade + '학년', studentInfo.desiredMajor);
      console.log('활동 요약:', activityInput.activitySummary);
      console.log('사용된 퓨샷:', relevantExamples.length + '개');

      // 5. OpenAI API 호출
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const generatedText = response.choices[0].message.content?.trim() || '';

      // 6. 결과 구성
      const record: GeneratedRecord = {
        id: this.generateId(),
        studentInfo,
        activityInput,
        generatedText,
        confidence: 0.85,
        usedFewShots: relevantExamples.map(ex => ex.id),
        createdAt: new Date().toISOString()
      };

      console.log('생성 완료:', generatedText.substring(0, 100) + '...');

      return {
        success: true,
        record,
        suggestions: this.generateSuggestions(generatedText)
      };

    } catch (error) {
      console.error('생기부 생성 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 사용자 메시지 구성
   */
  private buildUserMessage(
    studentInfo: StudentInfo,
    activityInput: ActivityInput,
    additionalContext?: string
  ): string {
    let message = `**[학생 정보]**\n`;
    message += `- 이름: ${studentInfo.name}\n`;
    message += `- 학년: ${studentInfo.grade}학년\n`;
    message += `- 희망 진로/전공: ${studentInfo.desiredMajor}\n`;
    message += `- 계열: ${studentInfo.track}\n\n`;

    message += `**[작성 항목]**\n`;
    message += `- 섹션: ${activityInput.sectionType}`;
    if (activityInput.subject) {
      message += ` - ${activityInput.subject}`;
    }
    message += '\n\n';

    message += `**[학생의 활동 요약]**\n`;
    message += `${activityInput.activitySummary}\n\n`;

    if (additionalContext) {
      message += `**[추가 컨텍스트]**\n${additionalContext}\n\n`;
    }

    message += `**[생성 지침]**\n`;
    message += `위의 활동 요약을 바탕으로, ${studentInfo.desiredMajor} 진로와 연결하여 A-M-A-R 구조의 완성도 높은 생기부 텍스트를 생성하세요.\n`;
    message += `반드시 교사의 관찰 어투("~함.", "~임.", "~이 돋보임." 등)를 사용하고, 문장 길이를 불규칙하게 혼합하세요.`;

    return message;
  }

  /**
   * 개선 제안 생성
   */
  private generateSuggestions(generatedText: string): string[] {
    const suggestions: string[] = [];

    if (generatedText.length < 150) {
      suggestions.push('텍스트가 다소 짧습니다. 더 구체적인 활동 내용을 추가하면 좋습니다.');
    }

    if (!generatedText.includes('함.') && !generatedText.includes('임.')) {
      suggestions.push('교사의 관찰 어투("~함.", "~임.")가 부족합니다.');
    }

    if (generatedText.match(/매우|뛰어난|훌륭한|놀라운/)) {
      suggestions.push('상투적인 미사여구가 포함되어 있습니다. 더 구체적인 표현을 사용하세요.');
    }

    return suggestions;
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const schoolRecordGenerator = new SchoolRecordGenerator();
export default schoolRecordGenerator;
