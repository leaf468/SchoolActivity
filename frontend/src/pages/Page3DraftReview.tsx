import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { schoolRecordService } from '../services/schoolRecordService';
import {
  getActivityRecordBySessionId,
  addRevisionHistory,
  updateActivityRecord
} from '../supabase';

const Page3DraftReview: React.FC = () => {
  const navigate = useNavigate();
  const { state, setDraftResult, setCurrentStep, addKeyword } = useSchoolActivity();
  const { basicInfo, activityDetails, emphasisKeywords, draftResult } = state;

  const [isGenerating, setIsGenerating] = useState(!draftResult); // 초기에 draftResult가 없으면 로딩 상태
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [error, setError] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // 면접 및 준비 팁
  const interviewTips = [
    {
      title: '생기부 기반 면접 준비법',
      content: '생기부의 모든 활동에 대해 "왜"와 "어떻게"를 설명할 수 있어야 합니다. 활동 동기, 과정, 결과, 배운 점을 구체적으로 준비하세요.',
      stat: '서울대 2024학년도 전형: 학생부종합전형 합격자의 87%가 생기부 모든 활동에 대한 설명을 준비했다고 응답'
    },
    {
      title: '제시문 기반 면접 팁',
      content: '제시문은 천천히 정확하게 읽고, 핵심 논점을 파악한 후 답변 구조를 먼저 세우세요. "제시문에 따르면..."으로 시작하며 근거를 명확히 하세요.',
      stat: '2023년 주요 대학 면접 분석: 답변 시작 전 30초 생각 시간을 활용한 학생의 평균 점수가 12% 더 높음'
    },
    {
      title: '면접 전 반드시 체크할 사항',
      content: '1) 지원 동기와 학과 이해도 2) 최근 전공 관련 이슈 3) 생기부 모든 활동 복습 4) 모의면접 최소 3회 이상 5) 예상 질문 30개 이상 준비',
      stat: '2024 입시결과: 모의면접 5회 이상 실시한 학생의 합격률 73% vs 2회 이하 학생 41%'
    },
    {
      title: '내신 준비 핵심 전략',
      content: '수업 중 필기와 선생님 강조 내용이 가장 중요합니다. 시험 2주 전부터 오답노트를 만들고, 개념을 자신의 말로 설명할 수 있을 때까지 반복하세요.',
      stat: '전국 고교생 설문(2023): 내신 1등급 학생의 89%가 "수업 필기 + 오답노트"를 핵심 학습법으로 선택'
    },
    {
      title: '효과적인 시험 준비 방법',
      content: '시험 범위를 3번 회독하세요. 1회독: 전체 흐름 파악, 2회독: 세부 개념 암기, 3회독: 문제 풀이 및 취약점 보완. 암기는 자기 전, 복습은 아침에.',
      stat: '서울대 교육학과 연구(2023): 3회 이상 반복 학습 시 장기 기억 정착률 94% vs 1회 학습 23%'
    },
    {
      title: '생기부 작성 후 활용법',
      content: '완성된 생기부를 바탕으로 "활동 연결맵"을 만들어 보세요. 서로 다른 활동들 간의 연관성을 찾아 하나의 스토리로 엮으면 면접에서 강력한 무기가 됩니다.',
      stat: '2024 수시합격자 인터뷰: 학종 합격생의 76%가 "활동 간 연계성"을 면접에서 강조했다고 응답'
    }
  ];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % interviewTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + interviewTips.length) % interviewTips.length);
  };

  useEffect(() => {
    console.log('[Page3] useEffect 실행:', {
      hasBasicInfo: !!basicInfo,
      hasActivityDetails: !!activityDetails,
      hasDraftResult: !!draftResult,
      basicInfo,
      activityDetails,
      emphasisKeywords
    });

    if (!basicInfo || !activityDetails) {
      console.log('[Page3] basicInfo 또는 activityDetails 없음 - Page1로 리다이렉트');
      navigate('/page1');
      return;
    }

    // 초안이 없으면 자동 생성
    if (!draftResult) {
      console.log('[Page3] draftResult 없음 - generateDraft 호출');
      generateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicInfo, activityDetails, draftResult]);

  const generateDraft = async () => {
    if (!basicInfo || !activityDetails) {
      console.log('[Page3] generateDraft - basicInfo 또는 activityDetails 없음');
      return;
    }

    console.log('[Page3] generateDraft 시작:', {
      basicInfo,
      activityDetails,
      emphasisKeywords
    });

    setIsGenerating(true);
    setError('');

    try {
      const result = await schoolRecordService.generateDraft(
        basicInfo,
        activityDetails,
        emphasisKeywords
      );
      console.log('[Page3] generateDraft 성공:', result);
      setDraftResult(result);
    } catch (err: any) {
      console.error('[Page3] generateDraft 실패:', err);
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
      // 원본 초안 저장
      const originalDraft = draftResult.draftText;

      // 재작성 실행
      const result = await schoolRecordService.regenerateDraft(
        basicInfo,
        activityDetails,
        emphasisKeywords,
        draftResult.draftText,
        regenerateFeedback
      );

      // 재작성된 초안 저장
      const revisedDraft = result.draftText;

      // revision_history 테이블에 저장
      const recordResult = await getActivityRecordBySessionId(state.sessionId);
      if (recordResult.success && recordResult.data) {
        const activityRecordId = recordResult.data.id;

        // revision_history에 저장
        await addRevisionHistory({
          activity_record_id: activityRecordId,
          original_draft: originalDraft,
          revision_request: regenerateFeedback,
          revised_draft: revisedDraft,
        });

        // activity_record의 generated_draft 업데이트
        await updateActivityRecord(activityRecordId, {
          generated_draft: revisedDraft,
          draft_confidence: result.qualityScore ? result.qualityScore / 100 : undefined,
        });

        console.log('[Page3] revision_history 및 activity_record 저장 완료');
      }

      setDraftResult(result);
      setRegenerateFeedback('');
    } catch (err: any) {
      console.error('[Page3] 재작성 오류:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              SchoolActivity
            </button>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 초안 생성 및 검토</h1>
            <p className="text-gray-600">
              생성된 초안을 확인하고, 필요 시 재작성을 요청하세요
            </p>
          </div>

        {/* 로딩 - 면접 팁 슬라이드 */}
        {isGenerating && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* 로딩 인디케이터 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-3"></div>
              <p className="text-lg font-semibold">AI가 생기부 초안을 작성하고 있습니다</p>
              <p className="text-sm opacity-90 mt-1">잠깐! 기다리는 동안 유용한 팁을 확인해보세요 👇</p>
            </div>

            {/* 팁 슬라이드 */}
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    💡 {interviewTips[currentTipIndex].title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {currentTipIndex + 1} / {interviewTips.length}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {interviewTips[currentTipIndex].content}
                </p>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-blue-800">
                    📊 <strong>데이터:</strong> {interviewTips[currentTipIndex].stat}
                  </p>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevTip}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  ← 이전 팁
                </button>
                <div className="flex gap-2">
                  {interviewTips.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentTipIndex ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTip}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium"
                >
                  다음 팁 →
                </button>
              </div>
            </div>
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
    </div>
  );
};

export default Page3DraftReview;
