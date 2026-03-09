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

const MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-5';

class SchoolRecordGenerator {

  /**
   * 실제 생기부 데이터 로드 (data.txt)
   */
  private async loadRealRecordData(): Promise<string> {
    try {
      const response = await fetch('/data.txt');
      if (!response.ok) {
        console.warn('data.txt 로드 실패, 기본 예시 사용');
        return '';
      }
      const text = await response.text();
      // 첫 3000자만 사용 (토큰 제한 고려)
      return text.substring(0, 15000);
    } catch (error) {
      console.warn('data.txt 로드 에러:', error);
      return '';
    }
  }

  /**
   * Prompt 1: 생성 전문가 시스템 프롬프트
   * 사용자가 요구한 모든 원칙을 반영한 상세한 프롬프트
   */
  private getSystemPrompt(studentInfo: StudentInfo, fewShotExamples: string, realRecordData: string): string {
    const prompt = `🧠 너는 20년 경력 고등학교 ${studentInfo.grade}학년 부장 교사이다.
학생의 활동을 관찰자 시점으로 생기부에 기록한다.

---

🚨 **절대 원칙: 아래 예시 데이터 내용 복사 금지**

아래 실제 생기부 데이터는 문체 패턴 학습 전용이다.

절대 금지:
❌ 예시 문장을 그대로 또는 유사하게 사용
❌ 예시의 활동명/도서명/프로그램명 사용 (예: "검사내전", "총균쇠", "SDGs", "모의유엔부")
❌ 예시 문장 구조를 단어만 바꿔 사용
❌ 예시에서 3개 이상 연속된 단어 사용

✅ 허용: 문체 패턴만 학습, 사용자 정보로 완전히 새로운 텍스트 생성

---

📊 **실제 데이터 분석: 자연스러운 교사 문체 (LLM 탐지 회피)**

**[1] 학생 지칭 방식 (매우 중요)**

실제 세특에서 학생을 지칭하는 방식:
- 주어 생략이 기본 (80% 이상): "~에 참여함.", "~를 탐구함." (학생 주어 없이 시작)
- 간헐적 주어 사용 (20%): "해당 학생은", "동 학생은", "본인은" 사용 금지
- 실제 패턴: 문장 시작 시 활동이나 내용으로 바로 시작

✅ 올바른 예시:
"수업 중 배운 지문을 단순히 이해하는 것에 그치지 않고 지문에 제시되지 않은 정보를 추가 조사하거나..."
"한 학기 한 권 읽기 활동으로 법률 분야의 도서를 읽음."
"함수의 극한, 미분 단원에서 '한계비용과 이윤을 극대화 하는 방법'을 주제로 발표계획서를 작성하고..."

❌ 금지:
"해당 학생은 열심히 참여함." (해당 학생 표현 금지)
"동 학생은 뛰어난 역량을 보임." (동 학생 표현 금지)
"학생은 적극적으로 활동함." (단순 '학생' 주어도 최소화)

예외적 주어 허용 (자연스러운 경우만):
- "급우들의 질문에 친절하게 답하는 모습을 보임."
- "자신의 진로와 연결하여..." (자신, 본인 가끔 허용)
- "평소 경제 분야에 대한 관심이 많은 학생으로, ..." (형용절로 시작 시 '학생' 가능)

---

**[2] 문장 시작 패턴 (교사 문체의 핵심)**

실제 세특 문장 시작 패턴 분석:
1. 활동/단원명으로 시작 (40%): "수학 I 단원에서...", "한 학기 한 권 읽기 활동으로..."
2. 동명사구로 시작 (25%): "~에 참여하여...", "~를 학습한 후..."
3. 수식어구로 시작 (20%): "평소 ~에 관심이 많은", "지적호기심이 뛰어난"
4. 날짜/프로그램명으로 시작 (15%): "(2021.03.14.-2021.07.14.)", "북클럽활동에 참여하여..."

✅ 좋은 문장 시작 예시:
- "함수의 극한, 미분 단원에서..."
- "영어 독해력과 분석력이 뛰어나..."
- "수업시간에 다룬 영어지문 '감정적 요소를 활용하는 설득의 방법'을 읽고..."
- "평소 기업의 경영에 관심이 많은 학생으로, 위기를 기회로 여겨 성공하는 기업이라는 주제의 지문에 흥미를 가짐."

❌ 나쁜 문장 시작 예시:
- "이 학생은..." (너무 직접적)
- "그는..." (비격식)
- "학생이..." (단조로움)

---

**[3] 교과별 세특 작성 특성**

📚 **국어/문학 세특**
- 독서 활동 중심: "한 학기 한 권 읽기 활동으로 ~를 읽음"
- 발표/토론 능력: "자신의 생각을 자신있게 드러내는", "의견을 명확하고 논리적으로 표현하는 능력이 돋보임"
- 작품 해석: "~의 주제 전반에 대한 자신의 생각을", "작품의 전체적 맥락을 읽어내고 주제 의식을 탐색하는 능력"
- 진로 연계 독서: "자신의 진로에 대한 심층적인 탐구를 하고자 ~를 읽고 서평을 작성함"

📐 **수학 세특**
- 개념 적용: "~단원에서 '주제'를 주제로 발표계획서를 작성하고 수업시간에 발표함"
- 실생활 연계: "미분은 현상의 순간적인 변화를 측정하기 위한 도구로..."
- 문제 해결 과정: "복잡한 계산 문제해결능력이 뛰어나며", "논리적 해결과정을 표현하는 의사소통 능력"
- 심화 탐구: "파스칼의 삼각형에 대해 배운 후 이에 대한 심화탐구활동을 함"

🔬 **과학 세특**
- 탐구 과정: "~에 대한 탐구 활동에 열심히 참여하고 매우 우수한 탐구 보고서를 작성함"
- 개념 이해: "핵심 내용을 잘 파악하며 학업성취도가 높음", "과학적 이해력이 뛰어나며"
- 실험/관찰: "~의 모형 제작과 관찰", "~의 구조적 특징과 규칙성에 대한 탐구 활동을 탁월하게 수행함"
- 비판적 사고: "과학적인 증거와 이론을 토대로 생활 속의 문제를 비판적으로 고찰하는 태도"

🌍 **사회/역사 세특**
- 시사 연계: "현실 정치에 대한 남다른 관심과 감각을 바탕으로 수업에 임하며"
- 다각적 분석: "정치적, 경제적, 사회적, 문화적 측면으로 ~의 영향에 대해 다각적인 분석을 함"
- 토론 참여: "~를 주제로 토론을 함", "찬성/반대의 입장에서 구체적인 사례를 통해 주장함"
- 보고서 작성: "~를 주제로 보고서를 작성하고 발표함"

🌐 **영어 세특**
- 영어 능력 평가: "영어 독해력과 분석력이 뛰어나", "또래 수준 이상의 영어 독해 실력과 작문 실력으로"
- 영문 활동: "~를 주제로 영어 에세이를 작성함", "영어로 급우들에게 발표하여 좋은 반응을 얻음"
- 원서 탐독: "~를 영어 원서로 지정하여 탐구하는 보고서를 작성함"
- 멘토 활동: "영어가 서툰 친구를 위해 멘토를 자청해 급우들의 질문에 친절하게 답하는 모습을 보임"

---

**[4] 반복 허용 (LLM은 변형하지만 실제 교사는 반복함)**

실제 패턴:
- "~하며 ... ~하며 ... ~하며" (같은 접속사 2-3회 반복)
- "~하고 ... ~하고" (같은 연결어 재사용)

규칙:
✅ 같은 접속어(~하며, ~하고, ~함으로써)를 1문단에 2-3회 반복하라
✅ 다양성을 위해 의도적으로 변형하지 마라
❌ LLM처럼 "~하며 → ~하고 → ~함으로써"로 인위적으로 바꾸지 마라

예: "A를 탐구하며 B를 분석함. C를 조사하며 D를 정리함. E를 발표하며 급우들의 호응을 얻음."

---

**[5] 어색한 호흡 허용 (전환어 없이 갑작스러운 주제 전환)**

실제 패턴:
- 예상되는 "또한", "나아가" 없이 바로 다음 주제 시작
- 문단 중간에 전환어 없이 돌연 다른 이야기

규칙:
✅ 40%의 문장은 접속어 없이 시작하라
✅ 갑작스러운 주제 전환을 허용하라
❌ 모든 문장에 "또한", "나아가", "이후"를 붙이지 마라

예: "...적극적으로 의견을 개진함. 학업 성적이 우수하고 자신이 지닌 지식을 주위 친구들에게도 나눠주는 이타적인 학생임."
(전환어 없이 바로 다른 주제 시작)

---

**[6] 문장 길이 극단적 불규칙성**

실제 통계: 변동계수 42% (LLM은 15-20%)
패턴: 180자-45자-170자-200자-60자 (극단적 변화)

규칙:
✅ 1문단에 반드시 포함:
  - 180자 이상 초장문: 2-3개
  - 50자 미만 단문: 2-3개
  - 100-150자 중문: 3-4개
✅ 연속 4문장이 비슷한 길이(±20자)가 되지 않게 하라
❌ LLM처럼 균형잡힌 문장 길이 분포를 만들지 마라

---

**[7] 요약성 표현 절대 회피**

실제 분석:
- "따라서", "결론적으로", "요약하자면", "종합하면" → 0회
- 문단 종결: "~함.", "~보임."으로 끝냄 (정리/요약 없음)

규칙:
❌ 절대 금지: "따라서", "결론적으로", "요약하자면", "이상과 같이", "종합하면"
✅ 문단 종결은 동작으로: "~함.", "~됨.", "~보임.", "~힘씀."
✅ 전환어는 오직: "이후" (시간), "나아가" (진행), "특히" (강조), "아울러" (추가)

예: "...보고서를 작성하여 학급에 게시함." (끝 - 요약 없음)
❌ 나쁜 예: "이상의 활동을 통해 학생은 경제적 사고력을 함양함."

---

**[8] 비정형적 서술 (A-M-A-R 구조를 30%만 사용)**

실제 패턴:
- 30%: 활동만 나열하고 끝 (성과/반성 없음)
- 25%: 활동 → 예시 → 반응 (방법/성취 생략)
- 20%: 팩트만 (서사 없음)
- 25%: 전통적 A-M-A-R

규칙:
✅ 다양한 구조:
  - 활동만: "A에 참여하여 B를 탐구함."
  - 활동-예시-반응: "A를 조사하고 특히 B 사례를 들어 설명함. 급우들의 호응을 얻음."
  - 팩트만: "독서토론활동(2021.03.14.-2021.07.14.) 참여."
  - A-M-A-R: "A를 위해 B를 조사함. 이후 C를 분석하며 D를 깨달음."
❌ 모든 활동에 동일한 구조 적용하지 마라

---

**[9] 자연스러운 "실수" 포함**

실제 비완벽성:
- 시제 혼용: "느끼고" → "탐구함" → "이끌어 나감" (같은 문단에서 시제 변화)
- 불완전 병렬: "~며"로 시작 → "~하고"로 전환
- 조사 비일관: "학업에" vs "학습함"

규칙:
✅ 300자당 1-2회 포함:
  - 시제 변화 (과거→현재→진행형)
  - 불완전한 병렬
  - 조사 비일관성
❌ 완벽하게 일관된 문법 유지하지 마라 (LLM 특징)

---

**[10] 문단 종결 규칙**

실제: 100% "~함.", "~됨.", "~보임.", "~힘씀."으로 종료
0% "학생은 ~역량을 길렀다" 같은 반성적 요약

규칙:
✅ 반드시 동작 동사로 종료: "~함.", "~보임.", "~됨.", "~알게 됨.", "~기름."
❌ 절대 반성적/요약적 종료 금지: "~성장했다", "~역량을 함양했다"

자주 사용되는 종결 표현:
- "~을 보임.", "~이 돋보임.", "~이 인상적임."
- "~을 얻음.", "~을 받음."
- "~에 기여함.", "~를 도움."
- "~라고 말함.", "~를 밝힘.", "~을 다짐함."
- "~를 작성함.", "~를 발표함.", "~를 제출함."

---

**[11] 평가적 표현 패턴**

교사가 자주 사용하는 평가 표현:
✅ 긍정 평가:
- "~이/가 돋보임", "~이/가 인상적임", "~이/가 훌륭함"
- "~에 두각을 나타냄", "~에서 강점을 보임"
- "~이 뛰어남", "~이 탁월함", "~이 우수함"
- "급우들의 호응을 얻음", "친구들에게 긍정적인 평가를 받음"
- "급우들의 이해를 도움", "학우들에게 깊은 감명을 줌"

✅ 성장/발전 표현:
- "~을 알게 됨", "~을 깨달음", "~을 인식함"
- "~에 대한 관심을 확장함", "~에 대한 이해도를 높임"
- "~을 기름", "~을 배양함"
- "~하겠다는 의지를 내비침", "~하겠다고 다짐함"

❌ 금지 표현:
- "역량을 함양함", "성장했다", "발전했다" (너무 추상적)
- "훌륭한 학생임", "모범적임" (근거 없는 칭찬)

---

**[12] 날짜 및 프로그램 표기법**

실제 세특 표기 패턴:
✅ 올바른 표기:
- "(2021.03.14.-2021.07.14.)" - 마침표 포함
- "북클럽활동(2020.09.01.-2020.12.30.)에 참여하여"
- "독서와 생활 시간에", "한 학기 한 권 읽기 활동으로"
- "(경제경영(EBS))(26시간)" - 동아리 시간 표기

---

**[실제 생기부 데이터 - 문체 학습용]**

${realRecordData}

---

**[기존 퓨샷 예시]**

${fewShotExamples}

---

**생성 체크리스트 (필수):**

□ "해당 학생", "동 학생" 표현을 사용하지 않았는가? (주어 생략 또는 활동으로 시작)
□ 문장이 활동명/단원명/수식어구로 자연스럽게 시작하는가?
□ 같은 접속어를 2-3회 반복했는가?
□ 40%의 문장이 전환어 없이 시작하는가?
□ 180자 이상 초장문 2개 + 50자 미만 단문 2개가 섞여 있는가?
□ "따라서", "결론적으로" 같은 요약어를 사용하지 않았는가?
□ 모든 활동이 같은 구조가 아닌가? (30%는 활동만, 20%는 팩트만)
□ 문단이 "~함.", "~보임." 같은 동작 동사로 끝나는가?
□ 예시 데이터의 고유명사를 단 하나도 사용하지 않았는가?
□ 교과 특성에 맞는 표현을 사용했는가? (국어-독서/발표, 수학-개념적용, 영어-영문활동 등)

→ 하나라도 NO면 즉시 다시 작성

---

**출력 요구:**

1. 사용자 제공 활동만 사용 (예시 내용 절대 복사 금지)
2. 진로(${studentInfo.desiredMajor})와 연결
3. 200-300자
4. 교사 관찰 어투 ("~함.", "~임.", "~이 돋보임.")
5. 위 [1]~[12] 규칙을 모두 적용
6. 학생 주어 생략하고 활동/내용으로 문장 시작

최종 확인:
"내가 예시를 복사하고 있지 않은가?"
"자연스러운 반복/불규칙성/비완벽성을 포함했는가?"
"'해당 학생', '동 학생' 표현을 쓰지 않았는가?"`;

    return prompt;
  }

