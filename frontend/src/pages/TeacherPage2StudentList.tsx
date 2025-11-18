import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../contexts/TeacherContext';
import { TeacherStudentInfo, MajorTrack, SingleActivity, ActivityDetails } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const TeacherPage2StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { state, addStudent, removeStudent, setStudentActivity, setCurrentStep } = useTeacher();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentEditingStudent, setCurrentEditingStudent] = useState<string | null>(null);

  // 학생 추가 폼
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    classNumber: '',
    desiredMajor: '',
    track: '상경계열' as MajorTrack,
  });

  // 활동 입력 폼
  const [activityForm, setActivityForm] = useState<SingleActivity[]>([
    { id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }
  ]);
  const [activityKeywordInput, setActivityKeywordInput] = useState('');
  const [overallEmphasis, setOverallEmphasis] = useState('');
  const [overallKeywords, setOverallKeywords] = useState<string[]>([]);
  const [overallKeywordInput, setOverallKeywordInput] = useState('');

  const handleAddStudent = () => {
    if (!newStudentForm.name.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const newStudent: TeacherStudentInfo = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newStudentForm.name,
      classNumber: newStudentForm.classNumber || undefined,
      desiredMajor: newStudentForm.desiredMajor || undefined,
      track: newStudentForm.desiredMajor ? newStudentForm.track : undefined,
    };

    addStudent(newStudent);
    setNewStudentForm({
      name: '',
      classNumber: '',
      desiredMajor: '',
      track: '상경계열',
    });
    setShowAddModal(false);
  };

  const handleOpenActivityModal = (studentId: string) => {
    setCurrentEditingStudent(studentId);

    // 기존 활동 데이터 로드 (있으면)
    const existingActivity = state.studentActivities.find(a => a.studentId === studentId);
    if (existingActivity) {
      const details = existingActivity.activityDetails;
      if ('activities' in details) {
        setActivityForm(details.activities);
        setOverallEmphasis(details.overallEmphasis || '');
        setOverallKeywords(details.overallKeywords || []);
      }
    } else {
      // 초기화
      setActivityForm([{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }]);
      setOverallEmphasis('');
      setOverallKeywords([]);
    }

    setShowActivityModal(true);
  };

  const handleSaveActivity = () => {
    if (!currentEditingStudent) return;

    const hasContent = activityForm.some(a => a.content.trim().length > 0);
    if (!hasContent) {
      alert('최소 1개 활동의 내용을 입력해주세요.');
      return;
    }

    const student = state.students.find(s => s.id === currentEditingStudent);
    if (!student) return;

    let activityDetails: ActivityDetails;

    switch (state.basicInfo?.sectionType) {
      case 'subject':
        activityDetails = {
          subject: state.basicInfo.subject || '',
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'club':
        activityDetails = {
          clubName: overallEmphasis || '동아리',
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'autonomy':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'career':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 700,
        };
        break;
      case 'behavior':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      default:
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
    }

    setStudentActivity({
      studentId: currentEditingStudent,
      studentName: student.name,
      activityDetails,
      emphasisKeywords: overallKeywords,
    });

    setShowActivityModal(false);
    setCurrentEditingStudent(null);
  };

  const addActivity = () => {
    setActivityForm([
      ...activityForm,
      { id: Date.now().toString(), period: '', role: '', content: '', learnings: '', keywords: [] }
    ]);
  };

  const removeActivity = (id: string) => {
    if (activityForm.length > 1) {
      setActivityForm(activityForm.filter(a => a.id !== id));
    }
  };

  const updateActivity = (id: string, field: keyof SingleActivity, value: string | string[]) => {
    setActivityForm(activityForm.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addKeywordToActivity = (activityId: string, keyword: string) => {
    if (!keyword.trim()) return;
    setActivityForm(activityForm.map(a => {
      if (a.id === activityId) {
        const currentKeywords = a.keywords || [];
        if (currentKeywords.includes(keyword.trim())) {
          return { ...a, keywords: currentKeywords.filter(k => k !== keyword.trim()) };
        } else {
          return { ...a, keywords: [...currentKeywords, keyword.trim()] };
        }
      }
      return a;
    }));
  };

  const removeKeywordFromActivity = (activityId: string, keyword: string) => {
    setActivityForm(activityForm.map(a =>
      a.id === activityId
        ? { ...a, keywords: (a.keywords || []).filter(k => k !== keyword) }
        : a
    ));
  };

  const addOverallKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    if (overallKeywords.includes(keyword.trim())) {
      setOverallKeywords(overallKeywords.filter(k => k !== keyword.trim()));
    } else {
      setOverallKeywords([...overallKeywords, keyword.trim()]);
    }
  };

  const handleNext = () => {
    if (state.students.length === 0) {
      alert('최소 1명의 학생을 추가해주세요.');
      return;
    }

    const studentsWithoutActivities = state.students.filter(
      s => !state.studentActivities.find(a => a.studentId === s.id)
    );

    if (studentsWithoutActivities.length > 0) {
      const names = studentsWithoutActivities.map(s => s.name).join(', ');
      const confirm = window.confirm(
        `${names} 학생의 활동이 입력되지 않았습니다.\n그래도 계속하시겠습니까?`
      );
      if (!confirm) return;
    }

    setCurrentStep('review');
    navigate('/teacher/review');
  };

  const handlePrev = () => {
    navigate('/teacher/basic');
  };

  const hasActivityData = (studentId: string): boolean => {
    return state.studentActivities.some(a => a.studentId === studentId);
  };

  useEffect(() => {
    if (!state.basicInfo) {
      navigate('/teacher/basic');
    }
  }, [state.basicInfo, navigate]);

  if (!state.basicInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      <CommonHeader />

      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              👨‍🏫 선생님 모드 - 학생 관리
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">학생 목록 및 활동 입력</h1>
            <p className="text-lg text-gray-600">
              {state.basicInfo.grade}학년 {state.basicInfo.semester}학기 -{' '}
              {state.basicInfo.sectionType === 'subject' ? `${state.basicInfo.subject} 교과세특` :
               state.basicInfo.sectionType === 'autonomy' ? '자율활동' :
               state.basicInfo.sectionType === 'club' ? '동아리활동' :
               state.basicInfo.sectionType === 'career' ? '진로활동' : '행동특성'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 학생 추가 버튼 */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">학생 목록</h2>
                <p className="text-sm text-purple-600 mt-1">{state.students.length}명의 학생이 등록되었습니다</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
              >
                <span className="text-xl font-bold">+</span> 학생 추가
              </button>
            </div>

            {/* 학생 목록 */}
            {state.students.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300">
                <div className="text-6xl mb-4">👨‍🎓</div>
                <p className="text-gray-700 text-xl font-semibold mb-2">아직 추가된 학생이 없습니다</p>
                <p className="text-gray-500 mb-6">학생을 추가하여 시작하세요</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                >
                  첫 학생 추가하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-6 border-2 rounded-2xl transition-all hover:shadow-lg ${
                      hasActivityData(student.id)
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-purple-200 bg-gradient-to-br from-white to-purple-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                          {hasActivityData(student.id) && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">완료</span>
                          )}
                        </div>
                        {student.classNumber && (
                          <p className="text-sm text-gray-600 mb-1">{student.classNumber}</p>
                        )}
                        {student.desiredMajor && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-purple-600 font-semibold text-sm">🎯 {student.desiredMajor}</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="text-purple-500 text-sm">{student.track}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:text-red-700"
                        title="학생 삭제"
                      >
                        <span className="text-2xl font-bold">×</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenActivityModal(student.id)}
                      className={`w-full py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
                        hasActivityData(student.id)
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {hasActivityData(student.id) ? '✓ 활동 수정하기' : '📝 활동 입력하기'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 하단 네비게이션 */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-gray-100">
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                ← 이전 단계
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all"
              >
                다음: 일괄 생성 →
              </button>
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600 shadow-md"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* 학생 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">학생 추가</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  학생 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  반/번호 <span className="text-gray-400">(선택)</span>
                </label>
                <input
                  type="text"
                  value={newStudentForm.classNumber}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, classNumber: e.target.value })}
                  placeholder="예: 3반 12번"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  희망 진로/전공 <span className="text-gray-400">(선택)</span>
                </label>
                <input
                  type="text"
                  value={newStudentForm.desiredMajor}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, desiredMajor: e.target.value })}
                  placeholder="예: 경영학과, 컴퓨터공학과"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {newStudentForm.desiredMajor && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">계열</label>
                  <select
                    value={newStudentForm.track}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, track: e.target.value as MajorTrack })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="상경계열">상경계열</option>
                    <option value="공학계열">공학계열</option>
                    <option value="인문사회계열">인문사회계열</option>
                    <option value="자연과학계열">자연과학계열</option>
                    <option value="의생명계열">의생명계열</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 활동 입력 모달 */}
      {showActivityModal && currentEditingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {state.students.find(s => s.id === currentEditingStudent)?.name} - 활동 입력
                </h2>
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setCurrentEditingStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 활동 목록 */}
              {activityForm.map((activity, index) => (
                <div key={activity.id} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">활동 {index + 1}</h3>
                    </div>
                    {activityForm.length > 1 && (
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition-all"
                      >
                        삭제 ×
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        활동 기간 <span className="text-gray-400">(선택)</span>
                      </label>
                      <input
                        type="text"
                        value={activity.period || ''}
                        onChange={(e) => updateActivity(activity.id, 'period', e.target.value)}
                        placeholder="예: 2024.03~06"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        활동 내용 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={activity.content}
                        onChange={(e) => updateActivity(activity.id, 'content', e.target.value)}
                        placeholder="구체적 활동 내용"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        깨달은 바 <span className="text-gray-400">(선택)</span>
                      </label>
                      <textarea
                        value={activity.learnings || ''}
                        onChange={(e) => updateActivity(activity.id, 'learnings', e.target.value)}
                        placeholder="배운 점, 성장"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">키워드</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={activityKeywordInput}
                          onChange={(e) => setActivityKeywordInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addKeywordToActivity(activity.id, activityKeywordInput);
                              setActivityKeywordInput('');
                            }
                          }}
                          placeholder="키워드 입력 (Enter)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => {
                            addKeywordToActivity(activity.id, activityKeywordInput);
                            setActivityKeywordInput('');
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm"
                        >
                          추가
                        </button>
                      </div>
                      {activity.keywords && activity.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activity.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm flex items-center gap-2">
                              {kw}
                              <button onClick={() => removeKeywordFromActivity(activity.id, kw)} className="font-bold">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addActivity}
                className="w-full py-4 border-2 border-dashed border-purple-300 text-purple-700 rounded-2xl hover:bg-purple-50 font-bold text-lg transition-all"
              >
                + 활동 추가
              </button>

              {/* 전체 강조사항 */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">전체 강조사항</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">강조 내용</label>
                    <textarea
                      value={overallEmphasis}
                      onChange={(e) => setOverallEmphasis(e.target.value)}
                      placeholder="전체적으로 강조하고 싶은 점"
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">강조 키워드</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={overallKeywordInput}
                        onChange={(e) => setOverallKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addOverallKeyword(overallKeywordInput);
                            setOverallKeywordInput('');
                          }
                        }}
                        placeholder="키워드 입력 (Enter)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          addOverallKeyword(overallKeywordInput);
                          setOverallKeywordInput('');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                      >
                        추가
                      </button>
                    </div>
                    {overallKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {overallKeywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-2">
                            {kw}
                            <button onClick={() => setOverallKeywords(overallKeywords.filter(k => k !== kw))} className="font-bold">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 shadow-lg">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setCurrentEditingStudent(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveActivity}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg transition-all"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommonFooter />
    </div>
  );
};

export default TeacherPage2StudentList;
