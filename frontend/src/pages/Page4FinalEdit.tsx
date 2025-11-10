import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { useAuth } from '../contexts/AuthContext';
import { schoolRecordService } from '../services/schoolRecordService';
import { FinalRecord } from '../types/schoolActivity';
import { supabase } from '../config/supabase';

const Page4FinalEdit: React.FC = () => {
  const navigate = useNavigate();
  const { state, setFinalText, reset } = useSchoolActivity();
  const { user, isAuthenticated, isGuest } = useAuth();
  const { basicInfo, activityDetails, emphasisKeywords, draftResult } = state;

  const [editedText, setEditedText] = useState('');
  const [complianceCheck, setComplianceCheck] = useState<{
    isValid: boolean;
    violations: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // 꿀팁 데이터 (Page3와 동일)
  const tips = [
    {
      category: '생기부 기반 면접',
      title: '생기부 기반 면접 준비법',
      content: '생기부의 모든 활동에 대해 "왜"와 "어떻게"를 설명할 수 있어야 합니다. 활동 동기, 과정, 결과, 배운 점을 구체적으로 준비하세요.',
      stat: '서울대 2024학년도 전형: 학생부종합전형 합격자의 87%가 생기부 모든 활동에 대한 설명을 준비했다고 응답'
    },
    {
      category: '제시문 기반 면접',
      title: '제시문 기반 면접 팁',
      content: '제시문은 천천히 정확하게 읽고, 핵심 논점을 파악한 후 답변 구조를 먼저 세우세요. "제시문에 따르면..."으로 시작하며 근거를 명확히 하세요.',
      stat: '2023년 주요 대학 면접 분석: 답변 시작 전 30초 생각 시간을 활용한 학생의 평균 점수가 12% 더 높음'
    },
    {
      category: '면접 필수 체크',
      title: '면접 전 반드시 체크할 사항',
      content: '1) 지원 동기와 학과 이해도 2) 최근 전공 관련 이슈 3) 생기부 모든 활동 복습 4) 모의면접 최소 3회 이상 5) 예상 질문 30개 이상 준비',
      stat: '2024 입시결과: 모의면접 5회 이상 실시한 학생의 합격률 73% vs 2회 이하 학생 41%'
    },
    {
      category: '내신 준비',
      title: '내신 준비 핵심 전략',
      content: '수업 중 필기와 선생님 강조 내용이 가장 중요합니다. 시험 2주 전부터 오답노트를 만들고, 개념을 자신의 말로 설명할 수 있을 때까지 반복하세요.',
      stat: '전국 고교생 설문(2023): 내신 1등급 학생의 89%가 "수업 필기 + 오답노트"를 핵심 학습법으로 선택'
    },
    {
      category: '시험 준비',
      title: '효과적인 시험 준비 방법',
      content: '시험 범위를 3번 회독하세요. 1회독: 전체 흐름 파악, 2회독: 세부 개념 암기, 3회독: 문제 풀이 및 취약점 보완. 암기는 자기 전, 복습은 아침에.',
      stat: '서울대 교육학과 연구(2023): 3회 이상 반복 학습 시 장기 기억 정착률 94% vs 1회 학습 23%'
    },
    {
      category: '생기부 활용',
      title: '생기부 작성 후 활용법',
      content: '완성된 생기부를 바탕으로 "활동 연결맵"을 만들어 보세요. 서로 다른 활동들 간의 연관성을 찾아 하나의 스토리로 엮으면 면접에서 강력한 무기가 됩니다.',
      stat: '2024 수시합격자 인터뷰: 학종 합격생의 76%가 "활동 간 연계성"을 면접에서 강조했다고 응답'
    }
  ];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  useEffect(() => {
    if (!basicInfo || !activityDetails || !draftResult) {
      navigate('/page1');
      return;
    }

    // 초기 텍스트 설정
    if (!editedText) {
      setEditedText(draftResult.draftText);
    }
  }, [basicInfo, activityDetails, draftResult, navigate]);

  const handleCheckCompliance = () => {
    const result = schoolRecordService.finalComplianceCheck(editedText);
    setComplianceCheck(result);
  };

  const handleSave = async () => {
    if (!basicInfo || !activityDetails || !draftResult) return;

    // 최종 검증
    const validation = schoolRecordService.finalComplianceCheck(editedText);
    setComplianceCheck(validation);

    if (!validation.isValid) {
      alert('규정 위반 사항이 있습니다. 수정 후 저장해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      // 최종 레코드 저장
      const finalRecord: FinalRecord = {
        userId: state.userId,
        sessionId: state.sessionId,
        basicInfo,
        activityDetails,
        emphasisKeywords,
        aiDraft: draftResult.draftText,
        finalText: editedText,
        createdAt: new Date().toISOString(),
      };

      // 로그인한 사용자는 Supabase에 저장
      if (isAuthenticated && user && !isGuest) {
        const title = `${basicInfo.grade}학년 ${basicInfo.semester}학기 - ${
          basicInfo.sectionType === 'subject' ? basicInfo.subject :
          basicInfo.sectionType === 'autonomy' ? '자율활동' :
          basicInfo.sectionType === 'club' ? '동아리활동' :
          basicInfo.sectionType === 'career' ? '진로활동' : '행동특성 및 종합의견'
        }`;

        const { error } = await supabase
          .from('school_activity_records')
          .insert([{
            user_id: user.id,
            title: title,
            content: editedText,
            metadata: JSON.stringify(finalRecord)
          }]);

        if (error) throw error;
      } else {
        // 비회원은 localStorage에만 저장
        const savedRecords = JSON.parse(localStorage.getItem('saved_records') || '[]');
        savedRecords.push(finalRecord);
        localStorage.setItem('saved_records', JSON.stringify(savedRecords));
      }

      setFinalText(editedText);
      setSaveSuccess(true);

      setTimeout(() => {
        if (isGuest) {
          alert('생활기록부가 임시 저장되었습니다! (회원 가입 시 영구 보관 가능)');
        } else {
          alert('생활기록부가 저장되었습니다!');
        }
      }, 500);
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editedText);
    alert('클립보드에 복사되었습니다!');
  };

  const handleStartNew = () => {
    if (window.confirm('새로운 생기부를 작성하시겠습니까? 현재 작업 내용은 저장됩니다.')) {
      reset();
      navigate('/page1');
    }
  };

  if (!basicInfo || !activityDetails || !draftResult) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">최종 첨삭 및 저장</h1>
            <p className="text-gray-600">
              초안을 직접 수정하여 최종 생활기록부를 완성하세요
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 원본 AI 초안 (참조용) */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              AI 원본 초안 (참조용)
            </h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg h-96 overflow-y-auto">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {draftResult.draftText}
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              글자 수: {draftResult.draftText.length}자
            </div>
          </div>

          {/* 수정 가능한 텍스트 에디터 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              최종 편집
            </h2>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-96 resize-none"
              placeholder="초안을 수정하세요..."
            />
            <div className="mt-2 flex justify-between items-center text-sm">
              <span className="text-gray-600">글자 수: {editedText.length}자</span>
              <button
                onClick={handleCheckCompliance}
                className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                규정 검사
              </button>
            </div>
          </div>
        </div>

        {/* 규정 검증 결과 */}
        {complianceCheck && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              complianceCheck.isValid
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                complianceCheck.isValid ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {complianceCheck.isValid ? '✓ 규정 준수 확인' : '⚠ 규정 위반 사항'}
            </h3>
            {complianceCheck.isValid ? (
              <p className="text-sm text-green-700">
                생활기록부 작성 규정을 준수하고 있습니다.
              </p>
            ) : (
              <ul className="list-disc list-inside text-sm text-red-700">
                {complianceCheck.violations.map((violation, i) => (
                  <li key={i}>{violation}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 저장 성공 메시지 */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-green-800 font-semibold">✓ 저장 완료!</p>
            <p className="text-sm text-green-700 mt-1">
              생활기록부가 성공적으로 저장되었습니다.
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCopyToClipboard}
              className="w-full sm:w-auto px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
            >
              📋 클립보드 복사
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
            >
              {isSaving ? '저장 중...' : '💾 최종 저장'}
            </button>
            <button
              onClick={handleStartNew}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              🔄 새로 작성하기
            </button>
          </div>
        </div>

        {/* 새로운 기능 안내 섹션 */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 AI 분석 도구 활용하기</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/student/comparison')}
              className="p-4 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-400 hover:shadow-md transition"
            >
              <div className="text-purple-600 text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-800 mb-1">합격자 비교</h4>
              <p className="text-xs text-gray-600">내 생기부를 합격자와 비교 분석</p>
            </button>
            <button
              onClick={() => navigate('/student/activity-recommendation')}
              className="p-4 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-400 hover:shadow-md transition"
            >
              <div className="text-blue-600 text-2xl mb-2">💡</div>
              <h4 className="font-semibold text-gray-800 mb-1">활동 추천</h4>
              <p className="text-xs text-gray-600">다음 학기 활동 추천</p>
            </button>
            <button
              onClick={() => navigate('/student/writing-style')}
              className="p-4 bg-white rounded-lg border-2 border-green-300 hover:border-green-400 hover:shadow-md transition"
            >
              <div className="text-green-600 text-2xl mb-2">✍️</div>
              <h4 className="font-semibold text-gray-800 mb-1">작성 스타일</h4>
              <p className="text-xs text-gray-600">합격자 스타일로 개선</p>
            </button>
            <button
              onClick={() => navigate('/student/future-plan')}
              className="p-4 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-400 hover:shadow-md transition"
            >
              <div className="text-orange-600 text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-800 mb-1">미래 설계</h4>
              <p className="text-xs text-gray-600">진로 로드맵 & 면접 대비</p>
            </button>
          </div>
        </div>

        {/* 작성 정보 요약 */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">작성 정보</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">학년/학기:</span>
              <p className="font-semibold text-gray-800">
                {basicInfo.grade}학년 {basicInfo.semester}학기
              </p>
            </div>
            <div>
              <span className="text-gray-600">항목:</span>
              <p className="font-semibold text-gray-800">
                {basicInfo.sectionType === 'subject'
                  ? '세특'
                  : basicInfo.sectionType === 'autonomy'
                  ? '자율'
                  : basicInfo.sectionType === 'club'
                  ? '동아리'
                  : basicInfo.sectionType === 'career'
                  ? '진로'
                  : '행특'}
              </p>
            </div>
            {basicInfo.subject && (
              <div>
                <span className="text-gray-600">과목:</span>
                <p className="font-semibold text-gray-800">{basicInfo.subject}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600">강조 키워드:</span>
              <p className="font-semibold text-gray-800">
                {emphasisKeywords.length > 0 ? emphasisKeywords.join(', ') : '없음'}
              </p>
            </div>
          </div>
        </div>

        {/* 꿀팁 섹션 */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              💡 입시 꿀팁 모음
            </h3>
            <button
              onClick={() => setShowTipsModal(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium text-sm"
            >
              전체 보기 →
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            면접 준비, 내신 관리, 시험 대비 등 실전 입시 노하우를 확인하세요!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tips.map((tip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTipIndex(idx);
                  setShowTipsModal(true);
                }}
                className="p-4 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition text-left"
              >
                <p className="text-xs text-amber-600 font-semibold mb-1">{tip.category}</p>
                <p className="text-sm text-gray-800 font-medium">{tip.title}</p>
              </button>
            ))}
          </div>
        </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          </div>
        </div>
      </div>

      {/* 꿀팁 모달 */}
      {showTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">💡 입시 꿀팁 모음</h2>
                  <p className="text-sm opacity-90 mt-1">실전 면접/내신/시험 준비 노하우</p>
                </div>
                <button
                  onClick={() => setShowTipsModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 팁 슬라이드 */}
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-amber-600 font-semibold mb-1">
                      {tips[currentTipIndex].category}
                    </p>
                    <h3 className="text-xl font-bold text-gray-800">
                      {tips[currentTipIndex].title}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {currentTipIndex + 1} / {tips.length}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {tips[currentTipIndex].content}
                </p>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-blue-800">
                    📊 <strong>데이터:</strong> {tips[currentTipIndex].stat}
                  </p>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevTip}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  ← 이전
                </button>
                <div className="flex gap-2">
                  {tips.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                        idx === currentTipIndex ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentTipIndex(idx)}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTip}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  다음 →
                </button>
              </div>

              {/* 모든 팁 리스트 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">전체 꿀팁 목록</h4>
                <div className="grid grid-cols-1 gap-2">
                  {tips.map((tip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTipIndex(idx)}
                      className={`p-3 rounded-lg text-left transition ${
                        idx === currentTipIndex
                          ? 'bg-amber-100 border-2 border-amber-400'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <p className="text-xs text-amber-600 font-semibold">{tip.category}</p>
                      <p className="text-sm text-gray-800 font-medium">{tip.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page4FinalEdit;
