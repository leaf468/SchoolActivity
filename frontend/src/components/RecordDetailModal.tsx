import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityRecord } from '../supabase/types';
import { updateActivityRecord } from '../supabase';

interface RecordDetailModalProps {
  record: ActivityRecord;
  onClose: () => void;
  onUpdate: (updatedRecord: ActivityRecord) => void;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(record.title || '');
  const [editedText, setEditedText] = useState(
    record.final_text || record.generated_draft || record.activity_summary || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  // record prop이 변경될 때마다 내부 state 업데이트 (즉시 반영용)
  useEffect(() => {
    setEditedTitle(record.title || '');
    setEditedText(
      record.final_text || record.generated_draft || record.activity_summary || ''
    );
  }, [record]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isEditing, onClose]);

  const handleSave = async () => {
    if (!editedText.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateActivityRecord(record.id, {
        title: editedTitle,
        final_text: editedText,
      });

      if (result.success && result.data) {
        onUpdate(result.data);
        setIsEditing(false);
        alert('저장되었습니다.');
      } else {
        alert('저장 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('저장 실패: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(record.title || '');
    setEditedText(
      record.final_text || record.generated_draft || record.activity_summary || ''
    );
    setIsEditing(false);
  };

  const sectionTypeLabel = {
    subject: '교과세특',
    autonomy: '자율활동',
    club: '동아리활동',
    service: '봉사활동',
    career: '진로활동',
    behavior: '행동특성 및 종합의견',
  }[record.section_type || ''] || '활동 기록';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isEditing ? onClose : undefined}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full text-lg font-semibold text-gray-900 border-b border-gray-300 focus:border-gray-900 outline-none pb-1"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {record.title || '제목 없음'}
                </h2>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {sectionTypeLabel}
                </span>
                {record.subject && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {record.subject}
                  </span>
                )}
                {record.student_grade && (
                  <span>{record.student_grade}학년</span>
                )}
                <span>•</span>
                <span>{new Date(record.created_at).toLocaleDateString('ko-KR')}</span>
                {record.updated_at && record.updated_at !== record.created_at && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600">
                      수정됨: {new Date(record.updated_at).toLocaleDateString('ko-KR')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full min-h-[400px] p-4 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none leading-relaxed"
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {record.final_text || record.generated_draft || record.activity_summary || '내용이 없습니다.'}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {!isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                {record.activity_summary && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      입력한 원본 활동
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {record.activity_summary}
                    </p>
                  </div>
                )}

                {record.keywords && record.keywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      강조 키워드
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {record.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {record.verification_result && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      검증 결과
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-2">
                      {record.verification_result.overallScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">전체 점수</span>
                          <span className="font-semibold text-gray-900">
                            {record.verification_result.overallScore}점
                          </span>
                        </div>
                      )}
                      {record.verification_result.plagiarismRisk && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">표절 위험도</span>
                          <span
                            className={`font-semibold ${
                              record.verification_result.plagiarismRisk === 'low'
                                ? 'text-green-600'
                                : record.verification_result.plagiarismRisk === 'medium'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {record.verification_result.plagiarismRisk === 'low'
                              ? '낮음'
                              : record.verification_result.plagiarismRisk === 'medium'
                              ? '중간'
                              : '높음'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  편집
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordDetailModal;
