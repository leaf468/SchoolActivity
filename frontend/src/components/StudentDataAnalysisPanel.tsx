import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import {
  studentDataAnalyzer,
  AnalyzedStudentData,
  StudentDataInput,
} from '../services/studentDataAnalyzer';

interface StudentDataAnalysisPanelProps {
  studentName: string;
  studentGrade?: number;
  desiredMajor?: string;
  track?: string;
  sectionType: string;
  onAnalysisComplete?: (analysis: AnalyzedStudentData) => void;
  onGeneratedText?: (text: string) => void;
}

const StudentDataAnalysisPanel: React.FC<StudentDataAnalysisPanelProps> = ({
  studentName,
  studentGrade,
  desiredMajor,
  track,
  sectionType,
  onAnalysisComplete,
  onGeneratedText,
}) => {
  const [existingRecords, setExistingRecords] = useState('');
  const [additionalMaterials, setAdditionalMaterials] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzedStudentData | null>(null);
  const [generatedText, setGeneratedText] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'generated'>('input');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!existingRecords.trim() && !additionalMaterials.trim()) {
      setError('분석할 데이터를 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const input: StudentDataInput = {
      existingRecords: existingRecords.trim() || undefined,
      additionalMaterials: additionalMaterials.trim() || undefined,
      studentInfo: {
        name: studentName,
        grade: studentGrade || 1,
        desiredMajor,
        track,
      },
      sectionType,
    };

    const result = await studentDataAnalyzer.analyzeStudentData(input);

    setIsAnalyzing(false);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
      setActiveTab('analysis');
      onAnalysisComplete?.(result.analysis);
    } else {
      setError(result.error || '분석 중 오류가 발생했습니다.');
    }
  }, [existingRecords, additionalMaterials, studentName, studentGrade, desiredMajor, track, sectionType, onAnalysisComplete]);

  const handleGenerate = useCallback(async () => {
    if (!analysis) {
      setError('먼저 데이터 분석을 진행해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const result = await studentDataAnalyzer.generateRecordFromAnalysis(
      analysis,
      sectionType
    );

    setIsGenerating(false);

    if (result.success && result.generatedText) {
      setGeneratedText(result.generatedText);
      setActiveTab('generated');
      onGeneratedText?.(result.generatedText);
    } else {
      setError(result.error || '생성 중 오류가 발생했습니다.');
    }
  }, [analysis, sectionType, onGeneratedText]);

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedText);
    alert('클립보드에 복사되었습니다!');
  }, [generatedText]);

  const getSectionName = () => {
    switch (sectionType) {
      case 'subject': return '교과세특';
      case 'autonomy': return '자율활동';
      case 'club': return '동아리활동';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return '생기부';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI 데이터 분석</h3>
            <p className="text-sm text-gray-500">{studentName}님의 기존 자료 분석 및 {getSectionName()} 생성</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-gray-100">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
            activeTab === 'input'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          📝 데이터 입력
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          disabled={!analysis}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
            activeTab === 'analysis'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : analysis
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          📊 분석 결과
        </button>
        <button
          onClick={() => setActiveTab('generated')}
          disabled={!generatedText}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
            activeTab === 'generated'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : generatedText
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          ✨ 생성 결과
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Input Tab */}
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Existing Records */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                  <label className="text-sm font-bold text-gray-700">기존 생기부 기록</label>
                </div>
                <textarea
                  value={existingRecords}
                  onChange={(e) => setExistingRecords(e.target.value)}
                  placeholder="학생의 기존 생기부 기록을 붙여넣으세요...&#10;(교과세특, 자율활동, 동아리, 진로, 행동특성 등)"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  * 학생의 과거 생기부 기록을 입력하면 일관된 스타일로 새 기록을 생성합니다
                </p>
              </div>

              {/* Additional Materials */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircleIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-bold text-gray-700">추가 자료 / 메모</label>
                </div>
                <textarea
                  value={additionalMaterials}
                  onChange={(e) => setAdditionalMaterials(e.target.value)}
                  placeholder="학생이 가져온 추가 자료, 활동 메모, 수상 경력, 특이사항 등...&#10;(자유 형식으로 입력)"
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  * 학생이 제출한 메모, 수상 내역, 특별 활동 등을 입력하세요
                </p>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!existingRecords.trim() && !additionalMaterials.trim())}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    AI 분석 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    AI로 데이터 분석하기
                  </span>
                )}
              </button>
            </motion.div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Summary */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5" /> 전체 요약
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Core Competencies */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">💪 핵심 역량</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.coreCompetencies.map((comp, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Activities */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">📋 주요 활동</h4>
                <div className="space-y-2">
                  {analysis.keyActivities.map((activity, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-800">{activity.activity}</p>
                      {activity.role && (
                        <p className="text-sm text-gray-600">역할: {activity.role}</p>
                      )}
                      {activity.achievement && (
                        <p className="text-sm text-green-600">성과: {activity.achievement}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Keywords */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">🎯 진로 키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.careerKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Personal Traits */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">🌟 성격/행동 특성</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.personalTraits.map((trait, i) => (
                    <span key={i} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Emphasis */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <h4 className="font-bold text-green-800 mb-3">✅ 추천 강조점</h4>
                <ul className="space-y-1">
                  {analysis.recommendedEmphasis.map((emphasis, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {emphasis}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usable Phrases */}
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">📝 활용 가능 문장</h4>
                <div className="space-y-2">
                  {analysis.usablePhrases.map((phrase, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700 italic">
                      "{phrase}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg sticky bottom-0"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    {getSectionName()} 생성 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    분석 결과로 {getSectionName()} 생성하기
                  </span>
                )}
              </button>
            </motion.div>
          )}

          {/* Generated Tab */}
          {activeTab === 'generated' && generatedText && (
            <motion.div
              key="generated"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-green-800 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" /> 생성된 {getSectionName()}
                  </h4>
                  <span className="text-sm text-green-600 font-medium">
                    {generatedText.length}자
                  </span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedText}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  클립보드에 복사
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  다시 생성
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDataAnalysisPanel;
