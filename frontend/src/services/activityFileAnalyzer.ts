/**
 * 학생 활동 파일 분석 서비스
 * 소논문, 포트폴리오, 심화활동 보고서 등을 분석하여 생기부 작성에 활용
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ActivityFile {
  id: string;
  file: File;
  studentId?: string;
  studentName?: string;
  fileType: 'essay' | 'portfolio' | 'report' | 'presentation' | 'other';
  textContent?: string;
  status: 'pending' | 'extracting' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

export interface FileAnalysisResult {
  // 파일 기본 정보
  fileId: string;
  fileName: string;
  fileType: string;

  // 분석된 핵심 내용
  mainTopic: string;
  subTopics: string[];
  keyFindings: string[];
  methodology?: string;

  // 역량 분석
  demonstratedCompetencies: {
    competency: string;
    evidence: string;
    level: 'basic' | 'intermediate' | 'advanced';
  }[];

  // 과목/진로 연관성
  subjectRelevance: {
    subject: string;
    relevanceScore: number; // 0-100
    connectionPoints: string[];
  }[];

  careerRelevance: {
    career: string;
    relevanceScore: number;
    connectionPoints: string[];
  }[];

  // 생기부 작성용 추천 문구
  recommendedPhrases: {
    category: 'activity' | 'competency' | 'achievement' | 'growth';
    phrase: string;
    emphasis: string[];
  }[];

  // 작성 옵션들
  writingOptions: {
    style: 'formal' | 'descriptive' | 'achievement-focused';
    draft: string;
    characterCount: number;
    highlights: string[];
  }[];

  // 전체 요약
  summary: string;
}

export interface BulkFileMapping {
  studentName: string;
  studentId?: string;
  files: ActivityFile[];
  analysisResults?: FileAnalysisResult[];
}

class ActivityFileAnalyzer {
  /**
   * PDF 파일에서 텍스트 추출 (브라우저 환경)
   * 실제 구현에서는 pdf.js 등 사용 필요
   */
  async extractTextFromFile(file: File): Promise<string> {
    // 텍스트 파일인 경우
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await file.text();
    }

    // PDF의 경우 - 실제로는 pdf.js 라이브러리 사용 필요
    // 여기서는 사용자가 텍스트를 직접 붙여넣기하는 방식을 권장
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // PDF 텍스트 추출은 별도 처리 필요
      // 임시로 파일명 정보만 반환
      return `[PDF 파일: ${file.name}]\n\n파일 내용을 직접 텍스트로 입력해주세요.`;
    }

    // DOCX 등 다른 형식
    return `[${file.name}]\n\n파일 내용을 직접 텍스트로 입력해주세요.`;
  }

  /**
   * 파일 유형 자동 감지
   */
  detectFileType(fileName: string, content?: string): ActivityFile['fileType'] {
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('논문') || lowerName.includes('소논문') || lowerName.includes('essay')) {
      return 'essay';
    }
    if (lowerName.includes('포트폴리오') || lowerName.includes('portfolio')) {
      return 'portfolio';
    }
    if (lowerName.includes('보고서') || lowerName.includes('report') || lowerName.includes('탐구')) {
      return 'report';
    }
    if (lowerName.includes('발표') || lowerName.includes('ppt') || lowerName.includes('presentation')) {
      return 'presentation';
    }

    // 내용 기반 추론
    if (content) {
      if (content.includes('서론') && content.includes('결론')) return 'essay';
      if (content.includes('목차') || content.includes('프로젝트')) return 'portfolio';
      if (content.includes('실험') || content.includes('분석')) return 'report';
    }

    return 'other';
  }

  /**
   * 단일 파일 분석
   */
  async analyzeFile(
    file: ActivityFile,
    context: {
      sectionType: string;
      subject?: string;
      desiredMajor?: string;
      track?: string;
    }
  ): Promise<FileAnalysisResult> {
    const textContent = file.textContent || await this.extractTextFromFile(file.file);

    const sectionName = context.sectionType === 'subject' ? `${context.subject || ''} 교과세특` :
      context.sectionType === 'autonomy' ? '자율활동' :
      context.sectionType === 'club' ? '동아리활동' :
      context.sectionType === 'career' ? '진로활동' : '행동특성';

    const systemPrompt = `당신은 한국 고등학교 생활기록부 작성을 위한 학생 활동 자료 분석 전문가입니다.
학생이 작성한 소논문, 포트폴리오, 보고서 등의 활동 자료를 분석하여 생기부 ${sectionName} 작성에 활용할 수 있는 정보를 추출합니다.

분석 시 다음을 고려하세요:
1. 학생의 탐구 주제와 깊이
2. 문제 해결 과정과 방법론
3. 드러난 역량과 성장
4. ${context.desiredMajor ? `희망 진로(${context.desiredMajor})와의 연관성` : '진로 관련성'}
5. 생기부에 활용할 수 있는 구체적 문구

결과는 JSON 형식으로 반환해주세요.`;

    const userPrompt = `다음 학생 활동 자료를 분석해주세요:

[파일 정보]
- 파일명: ${file.file.name}
- 파일 유형: ${file.fileType === 'essay' ? '소논문' :
  file.fileType === 'portfolio' ? '포트폴리오' :
  file.fileType === 'report' ? '탐구보고서' :
  file.fileType === 'presentation' ? '발표자료' : '기타'}

[작성 대상]
- 영역: ${sectionName}
${context.subject ? `- 과목: ${context.subject}` : ''}
${context.desiredMajor ? `- 희망 진로: ${context.desiredMajor}` : ''}
${context.track ? `- 계열: ${context.track}` : ''}

[파일 내용]
${textContent.slice(0, 6000)}
${textContent.length > 6000 ? '\n...(내용 생략)...' : ''}

다음 JSON 구조로 분석 결과를 반환해주세요:
{
  "mainTopic": "핵심 주제",
  "subTopics": ["세부 주제1", "세부 주제2"],
  "keyFindings": ["주요 발견/성과1", "주요 발견/성과2"],
  "methodology": "탐구/분석 방법",
  "demonstratedCompetencies": [
    { "competency": "역량명", "evidence": "근거", "level": "basic/intermediate/advanced" }
  ],
  "subjectRelevance": [
    { "subject": "관련 과목", "relevanceScore": 85, "connectionPoints": ["연결점1"] }
  ],
  "careerRelevance": [
    { "career": "관련 진로", "relevanceScore": 90, "connectionPoints": ["연결점1"] }
  ],
  "recommendedPhrases": [
    { "category": "activity/competency/achievement/growth", "phrase": "추천 문구", "emphasis": ["강조 키워드"] }
  ],
  "writingOptions": [
    { "style": "formal/descriptive/achievement-focused", "draft": "생기부 초안 (500자 내외)", "characterCount": 500, "highlights": ["핵심 포인트"] }
  ],
  "summary": "전체 분석 요약"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      const analysis = JSON.parse(content);

      return {
        fileId: file.id,
        fileName: file.file.name,
        fileType: file.fileType,
        ...analysis,
      };
    } catch (error) {
      console.error('파일 분석 오류:', error);
      throw error;
    }
  }

  /**
   * 여러 파일을 종합 분석하여 생기부 초안 생성
   */
  async generateRecordFromFiles(
    analysisResults: FileAnalysisResult[],
    context: {
      studentName: string;
      sectionType: string;
      subject?: string;
      desiredMajor?: string;
      maxCharacters?: number;
    }
  ): Promise<{
    drafts: { style: string; content: string; focus: string }[];
    combinedInsights: string;
  }> {
    const sectionName = context.sectionType === 'subject' ? `${context.subject || ''} 교과세특` :
      context.sectionType === 'autonomy' ? '자율활동' :
      context.sectionType === 'club' ? '동아리활동' :
      context.sectionType === 'career' ? '진로활동' : '행동특성';

    // 분석 결과 종합
    const allTopics = analysisResults.flatMap(r => [r.mainTopic, ...r.subTopics]);
    const allCompetencies = analysisResults.flatMap(r => r.demonstratedCompetencies);
    const allPhrases = analysisResults.flatMap(r => r.recommendedPhrases);
    const allOptions = analysisResults.flatMap(r => r.writingOptions);

    const systemPrompt = `당신은 한국 고등학교 생활기록부 작성 전문가입니다.
여러 활동 자료의 분석 결과를 종합하여 ${sectionName} 항목을 작성합니다.

작성 규칙:
1. 교사 관찰 시점으로 작성 ("~함", "~임" 종결)
2. 구체적인 활동과 성과 포함
3. 학생의 역량과 성장 드러내기
4. ${context.desiredMajor ? `${context.desiredMajor} 진로와 연계` : '진로 연계'}
5. ${context.maxCharacters || 500}자 내외로 작성
6. 3가지 스타일(공식적/서술적/성과중심)로 각각 작성`;

    const userPrompt = `[학생 정보]
- 이름: ${context.studentName}
- 작성 영역: ${sectionName}
${context.desiredMajor ? `- 희망 진로: ${context.desiredMajor}` : ''}

[분석된 주제들]
${allTopics.slice(0, 10).join(', ')}

[드러난 역량]
${allCompetencies.slice(0, 8).map(c => `- ${c.competency}: ${c.evidence}`).join('\n')}

[추천 문구들]
${allPhrases.slice(0, 10).map(p => `- [${p.category}] ${p.phrase}`).join('\n')}

[기존 작성 옵션들]
${allOptions.slice(0, 3).map(o => `[${o.style}] ${o.draft.slice(0, 200)}...`).join('\n\n')}

위 내용을 종합하여 3가지 스타일의 생기부 초안을 JSON으로 작성해주세요:
{
  "drafts": [
    { "style": "formal", "content": "공식적 스타일 초안", "focus": "강조점" },
    { "style": "descriptive", "content": "서술적 스타일 초안", "focus": "강조점" },
    { "style": "achievement", "content": "성과 중심 초안", "focus": "강조점" }
  ],
  "combinedInsights": "종합 분석 인사이트"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('생기부 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 과목/진로/동아리와의 연관성 분석
   */
  async analyzeRelevance(
    fileContent: string,
    targetContext: {
      type: 'subject' | 'career' | 'club';
      name: string;
      description?: string;
    }
  ): Promise<{
    relevanceScore: number;
    connectionPoints: string[];
    suggestedAngles: string[];
    warningPoints: string[];
  }> {
    const contextType = targetContext.type === 'subject' ? '과목' :
      targetContext.type === 'career' ? '진로' : '동아리';

    const prompt = `다음 활동 내용이 "${targetContext.name}" ${contextType}과 얼마나 연관되는지 분석해주세요.

[활동 내용]
${fileContent.slice(0, 3000)}

[대상 ${contextType}]
- 이름: ${targetContext.name}
${targetContext.description ? `- 설명: ${targetContext.description}` : ''}

JSON으로 응답:
{
  "relevanceScore": 0-100 점수,
  "connectionPoints": ["연결점1", "연결점2"],
  "suggestedAngles": ["이 각도로 서술하면 좋겠다는 제안"],
  "warningPoints": ["주의해야 할 점"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('연관성 분석 오류:', error);
      throw error;
    }
  }
}

export const activityFileAnalyzer = new ActivityFileAnalyzer();
