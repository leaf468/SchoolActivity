import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { schoolRecordService } from '../services/schoolRecordService';

const Page3DraftReview: React.FC = () => {
  const navigate = useNavigate();
  const { state, setDraftResult, setCurrentStep, addKeyword } = useSchoolActivity();
  const { basicInfo, activityDetails, emphasisKeywords, draftResult } = state;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!basicInfo || !activityDetails) {
      navigate('/page1');
      return;
    }

    // 초안이 없으면 자동 생성
    if (!draftResult) {
      generateDraft();
    }
  }, [basicInfo, activityDetails, draftResult]);

  const generateDraft = async () => {
    if (!basicInfo || !activityDetails) return;

    setIsGenerating(true);
    setError('');

    try {
      const result = await schoolRecordService.generateDraft(
        basicInfo,
        activityDetails,
        emphasisKeywords
      );
      setDraftResult(result);
    } catch (err: any) {
      setError(err.message || '초안 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!basicInfo || !activityDetails || !draftResult) return;

    if (!regenerateFeedback.trim()) {
      alert('수정 요청 사항을 입력해주세요.');
      return;
    }

    setIsRegenerating(true);
    setError('');

    try {
      const result = await schoolRecordService.regenerateDraft(
        basicInfo,
        activityDetails,
        emphasisKeywords,
        draftResult.draftText,
        regenerateFeedback
      );
      setDraftResult(result);
      setRegenerateFeedback('');
    } catch (err: any) {
      setError(err.message || '재작성 중 오류가 발생했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddRecommendedKeyword = (keyword: string) => {
    addKeyword(keyword);
  };

  const handleNext = () => {
    setCurrentStep('final');
    navigate('/page4');
  };

  const handlePrev = () => {
    navigate('/page2');
  };

  if (!basicInfo || !activityDetails) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 초안 생성 및 검토</h1>
          <p className="text-gray-600">
            생성된 초안을 확인하고, 필요 시 재작성을 요청하세요
          </p>
        </div>

        {/* 로딩 */}
        {isGenerating && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-700">AI가 생기부 초안을 작성하고 있습니다...</p>
            <p className="text-sm text-gray-500 mt-2">20-30초 정도 소요됩니다.</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">오류 발생</p>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={generateDraft}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 초안 표시 */}
        {draftResult && !isGenerating && (
          <div className="space-y-6">
            {/* 품질 점수 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">품질 점수</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        draftResult.qualityScore && draftResult.qualityScore >= 80
                          ? 'bg-green-500'
                          : draftResult.qualityScore && draftResult.qualityScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${draftResult.qualityScore || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {draftResult.qualityScore || 0}점
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {draftResult.qualityScore && draftResult.qualityScore >= 80
                  ? '우수한 품질입니다!'
                  : draftResult.qualityScore && draftResult.qualityScore >= 60
                  ? '양호한 품질입니다. 재작성으로 개선할 수 있습니다.'
                  : '재작성을 권장합니다.'}
              </p>
            </div>

            {/* 추천 키워드 */}
            {draftResult.recommendedKeywords && draftResult.recommendedKeywords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">추천 키워드</h2>
                <p className="text-sm text-gray-600 mb-4">
                  AI가 활동 내용을 분석하여 추천하는 역량 키워드입니다. 클릭하면 키워드 목록에 추가되고
                  재작성 시 반영됩니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  {draftResult.recommendedKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleAddRecommendedKeyword(keyword)}
                      className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition"
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 생성된 초안 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">생성된 초안</h2>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {draftResult.draftText}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                글자 수: {draftResult.draftText.length}자
              </div>
            </div>

            {/* 재작성 요청 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">재작성 요청</h2>
              <p className="text-sm text-gray-600 mb-4">
                초안에 만족하지 않으시면 구체적인 수정 요청 사항을 입력하고 재작성하세요.
              </p>
              <textarea
                value={regenerateFeedback}
                onChange={(e) => setRegenerateFeedback(e.target.value)}
                placeholder="예: 리더십을 더 강조해주세요. / 프로젝트 과정을 더 구체적으로 서술해주세요."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-3"
              />
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isRegenerating ? '재작성 중...' : '재작성 요청'}
              </button>
            </div>

            {/* 버튼 */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
              >
                이 초안 사용 →
              </button>
            </div>
          </div>
        )}

        {/* 진행 표시 */}
        <div className="mt-8 flex justify-center items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default Page3DraftReview;
