import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import {
  activityFileAnalyzer,
  ActivityFile,
  FileAnalysisResult,
} from '../services/activityFileAnalyzer';

interface StudentActivityFilePanelProps {
  studentName: string;
  studentId?: string;
  sectionType: string;
  subject?: string;
  desiredMajor?: string;
  track?: string;
  onSelectDraft?: (draft: string) => void;
  onAnalysisComplete?: (results: FileAnalysisResult[]) => void;
}

const StudentActivityFilePanel: React.FC<StudentActivityFilePanelProps> = ({
  studentName,
  studentId,
  sectionType,
  subject,
  desiredMajor,
  track,
  onSelectDraft,
  onAnalysisComplete,
}) => {
  const [files, setFiles] = useState<ActivityFile[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<FileAnalysisResult[]>([]);
  const [generatedDrafts, setGeneratedDrafts] = useState<{ style: string; content: string; focus: string }[]>([]);
  const [combinedInsights, setCombinedInsights] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'results' | 'drafts'>('upload');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const newFiles: ActivityFile[] = Array.from(uploadedFiles).map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      studentId,
      studentName,
      fileType: activityFileAnalyzer.detectFileType(file.name),
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [studentId, studentName]);

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) return;

    const textFile: ActivityFile = {
      id: `text_${Date.now()}`,
      file: new File([textInput], `${studentName}_활동내용.txt`, { type: 'text/plain' }),
      studentId,
      studentName,
      fileType: activityFileAnalyzer.detectFileType('활동보고서', textInput),
      textContent: textInput,
      status: 'pending',
    };

    setFiles(prev => [...prev, textFile]);
    setTextInput('');
  }, [textInput, studentId, studentName]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setAnalysisResults(prev => prev.filter(r => r.fileId !== fileId));
  }, []);

  const analyzeAllFiles = useCallback(async () => {
    if (files.length === 0) {
      setError('분석할 파일을 추가해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    const results: FileAnalysisResult[] = [];

    // 각 파일 분석
    for (const file of files) {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'analyzing' as const } : f
      ));

      try {
        // 텍스트 내용이 없으면 추출
        if (!file.textContent) {
          const extracted = await activityFileAnalyzer.extractTextFromFile(file.file);
          file.textContent = extracted;
        }

        const result = await activityFileAnalyzer.analyzeFile(file, {
          sectionType,
          subject,
          desiredMajor,
          track,
        });

        results.push(result);

        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'complete' as const } : f
        ));
      } catch (err) {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'error' as const, error: '분석 실패' } : f
        ));
      }
    }

    setAnalysisResults(results);
    onAnalysisComplete?.(results);

    // 종합 초안 생성
    if (results.length > 0) {
      try {
        const combined = await activityFileAnalyzer.generateRecordFromFiles(results, {
          studentName,
          sectionType,
          subject,
          desiredMajor,
          maxCharacters: 500,
        });

        setGeneratedDrafts(combined.drafts);
        setCombinedInsights(combined.combinedInsights);
        setActiveTab('drafts');
      } catch (err) {
        console.error('초안 생성 오류:', err);
      }
    }

    setIsAnalyzing(false);
  }, [files, sectionType, subject, desiredMajor, track, studentName, onAnalysisComplete]);

  const handleSelectDraft = useCallback((draft: string) => {
    onSelectDraft?.(draft);
  }, [onSelectDraft]);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  }, []);

  const getSectionName = () => {
    switch (sectionType) {
      case 'subject': return `${subject || ''} 교과세특`;
      case 'autonomy': return '자율활동';
      case 'club': return '동아리활동';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return '생기부';
    }
  };

  const getFileTypeIcon = (type: ActivityFile['fileType']) => {
    switch (type) {
      case 'essay': return '📝';
      case 'portfolio': return '📁';
      case 'report': return '📊';
      case 'presentation': return '📽️';
      default: return '📄';
    }
  };

  const getFileTypeName = (type: ActivityFile['fileType']) => {
    switch (type) {
      case 'essay': return '소논문';
      case 'portfolio': return '포트폴리오';
      case 'report': return '탐구보고서';
      case 'presentation': return '발표자료';
      default: return '기타';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">활동 자료 분석</h3>
            <p className="text-sm text-gray-500">{studentName}님의 소논문, 포트폴리오 등 분석</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-gray-100 text-sm">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2.5 px-3 font-semibold transition-all ${
            activeTab === 'upload'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          📁 파일 업로드
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 px-3 font-semibold transition-all ${
            activeTab === 'text'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          📝 텍스트 입력
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={analysisResults.length === 0}
          className={`flex-1 py-2.5 px-3 font-semibold transition-all ${
            activeTab === 'results'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
              : analysisResults.length > 0
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          📊 분석 결과
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          disabled={generatedDrafts.length === 0}
          className={`flex-1 py-2.5 px-3 font-semibold transition-all ${
            activeTab === 'drafts'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
              : generatedDrafts.length > 0
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          ✨ 초안 선택
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-rose-400 hover:bg-rose-50/30 transition-all">
                <input
                  type="file"
                  id="activity-file-upload"
                  multiple
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="activity-file-upload" className="cursor-pointer">
                  <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold mb-1">활동 자료 업로드</p>
                  <p className="text-sm text-gray-500">소논문, 포트폴리오, 탐구보고서 등</p>
                  <p className="text-xs text-gray-400 mt-2">PDF, TXT, DOCX 지원</p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">업로드된 파일 ({files.length})</p>
                  {files.map(file => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                        file.status === 'complete'
                          ? 'border-green-300 bg-green-50'
                          : file.status === 'analyzing'
                          ? 'border-yellow-300 bg-yellow-50'
                          : file.status === 'error'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileTypeIcon(file.fileType)}</span>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{file.file.name}</p>
                          <p className="text-xs text-gray-500">{getFileTypeName(file.fileType)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'analyzing' && (
                          <ArrowPathIcon className="w-5 h-5 text-yellow-600 animate-spin" />
                        )}
                        {file.status === 'complete' && (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analyze Button */}
              {files.length > 0 && (
                <button
                  onClick={analyzeAllFiles}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      분석 중...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      AI로 분석하기
                    </span>
                  )}
                </button>
              )}
            </motion.div>
          )}

          {/* Text Input Tab */}
          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 내용 직접 입력
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="학생의 소논문, 탐구보고서, 활동 내용 등을 붙여넣으세요...&#10;&#10;예시:&#10;- 소논문 전문&#10;- 탐구 주제 및 과정&#10;- 프로젝트 결과물 설명"
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none text-sm"
                />
              </div>

              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                내용 추가하기
              </button>
            </motion.div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && analysisResults.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
            >
              {analysisResults.map((result) => (
                <div key={result.fileId} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Result Header */}
                  <button
                    onClick={() => setExpandedResult(expandedResult === result.fileId ? null : result.fileId)}
                    className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getFileTypeIcon(result.fileType as ActivityFile['fileType'])}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{result.fileName}</p>
                        <p className="text-sm text-gray-500">{result.mainTopic}</p>
                      </div>
                    </div>
                    {expandedResult === result.fileId ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedResult === result.fileId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4 border-t-2 border-gray-100"
                      >
                        {/* Key Findings */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">📌 주요 발견</p>
                          <ul className="space-y-1">
                            {result.keyFindings.map((finding, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Competencies */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">💪 드러난 역량</p>
                          <div className="flex flex-wrap gap-2">
                            {result.demonstratedCompetencies.map((comp, i) => (
                              <span
                                key={i}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  comp.level === 'advanced'
                                    ? 'bg-purple-100 text-purple-700'
                                    : comp.level === 'intermediate'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {comp.competency}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Relevance */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Subject Relevance */}
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AcademicCapIcon className="w-4 h-4 text-blue-600" />
                              <p className="text-xs font-semibold text-blue-800">과목 연관성</p>
                            </div>
                            {result.subjectRelevance.slice(0, 2).map((rel, i) => (
                              <div key={i} className="mb-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-blue-700">{rel.subject}</span>
                                  <span className="font-bold text-blue-800">{rel.relevanceScore}%</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Career Relevance */}
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <BriefcaseIcon className="w-4 h-4 text-purple-600" />
                              <p className="text-xs font-semibold text-purple-800">진로 연관성</p>
                            </div>
                            {result.careerRelevance.slice(0, 2).map((rel, i) => (
                              <div key={i} className="mb-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-purple-700">{rel.career}</span>
                                  <span className="font-bold text-purple-800">{rel.relevanceScore}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Phrases */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">✍️ 추천 문구</p>
                          <div className="space-y-2">
                            {result.recommendedPhrases.slice(0, 3).map((phrase, i) => (
                              <div
                                key={i}
                                className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-start justify-between gap-2"
                              >
                                <span className="italic">"{phrase.phrase}"</span>
                                <button
                                  onClick={() => copyToClipboard(phrase.phrase)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && generatedDrafts.length > 0 && (
            <motion.div
              key="drafts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Combined Insights */}
              {combinedInsights && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                  <p className="text-sm font-semibold text-indigo-800 mb-2">💡 종합 분석</p>
                  <p className="text-sm text-gray-700">{combinedInsights}</p>
                </div>
              )}

              {/* Draft Options */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">📝 {getSectionName()} 초안 선택</p>

                {generatedDrafts.map((draft, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-rose-300 hover:bg-rose-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        draft.style === 'formal'
                          ? 'bg-blue-100 text-blue-700'
                          : draft.style === 'descriptive'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {draft.style === 'formal' ? '📋 공식적' :
                         draft.style === 'descriptive' ? '📖 서술적' : '🏆 성과 중심'}
                      </span>
                      <span className="text-xs text-gray-500">{draft.content.length}자</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">
                      {draft.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">강조: {draft.focus}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(draft.content)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                          복사
                        </button>
                        <button
                          onClick={() => handleSelectDraft(draft.content)}
                          className="px-3 py-1.5 text-sm bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 transition-colors font-semibold"
                        >
                          이 초안 사용
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentActivityFilePanel;
