import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../contexts/TeacherContext';
import { useAuth } from '../contexts/AuthContext';
import { schoolRecordGenerator } from '../services/schoolRecordGenerator';
import { StudentInfo, GenerationRequest, TeacherGeneratedRecord } from '../types/schoolActivity';
import { finalizeStudent, getTeacherStudentsBySession } from '../supabase';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const TeacherPage3BatchReview: React.FC = () => {
  const navigate = useNavigate();
  const { state, setGeneratedRecord } = useTeacher();
  const { user, isAuthenticated, isGuest } = useAuth();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [finalizedStudents, setFinalizedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state.basicInfo || state.students.length === 0) {
      navigate('/teacher/students');
    }
  }, [state.basicInfo, state.students, navigate]);

  // Load finalized status from DB on mount
  useEffect(() => {
    const loadFinalizedStatus = async () => {
      if (!state.sessionId || !isAuthenticated || isGuest) return;

      try {
        const result = await getTeacherStudentsBySession(state.sessionId);
        if (result.success && result.data) {
          const finalized = new Set(
            result.data
              .filter((s: any) => s.is_finalized === true)
              .map((s: any) => s.student_id)
          );
          setFinalizedStudents(finalized);

          // Also load existing drafts into editedTexts
          const edited: Record<string, string> = {};
          result.data.forEach((s: any) => {
            if (s.generated_draft) {
              edited[s.student_id] = s.generated_draft;
            }
          });
          setEditedTexts(prev => ({ ...prev, ...edited }));

          console.log('[Page3] Loaded finalized status:', finalized.size, 'students');
        }
      } catch (error) {
        console.error('[Page3] Failed to load finalized status:', error);
      }
    };

    loadFinalizedStatus();
  }, [state.sessionId, isAuthenticated, isGuest]);

  const handleGenerateAll = async () => {
    if (!state.basicInfo) return;

    setGenerating(true);
    const studentsWithActivities = state.students.filter(s =>
      state.studentActivities.find(a => a.studentId === s.id)
    );

    setProgress({ current: 0, total: studentsWithActivities.length });

    for (let i = 0; i < studentsWithActivities.length; i++) {
      const student = studentsWithActivities[i];
      const activity = state.studentActivities.find(a => a.studentId === student.id);

      if (!activity) continue;

      setProgress({ current: i + 1, total: studentsWithActivities.length });

      try {
        // 학생 정보 구성
        const studentInfo: StudentInfo = {
          name: student.name,
          grade: state.basicInfo.grade,
          desiredMajor: student.desiredMajor || '미정',
          track: student.track || '상경계열',
          school: undefined,
          classNumber: student.classNumber,
        };

        // 활동 요약 텍스트 생성
        const activityDetails = activity.activityDetails;
        let activitySummary = '';

        if ('activities' in activityDetails) {
          activitySummary = activityDetails.activities
            .map(act => act.content)
            .filter(c => c)
            .join(' ');
        }

        const request: GenerationRequest = {
          studentInfo,
          activityInput: {
            sectionType: state.basicInfo.sectionType,
            subject: state.basicInfo.subject,
            activitySummary,
            keywords: activity.emphasisKeywords,
          },
        };

        const response = await schoolRecordGenerator.generateRecord(request);

        if (response.success && response.record) {
          const teacherRecord: TeacherGeneratedRecord = {
            studentId: student.id,
            studentName: student.name,
            generatedRecord: response.record,
          };
          setGeneratedRecord(teacherRecord);
          setEditedTexts(prev => ({
            ...prev,
            [student.id]: response.record!.generatedText
          }));
        } else {
          console.error(`${student.name} 생성 실패:`, response.error);
        }
      } catch (error) {
        console.error(`${student.name} 생성 오류:`, error);
      }

      // 요청 간격 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setGenerating(false);
  };

  const handleTextEdit = (studentId: string, newText: string) => {
    setEditedTexts(prev => ({
      ...prev,
      [studentId]: newText
    }));
  };

  const handleSaveEdit = (studentId: string) => {
    const record = state.generatedRecords.find(r => r.studentId === studentId);
    if (!record) return;

    const updatedRecord: TeacherGeneratedRecord = {
      ...record,
      generatedRecord: {
        ...record.generatedRecord,
        generatedText: editedTexts[studentId] || record.generatedRecord.generatedText,
        updatedAt: new Date().toISOString(),
      },
    };

    setGeneratedRecord(updatedRecord);
    setEditingStudentId(null);
  };

  const handleFinalizeStudent = async (studentId: string) => {
    if (!isAuthenticated || isGuest) {
      alert('로그인이 필요합니다.');
      return;
    }

    const record = state.generatedRecords.find(r => r.studentId === studentId);
    if (!record) return;

    const finalText = editedTexts[studentId] || record.generatedRecord.generatedText;

    try {
      const result = await finalizeStudent(studentId, finalText);
      if (result.success) {
        setFinalizedStudents(prev => {
          const newSet = new Set(prev);
          newSet.add(studentId);
          return newSet;
        });
        alert('생기부가 최종 저장되었습니다!');
      } else {
        alert('저장 중 오류가 발생했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('최종 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleExportAll = () => {
    if (!state.basicInfo) return;

    let exportText = `# ${state.basicInfo.grade}학년 ${state.basicInfo.semester}학기 - `;
    if (state.basicInfo.sectionType === 'subject') {
      exportText += `${state.basicInfo.subject} 교과세특\n\n`;
    } else {
      exportText += `${state.basicInfo.sectionType}\n\n`;
    }

    state.generatedRecords.forEach((record, index) => {
      const finalText = editedTexts[record.studentId] || record.generatedRecord.generatedText;
      const student = state.students.find(s => s.id === record.studentId);
      exportText += `## ${index + 1}. ${record.studentName}`;
      if (student?.classNumber) {
        exportText += ` (${student.classNumber})`;
      }
      exportText += `\n\n${finalText}\n\n---\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `생기부_${state.basicInfo.grade}학년_${state.basicInfo.semester}학기_${state.basicInfo.subject || state.basicInfo.sectionType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrev = () => {
    navigate('/teacher/students');
  };

  if (!state.basicInfo) return null;

  const studentsWithActivities = state.students.filter(s =>
    state.studentActivities.find(a => a.studentId === s.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      <CommonHeader />

      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              👨‍🏫 선생님 모드 - 일괄 생성 및 검토
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">생기부 일괄 생성</h1>
            <p className="text-lg text-gray-600">
              {studentsWithActivities.length}명의 학생 생기부를 AI로 생성합니다
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 생성 버튼 */}
            {state.generatedRecords.length === 0 && (
              <div className="text-center py-16">
                {!generating ? (
                  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-12 border-2 border-dashed border-purple-300">
                    <div className="text-6xl mb-6">🚀</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">AI 생성 준비 완료</h2>
                    <p className="text-lg text-gray-600 mb-8">
                      {studentsWithActivities.length}명의 학생 생기부를 AI로 생성합니다
                    </p>
                    <button
                      onClick={handleGenerateAll}
                      className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-2xl transition-all transform hover:scale-105"
                    >
                      🚀 전체 생성 시작
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="mb-8">
                      <div className="w-32 h-32 mx-auto border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        생성 중...
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {progress.current} / {progress.total}
                      </p>
                    </div>
                    <p className="text-lg text-gray-600">
                      잠시만 기다려주세요. AI가 생기부를 작성하고 있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 생성 결과 목록 */}
            {state.generatedRecords.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">생성 결과</h2>
                    <p className="text-sm text-purple-600 mt-1">{state.generatedRecords.length}명의 생기부가 생성되었습니다</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/teacher/comparison')}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-md text-sm"
                    >
                      📊 합격자 비교
                    </button>
                    <button
                      onClick={handleGenerateAll}
                      disabled={generating}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition shadow-md disabled:opacity-50 text-sm"
                    >
                      🔄 재생성
                    </button>
                    <button
                      onClick={handleExportAll}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-md text-sm"
                    >
                      💾 전체 다운로드
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {state.generatedRecords.map((record) => {
                    const student = state.students.find(s => s.id === record.studentId);
                    const isEditing = editingStudentId === record.studentId;
                    const displayText = editedTexts[record.studentId] || record.generatedRecord.generatedText;

                    return (
                      <div key={record.studentId} className="p-6 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-all">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 pb-4 border-b-2 border-purple-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">{record.studentName}</h3>
                              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">완료</span>
                            </div>
                            {student?.classNumber && (
                              <p className="text-sm text-gray-600 mb-1">{student.classNumber}</p>
                            )}
                            {student?.desiredMajor && (
                              <div className="flex items-center gap-1">
                                <span className="text-purple-600 font-semibold text-sm">🎯 {student.desiredMajor}</span>
                                <span className="text-gray-400 text-sm">·</span>
                                <span className="text-purple-500 text-sm">{student.track}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!isEditing ? (
                              <>
                                <button
                                  onClick={() => setEditingStudentId(record.studentId)}
                                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold transition shadow-md"
                                >
                                  ✏️ 수정
                                </button>
                                {!finalizedStudents.has(record.studentId) ? (
                                  <button
                                    onClick={() => handleFinalizeStudent(record.studentId)}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold transition shadow-md"
                                  >
                                    💾 최종 저장
                                  </button>
                                ) : (
                                  <span className="px-5 py-2 bg-green-100 text-green-700 rounded-xl font-bold border-2 border-green-300">
                                    ✓ 저장 완료
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(record.studentId)}
                                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold transition shadow-md"
                                >
                                  ✓ 저장
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStudentId(null);
                                    setEditedTexts(prev => {
                                      const newTexts = { ...prev };
                                      delete newTexts[record.studentId];
                                      return newTexts;
                                    });
                                  }}
                                  className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition"
                                >
                                  취소
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                            <textarea
                              value={displayText}
                              onChange={(e) => handleTextEdit(record.studentId, e.target.value)}
                              rows={10}
                              className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono text-sm"
                            />
                          </div>
                        ) : (
                          <div className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{displayText}</p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-purple-100">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {displayText.length}자
                            </span>
                            {record.generatedRecord.updatedAt && (
                              <span className="text-xs text-gray-500">
                                수정: {new Date(record.generatedRecord.updatedAt).toLocaleString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* 하단 네비게이션 */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-gray-100">
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                ← 이전 단계
              </button>
              {state.generatedRecords.length > 0 && (
                <button
                  onClick={() => navigate('/teacher/basic')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg transition-all"
                >
                  처음으로 →
                </button>
              )}
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600 shadow-md"></div>
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default TeacherPage3BatchReview;
