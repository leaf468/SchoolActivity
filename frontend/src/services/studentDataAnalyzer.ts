/**
 * 학생 데이터 분석 서비스
 * 기존 생기부 텍스트, PDF, 추가 자료를 분석하여 새로운 생기부 작성에 활용
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface StudentDataInput {
  existingRecords?: string; // 기존 생기부 텍스트
  additionalMaterials?: string; // 학생이 가져온 추가 자료
  studentInfo?: {
    name: string;
    grade: number;
    desiredMajor?: string;
    track?: string;
  };
  sectionType?: string;
}

export interface AnalyzedStudentData {
  // 핵심 역량
  coreCompetencies: string[];
  // 주요 활동들
  keyActivities: {
    activity: string;
    role?: string;
    achievement?: string;
    learnings?: string;
  }[];
  // 진로 관련 키워드
  careerKeywords: string[];
  // 성격/행동 특성
  personalTraits: string[];
  // 학업 역량
  academicStrengths: string[];
  // 추천 강조점
  recommendedEmphasis: string[];
  // 전체 요약
  summary: string;
  // 새 생기부 작성 시 활용할 수 있는 문장들
  usablePhrases: string[];
}

export interface DataAnalysisResult {
  success: boolean;
  analysis?: AnalyzedStudentData;
  error?: string;
}

class StudentDataAnalyzer {
  /**
   * 기존 생기부 텍스트와 추가 자료를 분석합니다
   */
  async analyzeStudentData(input: StudentDataInput): Promise<DataAnalysisResult> {
    const { existingRecords, additionalMaterials, studentInfo, sectionType } = input;

    if (!existingRecords && !additionalMaterials) {
      return {
        success: false,
        error: '분석할 데이터가 없습니다. 기존 생기부 텍스트나 추가 자료를 입력해주세요.',
      };
    }

    const systemPrompt = `당신은 한국 고등학교 생활기록부 분석 전문가입니다.
학생의 기존 생기부 텍스트와 추가 자료를 분석하여 다음 정보를 추출해주세요:

1. 핵심 역량 (리더십, 문제해결력, 창의성, 협업능력, 자기주도성 등)
2. 주요 활동들 (활동명, 역할, 성과, 배운점)
3. 진로 관련 키워드 (학생의 진로 관심사를 보여주는 키워드)
4. 성격/행동 특성 (성격적 장점, 행동 특성)
5. 학업 역량 (수업 참여, 탐구력, 발표력 등)
6. 새 생기부 작성 시 추천할 강조점
7. 전체적인 학생 특성 요약
8. 새 생기부 작성 시 바로 활용할 수 있는 문장들

분석 결과는 정확한 JSON 형식으로 반환해주세요.`;

    const userPrompt = `다음 학생 데이터를 분석해주세요:

${studentInfo ? `[학생 정보]
- 이름: ${studentInfo.name}
- 학년: ${studentInfo.grade}학년
- 희망 진로: ${studentInfo.desiredMajor || '미정'}
- 계열: ${studentInfo.track || '미정'}
` : ''}

${sectionType ? `[작성 대상 영역]: ${sectionType === 'subject' ? '교과세특' :
  sectionType === 'autonomy' ? '자율활동' :
  sectionType === 'club' ? '동아리활동' :
  sectionType === 'career' ? '진로활동' :
  sectionType === 'behavior' ? '행동특성' : sectionType}
` : ''}

${existingRecords ? `[기존 생기부 기록]
${existingRecords}
` : ''}

${additionalMaterials ? `[추가 자료/메모]
${additionalMaterials}
` : ''}

위 내용을 분석하여 다음 JSON 구조로 결과를 반환해주세요:
{
  "coreCompetencies": ["역량1", "역량2", ...],
  "keyActivities": [
    { "activity": "활동명", "role": "역할", "achievement": "성과", "learnings": "배운점" },
    ...
  ],
  "careerKeywords": ["키워드1", "키워드2", ...],
  "personalTraits": ["특성1", "특성2", ...],
  "academicStrengths": ["강점1", "강점2", ...],
  "recommendedEmphasis": ["강조점1", "강조점2", ...],
  "summary": "전체 요약 (2-3문장)",
  "usablePhrases": ["활용 가능한 문장1", "활용 가능한 문장2", ...]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'AI 응답이 비어있습니다.' };
      }

      const analysis = JSON.parse(content) as AnalyzedStudentData;
      return { success: true, analysis };
    } catch (error) {
      console.error('학생 데이터 분석 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 분석된 데이터를 바탕으로 새로운 생기부 초안을 생성합니다
   */
  async generateRecordFromAnalysis(
    analysis: AnalyzedStudentData,
    sectionType: string,
    additionalContext?: string
  ): Promise<{ success: boolean; generatedText?: string; error?: string }> {
    const sectionName = sectionType === 'subject' ? '교과세특' :
      sectionType === 'autonomy' ? '자율활동' :
      sectionType === 'club' ? '동아리활동' :
      sectionType === 'career' ? '진로활동' :
      sectionType === 'behavior' ? '행동특성 및 종합의견' : sectionType;

    const systemPrompt = `당신은 한국 고등학교 생활기록부 작성 전문가입니다.
분석된 학생 데이터를 바탕으로 ${sectionName} 항목을 작성해주세요.

작성 규칙:
1. 교사 관찰 시점으로 작성 (3인칭, "~함", "~임" 종결)
2. 구체적인 활동과 성과를 포함
3. 학생의 역량과 성장을 드러내도록 작성
4. 진로와 연계된 내용 포함
5. 자연스럽고 인간미 있는 문체 유지
6. 500-700자 내외로 작성`;

    const userPrompt = `[분석된 학생 데이터]

핵심 역량: ${analysis.coreCompetencies.join(', ')}

주요 활동:
${analysis.keyActivities.map(a =>
  `- ${a.activity}${a.role ? ` (${a.role})` : ''}${a.achievement ? `: ${a.achievement}` : ''}`
).join('\n')}

진로 키워드: ${analysis.careerKeywords.join(', ')}
성격/행동 특성: ${analysis.personalTraits.join(', ')}
학업 강점: ${analysis.academicStrengths.join(', ')}
권장 강조점: ${analysis.recommendedEmphasis.join(', ')}

전체 요약: ${analysis.summary}

활용 가능 문장:
${analysis.usablePhrases.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${additionalContext ? `\n[추가 지시사항]\n${additionalContext}` : ''}

위 내용을 바탕으로 ${sectionName} 항목을 작성해주세요.`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'AI 응답이 비어있습니다.' };
      }

      return { success: true, generatedText: content };
    } catch (error) {
      console.error('생기부 생성 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * PDF 텍스트에서 섹션별로 생기부 내용을 추출합니다
   */
  extractSectionsFromText(text: string): Record<string, string> {
    const sections: Record<string, string> = {};

    // 일반적인 생기부 섹션 패턴
    const patterns = [
      { key: 'subject', regex: /교과[세\s]*특|교과학습발달상황|세부능력\s*및\s*특기사항/gi },
      { key: 'autonomy', regex: /자율활동|자율[활\s]*동/gi },
      { key: 'club', regex: /동아리활동|동아리[활\s]*동/gi },
      { key: 'career', regex: /진로활동|진로[활\s]*동/gi },
      { key: 'behavior', regex: /행동특성|행동[특\s]*성|종합의견/gi },
      { key: 'service', regex: /봉사활동|봉사[활\s]*동/gi },
    ];

    // 간단한 섹션 추출 (실제 구현에서는 더 정교한 파싱 필요)
    let currentSection = '';
    const lines = text.split('\n');

    for (const line of lines) {
      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          currentSection = pattern.key;
          break;
        }
      }

      if (currentSection && line.trim()) {
        sections[currentSection] = (sections[currentSection] || '') + line + '\n';
      }
    }

    return sections;
  }
}

export const studentDataAnalyzer = new StudentDataAnalyzer();
