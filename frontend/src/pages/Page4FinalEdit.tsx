import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { schoolRecordService } from '../services/schoolRecordService';
import { FinalRecord } from '../types/schoolActivity';

const Page4FinalEdit: React.FC = () => {
  const navigate = useNavigate();
  const { state, setFinalText, reset } = useSchoolActivity();
  const { basicInfo, activityDetails, emphasisKeywords, draftResult } = state;

  const [editedText, setEditedText] = useState('');
  const [complianceCheck, setComplianceCheck] = useState<{
    isValid: boolean;
    violations: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      // 최종 레코드 저장 (실제로는 백엔드 API 호출)
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

      // localStorage에 임시 저장 (실제 서비스에서는 DB 저장)
      const savedRecords = JSON.parse(localStorage.getItem('saved_records') || '[]');
      savedRecords.push(finalRecord);
      localStorage.setItem('saved_records', JSON.stringify(savedRecords));

      setFinalText(editedText);
      setSaveSuccess(true);

      setTimeout(() => {
        alert('생활기록부가 저장되었습니다!');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
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

        {/* 진행 표시 */}
        <div className="mt-8 flex justify-center items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
        </div>
      </div>
    </div>
  );
};

export default Page4FinalEdit;
