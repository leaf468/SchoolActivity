import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';
import {
  getMyProfile,
  updateMyProfile,
  getMyTodos,
  createTodo as createTodoSupabase,
  toggleTodo as toggleTodoSupabase,
  deleteTodo as deleteTodoSupabase,
  getMyTeacherSessions,
  deleteTeacherSession,
  TeacherSessionRecord,
} from '../supabase';
import type { Todo as TodoType } from '../supabase/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import CustomCheckbox from '../components/ui/CustomCheckbox';

const TeacherMyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest } = useAuth();
  const { restoreSession } = useTeacher();
  const [sessions, setSessions] = useState<TeacherSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // School info (선생님용)
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState(''); // 담당 과목
  const [grade, setGrade] = useState(''); // 담당 학년 (여러 학년 가능)

  // Todo & Calendar
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Auth modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // 세션 필터링
  const [sessionFilter, setSessionFilter] = useState<'all' | 'subject' | 'autonomy' | 'club' | 'career' | 'behavior'>('all');
  const [sessionSearch, setSessionSearch] = useState('');

  // 선택된 세션들 (일괄 작업용)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  const fetchSessions = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getMyTeacherSessions();

      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        console.error('세션 조회 실패:', result.error);
        setSessions([]);
      }
    } catch (err: any) {
      console.error('세션 조회 중 오류:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTodos = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getMyTodos();

      if (result.success && result.data) {
        setTodos(result.data);
      } else {
        console.error('할 일 조회 실패:', result.error);
        setTodos([]);
      }
    } catch (err: any) {
      console.error('할 일 조회 중 오류:', err);
      setTodos([]);
    }
  }, [user?.id]);

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getMyProfile();

      if (result.success && result.data) {
        const profile = result.data;
        setSchool(profile.school || '');
        setGrade(profile.grade || '');
        setSubject(profile.semester || '');
      } else {
        console.error('프로필 조회 실패:', result.error);
      }
    } catch (err: any) {
      console.error('프로필 조회 중 오류:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
      fetchTodos();
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchSessions, fetchTodos, fetchProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const result = await updateMyProfile({
        school,
        grade,
        semester: subject,
      });

      if (result.success) {
        setIsEditing(false);
        alert('프로필이 저장되었습니다.');
      } else {
        alert('프로필 저장 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('프로필 저장 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const result = await createTodoSupabase({
        text: newTodo,
        done: false,
        due_date: selectedDate.toISOString(),
      });

      if (result.success && result.data) {
        setTodos([...todos, result.data]);
        setNewTodo('');
        setShowDatePicker(false);
      } else {
        alert('할 일 추가 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('할 일 추가 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const result = await toggleTodoSupabase(id);

      if (result.success && result.data) {
        setTodos(todos.map((t) => (t.id === id ? result.data : t)));
      } else {
        alert('할 일 상태 변경 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('할 일 상태 변경 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const result = await deleteTodoSupabase(id);

      if (result.success) {
        setTodos(todos.filter((t) => t.id !== id));
      } else {
        alert('할 일 삭제 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('할 일 삭제 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleDelete = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!window.confirm('이 세션을 삭제하시겠습니까?')) return;

    try {
      const result = await deleteTeacherSession(sessionId);

      if (result.success) {
        setSessions(sessions.filter((s) => s.session_id !== sessionId));
        setSelectedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      } else {
        alert('삭제 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('삭제 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSessions.size === 0) return;
    if (!window.confirm(`선택된 ${selectedSessions.size}개 세션을 삭제하시겠습니까?`)) return;

    const sessionIds = Array.from(selectedSessions);
    for (let i = 0; i < sessionIds.length; i++) {
      try {
        await deleteTeacherSession(sessionIds[i]);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    setSessions(sessions.filter(s => !selectedSessions.has(s.session_id)));
    setSelectedSessions(new Set());
  };

  const handleViewSession = async (sessionId: string) => {
    try {
      await restoreSession(sessionId);
      navigate('/teacher/review');
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('세션 불러오기 실패');
    }
  };

  const toggleSessionSelection = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const selectAllSessions = () => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.session_id)));
    }
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.due_date) return false;
      const todoDate = new Date(todo.due_date);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const todosForDate = getTodosForDate(date);
      if (todosForDate.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  // 필터링된 세션
  const filteredSessions = sessions.filter(session => {
    // 타입 필터
    if (sessionFilter !== 'all' && session.section_type !== sessionFilter) {
      return false;
    }
    // 검색 필터
    if (sessionSearch) {
      const search = sessionSearch.toLowerCase();
      return (
        session.title?.toLowerCase().includes(search) ||
        session.subject?.toLowerCase().includes(search) ||
        `${session.grade}학년`.includes(search)
      );
    }
    return true;
  });

  // 통계
  const stats = {
    total: sessions.length,
    subject: sessions.filter(s => s.section_type === 'subject').length,
    autonomy: sessions.filter(s => s.section_type === 'autonomy').length,
    club: sessions.filter(s => s.section_type === 'club').length,
    career: sessions.filter(s => s.section_type === 'career').length,
    behavior: sessions.filter(s => s.section_type === 'behavior').length,
    totalStudents: sessions.reduce((acc, s) => acc + (s.student_count || 0), 0),
  };

  // 섹션 타입 라벨
  const getSectionLabel = (sectionType: string) => {
    switch (sectionType) {
      case 'subject': return '교과세특';
      case 'autonomy': return '자율활동';
      case 'club': return '동아리';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return sectionType;
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'subject': return '📚';
      case 'autonomy': return '🎯';
      case 'club': return '🏃';
      case 'career': return '🚀';
      case 'behavior': return '💫';
      default: return '📋';
    }
  };

  const getSectionColor = (sectionType: string) => {
    switch (sectionType) {
      case 'subject': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'autonomy': return 'bg-green-100 text-green-700 border-green-200';
      case 'club': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'career': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'behavior': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isAuthenticated || isGuest) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center border border-gray-200"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-sm text-gray-500 mb-6">
              선생님용 마이페이지는 로그인 후 이용할 수 있습니다
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
              >
                로그인하기
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition"
              >
                홈으로 돌아가기
              </button>
            </div>
          </motion.div>
        </div>

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSwitchToSignup={() => {
              setShowLoginModal(false);
              setShowSignupModal(true);
            }}
          />
        )}

        {showSignupModal && (
          <SignupModal
            onClose={() => setShowSignupModal(false)}
            onSwitchToLogin={() => {
              setShowSignupModal(false);
              setShowLoginModal(true);
            }}
          />
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const todosForSelectedDate = getTodosForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <CommonHeader />

      <div className="flex-1 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-2">
                  <span>👨‍🏫</span>
                  <span>선생님 모드</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
                <p className="text-gray-600 mt-1">작성한 생기부 세션을 관리하고 일정을 확인하세요</p>
              </div>
              <button
                onClick={() => navigate('/teacher/basic')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition flex items-center gap-2"
              >
                <span>+</span>
                새 생기부 작성
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-600">전체 세션</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</p>
              <p className="text-xs text-gray-600">전체 학생</p>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{stats.subject}</p>
              <p className="text-xs text-gray-600">📚 교과세특</p>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{stats.autonomy}</p>
              <p className="text-xs text-gray-600">🎯 자율활동</p>
            </div>
            <div className="bg-white rounded-xl border border-purple-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stats.club}</p>
              <p className="text-xs text-gray-600">🏃 동아리</p>
            </div>
            <div className="bg-white rounded-xl border border-orange-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-orange-600">{stats.career}</p>
              <p className="text-xs text-gray-600">🚀 진로활동</p>
            </div>
            <div className="bg-white rounded-xl border border-pink-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-pink-600">{stats.behavior}</p>
              <p className="text-xs text-gray-600">💫 행동특성</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 세션 목록 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 세션 카드 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <span>📋</span>
                      작성 세션 관리
                    </h2>
                    {selectedSessions.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition"
                      >
                        선택 삭제 ({selectedSessions.size})
                      </button>
                    )}
                  </div>

                  {/* 필터 및 검색 */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: '전체' },
                        { key: 'subject', label: '📚 교과' },
                        { key: 'autonomy', label: '🎯 자율' },
                        { key: 'club', label: '🏃 동아리' },
                        { key: 'career', label: '🚀 진로' },
                        { key: 'behavior', label: '💫 행동' },
                      ].map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => setSessionFilter(filter.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            sessionFilter === filter.key
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      placeholder="검색..."
                      className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-5">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📝</div>
                      <p className="text-gray-500 mb-4">아직 작성된 세션이 없습니다</p>
                      <button
                        onClick={() => navigate('/teacher/basic')}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                      >
                        생기부 작성하기
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 전체 선택 */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                        <CustomCheckbox
                          checked={selectedSessions.size === filteredSessions.length && filteredSessions.length > 0}
                          onChange={selectAllSessions}
                          label={`전체 선택 (${filteredSessions.length}개)`}
                          size="sm"
                        />
                      </div>

                      {/* 세션 카드 목록 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSessions.map((session) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                              selectedSessions.has(session.session_id)
                                ? 'border-indigo-400 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:border-indigo-200'
                            }`}
                            onClick={() => handleViewSession(session.session_id)}
                          >
                            {/* 체크박스 */}
                            <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                              <CustomCheckbox
                                checked={selectedSessions.has(session.session_id)}
                                onChange={() => {
                                  setSelectedSessions(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(session.session_id)) {
                                      newSet.delete(session.session_id);
                                    } else {
                                      newSet.add(session.session_id);
                                    }
                                    return newSet;
                                  });
                                }}
                                size="sm"
                              />
                            </div>

                            {/* 세션 타입 뱃지 */}
                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border mb-3 ${getSectionColor(session.section_type || '')}`}>
                              <span>{getSectionIcon(session.section_type || '')}</span>
                              <span>{getSectionLabel(session.section_type || '')}</span>
                            </div>

                            {/* 제목 */}
                            <h3 className="font-bold text-gray-900 mb-2 pr-8">
                              {session.title || `${session.grade}학년 ${session.semester}학기`}
                            </h3>

                            {/* 상세 정보 */}
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <span>📅</span>
                                <span>{session.grade}학년 {session.semester}학기</span>
                              </div>
                              {session.subject && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span>📖</span>
                                  <span>{session.subject}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                <span>👨‍🎓</span>
                                <span>학생 {session.student_count}명</span>
                              </div>
                            </div>

                            {/* 생성일 및 삭제 버튼 */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {new Date(session.created_at).toLocaleDateString('ko-KR')}
                              </span>
                              <button
                                onClick={(e) => handleDelete(session.session_id, e)}
                                className="text-xs text-gray-400 hover:text-red-600 transition"
                              >
                                삭제
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 우측: 프로필 + 캘린더 + 할일 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 프로필 카드 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>👤</span>
                    프로필
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium"
                    >
                      편집
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">학교명</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      disabled={!isEditing}
                      placeholder="학교명 입력"
                      className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">담당 과목</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={!isEditing}
                      placeholder="예: 국어, 수학"
                      className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">담당 학년</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      disabled={!isEditing}
                      placeholder="예: 1학년, 전체"
                      className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 캘린더 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>📅</span>
                    캘린더
                  </h2>
                </div>
                <div className="p-4">
                  <div className="calendar-wrapper teacher-calendar">
                    <Calendar
                      onChange={(value) => setSelectedDate(value as Date)}
                      value={selectedDate}
                      locale="ko-KR"
                      tileContent={tileContent}
                      className="border-0 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 할 일 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>✅</span>
                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 할 일
                  </h2>
                </div>
                <div className="p-4">
                  {/* 할 일 추가 */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                      placeholder="할 일 입력"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={addTodo}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                      추가
                    </button>
                  </div>

                  {/* 할 일 목록 */}
                  {todosForSelectedDate.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">이 날짜에는 할 일이 없습니다</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {todosForSelectedDate.map((todo) => (
                        <div key={todo.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CustomCheckbox
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                            size="sm"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              todo.done ? 'line-through text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            {todo.text}
                          </span>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-600 text-xs transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommonFooter />

      <style>{`
        .calendar-wrapper .react-calendar {
          border: none;
          font-family: inherit;
          width: 100%;
        }
        .calendar-wrapper .react-calendar__tile {
          padding: 0.75em 0.5em;
          font-size: 0.8rem;
        }
        .teacher-calendar .react-calendar__tile--active {
          background: #4f46e5;
          color: white;
          border-radius: 0.5rem;
        }
        .calendar-wrapper .react-calendar__tile--now {
          background: #eef2ff;
          border-radius: 0.5rem;
        }
        .calendar-wrapper .react-calendar__tile:enabled:hover {
          background: #e0e7ff;
          border-radius: 0.5rem;
        }
        .calendar-wrapper .react-calendar__navigation button {
          font-size: 0.9rem;
          font-weight: 600;
          min-width: 40px;
        }
        .calendar-wrapper .react-calendar__month-view__weekdays {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .calendar-wrapper .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default TeacherMyPage;
