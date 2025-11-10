import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface RealTimeQualityCheckerProps {
  text: string;
  maxLength?: number;
  sectionType?: string;
}

const RealTimeQualityChecker: React.FC<RealTimeQualityCheckerProps> = ({
  text,
  maxLength = 500,
  sectionType = 'general'
}) => {
  const analysis = useMemo(() => {
    const length = text.length;
    const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    // 품질 체크 항목들
    const checks = {
      length: {
        pass: length >= maxLength * 0.7 && length <= maxLength,
        message: `글자수: ${length}/${maxLength}자`,
        detail: length < maxLength * 0.5 ? '너무 짧습니다' :
                length < maxLength * 0.7 ? '조금 더 작성해주세요' :
                length > maxLength ? `${length - maxLength}자 초과` : '적정합니다'
      },
      specificity: {
        pass: text.includes('월') || text.includes('주') || text.includes('회') ||
              /\d+/.test(text),
        message: '구체성',
        detail: '숫자나 기간 표현이 있나요?'
      },
      keywords: {
        pass: (text.match(/탐구|분석|연구|설계|발표|토론|실험|조사|개발|제작/g) || []).length >= 2,
        message: '핵심 동사',
        detail: '탐구, 분석, 연구 등 구체적 동사 사용'
      },
      avoidance: {
        pass: !text.match(/열심히|노력|최선|훌륭|뛰어난|우수한/g),
        message: '상투적 표현 회피',
        detail: '추상적 표현 대신 구체적 서술'
      },
      growth: {
        pass: text.includes('깨닫') || text.includes('배우') || text.includes('성장') ||
              text.includes('발전') || text.includes('향상'),
        message: '성장 서술',
        detail: '배움이나 변화 과정 포함'
      },
      connection: {
        pass: text.includes('진로') || text.includes('관심') || text.includes('흥미') ||
              text.match(/\w+과|학과|분야/),
        message: '진로 연계',
        detail: '진로나 관심 분야 연결'
      }
    };

    const passedChecks = Object.values(checks).filter(c => c.pass).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    // 문장 길이 변동성 (AI 탐지 회피)
    const sentenceLengths = sentences.map(s => s.length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length || 0;
    const coefficient = variance > 0 ? Math.sqrt(variance) / avgLength : 0;
    const naturalness = coefficient > 0.3 ? '자연스러움' : '문장 길이가 너무 균일함';

    return {
      checks,
      score,
      passedChecks,
      totalChecks,
      sentenceCount: sentences.length,
      wordCount: words.length,
      naturalness,
      coefficient
    };
  }, [text, maxLength]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (!text || text.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600">내용을 입력하면 실시간으로 품질을 분석합니다</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      {/* 종합 점수 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">품질 점수</h4>
          <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}점
          </span>
        </div>

        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.score}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full bg-gradient-to-r ${getScoreBg(analysis.score)}`}
          />
        </div>

        <p className="text-xs text-gray-600 mt-2">
          {analysis.passedChecks}/{analysis.totalChecks} 항목 통과
        </p>
      </div>

      {/* 상세 체크리스트 */}
      <div className="space-y-3 mb-6">
        {Object.entries(analysis.checks).map(([key, check]) => (
          <div
            key={key}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              check.pass ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            {check.pass ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${check.pass ? 'text-green-900' : 'text-red-900'}`}>
                {check.message}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">문장 수</p>
          <p className="text-lg font-bold text-blue-900">{analysis.sentenceCount}개</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-purple-700 font-medium mb-1">단어 수</p>
          <p className="text-lg font-bold text-purple-900">{analysis.wordCount}개</p>
        </div>
      </div>

      {/* AI 탐지 회피 지표 */}
      <div className={`p-3 rounded-lg ${
        analysis.coefficient > 0.3 ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-start gap-2">
          {analysis.coefficient > 0.3 ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${
              analysis.coefficient > 0.3 ? 'text-green-900' : 'text-yellow-900'
            }`}>
              AI 탐지 회피
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {analysis.naturalness}
              {analysis.coefficient <= 0.3 && ' (문장 길이를 다양하게 조절하세요)'}
            </p>
          </div>
        </div>
      </div>

      {/* 개선 제안 */}
      {analysis.score < 80 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <p className="text-sm font-semibold text-orange-900 mb-2">💡 개선 제안</p>
          <ul className="text-xs text-gray-700 space-y-1">
            {!analysis.checks.specificity.pass && (
              <li>• 구체적인 숫자나 기간을 추가하세요 (예: "3개월간", "5회", "10권")</li>
            )}
            {!analysis.checks.keywords.pass && (
              <li>• 구체적 동사를 사용하세요 (탐구, 분석, 연구, 설계 등)</li>
            )}
            {!analysis.checks.avoidance.pass && (
              <li>• 추상적 표현("열심히", "노력")을 구체적 서술로 바꾸세요</li>
            )}
            {!analysis.checks.growth.pass && (
              <li>• 활동을 통한 배움이나 변화를 추가하세요</li>
            )}
            {!analysis.checks.connection.pass && (
              <li>• 진로나 관심 분야와의 연결고리를 언급하세요</li>
            )}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default RealTimeQualityChecker;