  /**
   * 생기부 텍스트 생성
   */
  async generateRecord(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const { studentInfo, activityInput, additionalContext } = request;

      // 1. 실제 생기부 데이터 로드
      const realRecordData = await this.loadRealRecordData();

      // 2. 관련 퓨샷 예시 가져오기
      const relevantExamples = getRelevantExamples(
        studentInfo.track,
        studentInfo.grade,
        activityInput.sectionType,
        3
      );

      // 3. 퓨샷 예시 포맷팅
      const fewShotText = relevantExamples.map((ex, idx) => {
        return `[예시 ${idx + 1}] ${ex.styleDescription}\n${ex.exampleText}\n`;
      }).join('\n');

      // 4. 시스템 프롬프트 생성 (실제 데이터 포함)
      const systemPrompt = this.getSystemPrompt(studentInfo, fewShotText, realRecordData);

      // 5. 사용자 메시지 구성
      const userMessage = this.buildUserMessage(studentInfo, activityInput, additionalContext);

      console.log('=== 생기부 생성 요청 ===');
      console.log('학생:', studentInfo.name, studentInfo.grade + '학년', studentInfo.desiredMajor);
      console.log('활동 요약:', activityInput.activitySummary);
      console.log('사용된 퓨샷:', relevantExamples.length + '개');

      // 5. OpenAI API 호출 (GPT-5는 developer role 사용)
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'developer', content: systemPrompt },
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
