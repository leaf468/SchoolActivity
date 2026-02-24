import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacher } from '../contexts/TeacherContext';
import { useAuth } from '../contexts/AuthContext';
import { schoolRecordGenerator } from '../services/schoolRecordGenerator';
import { StudentInfo, GenerationRequest, TeacherGeneratedRecord, SectionType } from '../types/schoolActivity';
import { finalizeStudent, getTeacherStudentsBySession } from '../supabase';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { pdfGenerator } from '../services/pdfGenerator';

const TeacherPage3BatchReview: React.FC = () => {
  const navigate = useNavigate();
  const { state, setGeneratedRecord } = useTeacher();
  const { isAuthenticated, isGuest } = useAuth();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [finalizedStudents, setFinalizedStudents] = useState<Set<string>>(new Set());
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'generated' | 'pending' | 'finalized'>('all');

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

  const studentsWithActivities = state.students.filter(s =>
    state.studentActivities.find(a => a.studentId === s.id)
  );

  // 필터링된 학생 목록
  const filteredStudents = studentsWithActivities.filter(student => {
    const hasGenerated = state.generatedRecords.some(r => r.studentId === student.id);
    const isFinalized = finalizedStudents.has(student.id);

    switch (filterStatus) {
      case 'generated':
        return hasGenerated && !isFinalized;
      case 'pending':
        return !hasGenerated;
      case 'finalized':
        return isFinalized;
      default:
        return true;
    }
  });

  // 통계
  const stats = {
    total: studentsWithActivities.length,
    generated: state.generatedRecords.length,
    pending: studentsWithActivities.length - state.generatedRecords.length,
    finalized: finalizedStudents.size,
  };

  const handleGenerateAll = async () => {
    if (!state.basicInfo) return;

    setGenerating(true);
    setProgress({ current: 0, total: studentsWithActivities.length });

    for (let i = 0; i < studentsWithActivities.length; i++) {
      const student = studentsWithActivities[i];
      const activity = state.studentActivities.find(a => a.studentId === student.id);

      if (!activity) continue;

      setProgress({ current: i + 1, total: studentsWithActivities.length });

      try {
        const studentInfo: StudentInfo = {
          name: student.name,
          grade: state.basicInfo.grade,
          desiredMajor: student.desiredMajor || '미정',
          track: student.track || '상경계열',
          school: undefined,
          classNumber: student.classNumber,
        };

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

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setGenerating(false);
  };

  const handleGenerateSingle = async (studentId: string) => {
    if (!state.basicInfo) return;

    const student = state.students.find(s => s.id === studentId);
    const activity = state.studentActivities.find(a => a.studentId === studentId);

    if (!student || !activity) return;

    setGenerating(true);
    setProgress({ current: 1, total: 1 });

    try {
      const studentInfo: StudentInfo = {
        name: student.name,
        grade: state.basicInfo.grade,
        desiredMajor: student.desiredMajor || '미정',
        track: student.track || '상경계열',
        school: undefined,
        classNumber: student.classNumber,
      };

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
      }
    } catch (error) {
      console.error(`${student.name} 생성 오류:`, error);
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

  const handleCopyAll = async () => {
    if (!state.basicInfo) return;

    let copyText = '';

    state.generatedRecords.forEach((record, index) => {
      const finalText = editedTexts[record.studentId] || record.generatedRecord.generatedText;
      const student = state.students.find(s => s.id === record.studentId);
      copyText += `[${index + 1}] ${record.studentName}`;
      if (student?.classNumber) {
        copyText += ` (${student.classNumber})`;
      }
      copyText += `\n${finalText}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(copyText);
      alert(`${state.generatedRecords.length}명의 생기부가 클립보드에 복사되었습니다!`);
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  const handleCopySingle = async (studentId: string) => {
    const record = state.generatedRecords.find(r => r.studentId === studentId);
    if (!record) return;

    const text = editedTexts[studentId] || record.generatedRecord.generatedText;

    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  const handleExportPDF = () => {
    if (!state.basicInfo || state.generatedRecords.length === 0) return;

    const records = state.generatedRecords.map(record => {
      const student = state.students.find(s => s.id === record.studentId);
      return {
        studentName: record.studentName,
        classNumber: student?.classNumber,
        content: editedTexts[record.studentId] || record.generatedRecord.generatedText,
      };
    });

    pdfGenerator.printSchoolRecordPDF(records, {
      grade: state.basicInfo.grade,
      semester: state.basicInfo.semester,
      sectionType: state.basicInfo.sectionType,
      subject: state.basicInfo.subject,
    });
  };

  const handlePrev = () => {
    navigate('/teacher/students');
  };

  if (!state.basicInfo) return null;

  // 섹션 타입 라벨
  const getSectionLabel = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'subject': return `${state.basicInfo?.subject || ''} 교과세특`;
      case 'autonomy': return '자율활동';
      case 'club': return '동아리활동';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return '';
    }
  };

  // 선택된 학생의 생성 결과
  const selectedRecord = selectedStudentId
    ? state.generatedRecords.find(r => r.studentId === selectedStudentId)
    : null;
  const selectedStudent = selectedStudentId
    ? state.students.find(s => s.id === selectedStudentId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <CommonHeader />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-2">
                  <span>👨‍🏫</span>
                  <span>선생님 모드</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">일괄 생성 및 검토</h1>
                <p className="text-gray-600 mt-1">
                  {state.basicInfo.grade}학년 {state.basicInfo.semester}학기 · {getSectionLabel(state.basicInfo.sectionType)}
                </p>
              </div>

              {/* 우상단 버튼 그룹 */}
              <div className="flex items-center gap-2">
                {state.generatedRecords.length > 0 && (
                  <>
                    <button
                      onClick={handleCopyAll}
                      className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition flex items-center gap-2 text-sm"
                    >
                      <span>📋</span>
                      전체 복사
                    </button>
                    <button
                      onClick={handleExportAll}
                      className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition flex items-center gap-2 text-sm"
                    >
                      <span>💾</span>
                      TXT
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 bg-white border-2 border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition flex items-center gap-2 text-sm"
                    >
                      <span>📄</span>
                      PDF
                    </button>
                    <button
                      onClick={() => navigate('/teacher/comparison')}
                      className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm"
                    >
                      <span>📊</span>
                      합격자 비교
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">전체 학생</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{stats.generated}</p>
              <p className="text-sm text-gray-600">생성 완료</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
              <p className="text-sm text-gray-600">생성 대기</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{stats.finalized}</p>
              <p className="text-sm text-gray-600">최종 저장</p>
            </div>
          </div>

          {/* 생성 버튼 영역 */}
          {state.generatedRecords.length === 0 && !generating && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI 생성 준비 완료</h2>
              <p className="text-gray-600 mb-6">
                {studentsWithActivities.length}명의 학생 생기부를 AI로 생성합니다
              </p>
              <button
                onClick={handleGenerateAll}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition transform hover:scale-105"
              >
                🚀 전체 생성 시작
              </button>
            </div>
          )}

          {/* 생성 중 프로그레스 */}
          {generating && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">생성 중...</p>
                  <p className="text-indigo-600 font-bold">
                    {progress.current} / {progress.total}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측: 학생 목록 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>👨‍🎓</span>
                    학생 목록
                  </h2>
                </div>

                {/* 필터 버튼 */}
                <div className="p-3 border-b border-gray-100 flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: '전체', count: stats.total },
                    { key: 'generated', label: '생성됨', count: stats.generated - stats.finalized },
                    { key: 'pending', label: '대기', count: stats.pending },
                    { key: 'finalized', label: '저장됨', count: stats.finalized },
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        filterStatus === filter.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* 학생 목록 */}
                <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredStudents.map((student, index) => {
                    const hasGenerated = state.generatedRecords.some(r => r.studentId === student.id);
                    const isFinalized = finalizedStudents.has(student.id);

                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          selectedStudentId === student.id
                            ? 'bg-indigo-100 border-2 border-indigo-400'
                            : isFinalized
                            ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                            : hasGenerated
                            ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800">{student.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isFinalized ? (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">저장됨</span>
                            ) : hasGenerated ? (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">생성됨</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-400 text-white text-xs font-bold rounded-full">대기</span>
                            )}
                          </div>
                        </div>
                        {student.classNumber && (
                          <p className="text-xs text-gray-500 mt-1 ml-8">{student.classNumber}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* 전체 생성 버튼 */}
                {state.generatedRecords.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={handleGenerateAll}
                      disabled={generating}
                      className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>🔄</span>
                      {generating ? '생성 중...' : '전체 재생성'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 우측: 선택된 학생 상세 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {selectedStudentId && selectedStudent ? (
                  <>
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                          <span className="text-xl">{selectedStudent.name}</span>
                          {finalizedStudents.has(selectedStudentId) && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">최종 저장됨</span>
                          )}
                        </h2>
                        {selectedStudent.classNumber && (
                          <p className="text-sm text-gray-600">{selectedStudent.classNumber}</p>
                        )}
                        {selectedStudent.desiredMajor && (
                          <p className="text-sm text-indigo-600">
                            🎯 {selectedStudent.desiredMajor} · {selectedStudent.track}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!selectedRecord ? (
                          <button
                            onClick={() => handleGenerateSingle(selectedStudentId)}
                            disabled={generating}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            🚀 생성하기
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCopySingle(selectedStudentId)}
                              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                              title="복사"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => handleGenerateSingle(selectedStudentId)}
                              disabled={generating}
                              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                              title="재생성"
                            >
                              🔄
                            </button>
                            {editingStudentId !== selectedStudentId ? (
                              <button
                                onClick={() => setEditingStudentId(selectedStudentId)}
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                              >
                                ✏️ 수정
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(selectedStudentId)}
                                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                                >
                                  ✓ 저장
                                </button>
                                <button
                                  onClick={() => setEditingStudentId(null)}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                  취소
                                </button>
                              </>
                            )}
                            {!finalizedStudents.has(selectedStudentId) && editingStudentId !== selectedStudentId && (
                              <button
                                onClick={() => handleFinalizeStudent(selectedStudentId)}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                              >
                                💾 최종 저장
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {selectedRecord ? (
                        <>
                          {editingStudentId === selectedStudentId ? (
                            <textarea
                              value={editedTexts[selectedStudentId] || selectedRecord.generatedRecord.generatedText}
                              onChange={(e) => handleTextEdit(selectedStudentId, e.target.value)}
                              rows={15}
                              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none font-mono text-sm bg-indigo-50"
                            />
                          ) : (
                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {editedTexts[selectedStudentId] || selectedRecord.generatedRecord.generatedText}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                {(editedTexts[selectedStudentId] || selectedRecord.generatedRecord.generatedText).length}자
                              </span>
                              {selectedRecord.generatedRecord.updatedAt && (
                                <span className="text-xs text-gray-500">
                                  수정: {new Date(selectedRecord.generatedRecord.updatedAt).toLocaleString('ko-KR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-16">
                          <div className="text-5xl mb-4">📝</div>
                          <p className="text-gray-600">아직 생성되지 않았습니다</p>
                          <button
                            onClick={() => handleGenerateSingle(selectedStudentId)}
                            disabled={generating}
                            className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            🚀 지금 생성하기
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-5xl mb-4">👈</div>
                    <p className="text-gray-600">좌측에서 학생을 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition"
            >
              ← 이전 단계
            </button>
            <button
              onClick={() => navigate('/teacher/basic')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition"
            >
              새 세션 시작 →
            </button>
          </div>

          {/* 진행 표시 */}
          <div className="mt-6 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default TeacherPage3BatchReview;
