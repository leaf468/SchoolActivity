/**
 * 학생용 작성 스타일 추천 페이지
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { WritingStyleService } from '../services/writingStyleService';
import { WritingStyleRecommendation, SectionType, SECTION_NAMES } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const StudentWritingStylePage: React.FC = () => {
  const navigate = useNavigate();
  const { studentInfo } = useSchoolActivity();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<WritingStyleRecommendation | null>(null);
  const [error, setError] = useState<string>('');

  // 폼 상태
  const [currentText, setCurrentText] = useState('');
  const [sectionType, setSectionType] = useState<SectionType>('subject');
  const [subject, setSubject] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number>(0);

  // 스타일 분석 및 추천
  const handleAnalyze = async () => {
    if (!studentInfo) {
      setError('학생 정보가 없습니다.');
      return;
    }

    if (!currentText.trim()) {
      setError('분석할 텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await WritingStyleService.analyzeAndRecommend(
        studentInfo,
        currentText,
        sectionType,
        sectionType === 'subject' ? subject : undefined
      );

      if (result) {
        setRecommendation(result);
      } else {
        setError('분석을 완료하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 빠른 체크
  const handleQuickCheck = async () => {
    if (!currentText.trim()) return;

    const quickResult = await WritingStyleService.quickStyleCheck(currentText);
    alert(`글자 수: ${quickResult.wordCount}자
A-M-A-R 구조: ${quickResult.hasAmarStructure ? '있음' : '없음'}
제안사항: ${quickResult.suggestions.join(', ') || '없음'}`);
  };

  // 개선된 텍스트 복사
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('텍스트가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">작성 스타일 추천</h1>
          <p className="text-gray-600">
            내가 작성한 생기부를 분석하고, 합격자 스타일로 개선된 버전을 추천받으세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 입력 폼 */}
        {!recommendation && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">생기부 텍스트 입력</h2>

            {/* 섹션 선택 */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작성 항목</label>
                <select
                  value={sectionType}
                  onChange={e => setSectionType(e.target.value as SectionType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(SECTION_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              {sectionType === 'subject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">과목명</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="예: 수학, 영어, 물리"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 텍스트 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작성한 내용 (최소 100자 이상)
              </label>
              <textarea
                value={currentText}
                onChange={e => setCurrentText(e.target.value)}
                rows={8}
                placeholder="작성한 생기부 내용을 입력하세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {currentText.replace(/\s/g, '').length}자
                </span>
                <button
                  onClick={handleQuickCheck}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  빠른 체크
                </button>
              </div>
            </div>

            {/* 분석 버튼 */}
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={loading || !studentInfo || !currentText.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '분석 중...' : '스타일 분석 및 개선안 받기'}
              </button>
            </div>
          </div>
        )}

        {/* 분석 결과 */}
        {recommendation && (
          <div className="space-y-6">
            {/* 현재 스타일 분석 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">현재 작성 스타일 분석</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">스타일 특징</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="text-gray-500">어조:</span>
                      <span className="ml-2">{recommendation.currentStyle.tone}</span>
                    </li>
                    <li>
                      <span className="text-gray-500">구조:</span>
                      <span className="ml-2">{recommendation.currentStyle.structure}</span>
                    </li>
                    <li>
                      <span className="text-gray-500">분량:</span>
                      <span className="ml-2">{recommendation.currentStyle.lengthAnalysis}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">키워드 분석</h3>
                  <div className="mb-3">
                    <p className="text-sm text-green-600 mb-1">잘 사용된 키워드:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.currentStyle.strengthKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 mb-1">부족한 요소:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.currentStyle.missingElements.map((element, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded"
                        >
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 개선된 버전들 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">개선된 버전 추천</h2>

              {/* 버전 선택 탭 */}
              <div className="flex gap-2 mb-6 border-b">
                {recommendation.improvedVersions.map((version, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVersion(idx)}
                    className={`px-4 py-2 font-medium transition ${
                      selectedVersion === idx
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    버전 {version.version}
                  </button>
                ))}
              </div>

              {/* 선택된 버전 내용 */}
              {recommendation.improvedVersions[selectedVersion] && (
                <div>
                  {/* 개선 포인트 */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">개선 포인트</h3>
                    <ul className="space-y-1">
                      {recommendation.improvedVersions[selectedVersion].improvements.map((imp, idx) => (
                        <li key={idx} className="text-sm text-blue-800">
                          • {imp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 개선된 텍스트 */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">개선된 텍스트</h3>
                      <button
                        onClick={() => handleCopyText(recommendation.improvedVersions[selectedVersion].improvedText)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        복사
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {recommendation.improvedVersions[selectedVersion].improvedText}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      참고 합격자: {recommendation.improvedVersions[selectedVersion].basedOnAdmissionId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 참고한 합격자 스타일 */}
            {recommendation.recommendedStyle.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">참고한 합격자 스타일</h2>
                <div className="space-y-4">
                  {recommendation.recommendedStyle.slice(0, 3).map((style, idx) => (
                    <div key={idx} className="border-l-4 border-blue-400 pl-4">
                      <p className="font-medium text-gray-900 mb-1">{style.styleDescription}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        주요 차이점: {style.keyDifferences.join(', ')}
                      </p>
                      <div className="text-xs text-gray-500">
                        참고 ID: {style.referenceAdmissionId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRecommendation(null);
                  setCurrentText('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                다른 텍스트 분석하기
              </button>
              <button
                onClick={() => navigate('/page3')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                생기부 작성 계속하기
              </button>
            </div>
          </div>
        )}
      </main>

      <CommonFooter />
    </div>
  );
};

export default StudentWritingStylePage;