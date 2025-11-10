import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../contexts/TeacherContext';
import { schoolRecordGenerator } from '../services/schoolRecordGenerator';
import { StudentInfo, GenerationRequest, TeacherGeneratedRecord } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const TeacherPage3BatchReview: React.FC = () => {
  const navigate = useNavigate();
  const { state, setGeneratedRecord } = useTeacher();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!state.basicInfo || state.students.length === 0) {
      navigate('/teacher/students');
    }
  }, [state.basicInfo, state.students, navigate]);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">생기부 일괄 생성</h1>
            <p className="text-gray-600">
              {studentsWithActivities.length}명의 학생 생기부를 생성합니다
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 생성 버튼 */}
            {state.generatedRecords.length === 0 && (
              <div className="text-center py-12">
                {!generating ? (
                  <>
                    <p className="text-lg text-gray-700 mb-6">
                      {studentsWithActivities.length}명의 학생 생기부를 AI로 생성합니다
                    </p>
                    <button
                      onClick={handleGenerateAll}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all"
                    >
                      🚀 전체 생성 시작
                    </button>
                  </>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="w-32 h-32 mx-auto border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                      생성 중... {progress.current} / {progress.total}
                    </p>
                    <p className="text-sm text-gray-600">
                      잠시만 기다려주세요
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 생성 결과 목록 */}
            {state.generatedRecords.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    생성 결과 ({state.generatedRecords.length}명)
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/teacher/comparison')}
                      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                    >
                      📊 합격자 비교 분석
                    </button>
                    <button
                      onClick={handleGenerateAll}
                      disabled={generating}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      🔄 재생성
                    </button>
                    <button
                      onClick={handleExportAll}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
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
                      <div key={record.studentId} className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{record.studentName}</h3>
                            {student?.classNumber && (
                              <p className="text-sm text-gray-600">{student.classNumber}</p>
                            )}
                            {student?.desiredMajor && (
                              <p className="text-sm text-purple-600">🎯 {student.desiredMajor}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!isEditing ? (
                              <button
                                onClick={() => setEditingStudentId(record.studentId)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                              >
                                ✏️ 수정
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(record.studentId)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
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
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                                >
                                  취소
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <textarea
                            value={displayText}
                            onChange={(e) => handleTextEdit(record.studentId, e.target.value)}
                            rows={10}
                            className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          />
                        ) : (
                          <div className="p-4 bg-white border border-gray-300 rounded-lg">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{displayText}</p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                          <span>{displayText.length}자</span>
                          {record.generatedRecord.updatedAt && (
                            <span className="text-xs">수정됨: {new Date(record.generatedRecord.updatedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* 하단 네비게이션 */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                ← 이전 단계
              </button>
              {state.generatedRecords.length > 0 && (
                <button
                  onClick={() => navigate('/teacher/basic')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  처음으로 →
                </button>
              )}
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default TeacherPage3BatchReview;
