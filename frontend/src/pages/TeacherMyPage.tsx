import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

const TeacherMyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
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
        // For teachers, we can use grade and semester fields differently
        setGrade(profile.grade || '');
        setSubject(profile.semester || ''); // Using semester field for subject
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
        grade, // 담당 학년
        semester: subject, // Using semester field for subject
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
      } else {
        alert('삭제 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('삭제 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleViewSession = async (sessionId: string) => {
    try {
      await restoreSession(sessionId);
      // Navigate to review page to view/edit the session
      navigate('/teacher/review');
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('세션 불러오기 실패');
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
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  if (!isAuthenticated || isGuest) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-sm text-gray-500 mb-6">
              선생님용 마이페이지는 로그인 후 이용할 수 있습니다
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg transition-colors"
              >
                로그인하기
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const todosForSelectedDate = getTodosForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">선생님 마이페이지</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">프로필 정보</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">학교명</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={!isEditing}
                placeholder="학교명 입력"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-600 ${
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
                placeholder="예: 국어, 수학, 영어"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-600 ${
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
                placeholder="예: 1학년, 2학년, 전체"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-600 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Calendar & Todos Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Todo Management */}
          <div className="space-y-6">
            {/* Add Todo */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">할 일 추가</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">할 일</label>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="할 일을 입력하세요"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">마감일</label>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-left hover:bg-gray-50"
                  >
                    {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월{' '}
                    {selectedDate.getDate()}일
                  </button>
                </div>
                <button
                  onClick={addTodo}
                  className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Selected Date Todos */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 할 일
              </h3>
              {todosForSelectedDate.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">이 날짜에는 할 일이 없습니다</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {todosForSelectedDate.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                        className="rounded border-gray-300"
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
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Calendar */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">캘린더</h3>
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

        {/* Records Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">작성 기록</h3>
            <button
              onClick={() => (window.location.href = '/teacher/basic')}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새로운 생활기록부 작성하기
            </button>
          </div>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 mb-4">아직 작성된 세션이 없습니다</p>
              <button
                onClick={() => (window.location.href = '/teacher/basic')}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                생기부 작성하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleViewSession(session.session_id)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{session.title || '제목 없음'}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(session.session_id, e)}
                      className="text-xs text-gray-400 hover:text-red-600 ml-2 z-10"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {session.grade}학년 {session.semester}학기
                    </p>
                    {session.subject && (
                      <p className="text-sm text-gray-600">과목: {session.subject}</p>
                    )}
                    <p className="text-sm text-purple-600 font-medium">
                      학생 {session.student_count}명
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    클릭하여 상세보기
                  </div>
                </div>
              ))}
            </div>
          )}
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
          padding: 1em 0.5em;
          font-size: 0.875rem;
          aspect-ratio: 1;
        }
        .teacher-calendar .react-calendar__tile--active {
          background: #9333ea;
          color: white;
        }
        .calendar-wrapper .react-calendar__tile--now {
          background: #f3f4f6;
        }
        .calendar-wrapper .react-calendar__tile:enabled:hover {
          background: #faf5ff;
        }
        .calendar-wrapper .react-calendar__navigation button {
          font-size: 1rem;
          font-weight: 600;
          min-width: 44px;
        }
        .calendar-wrapper .react-calendar__month-view__weekdays {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          border-bottom: none;
        }
        .calendar-wrapper .react-calendar__month-view__weekdays__weekday {
          border-bottom: none;
        }
        .calendar-wrapper .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default TeacherMyPage;
