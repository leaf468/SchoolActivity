import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  getMyTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getMyActivityRecords,
  deleteActivityRecord,
} from '../supabase';
import type { ActivityRecord, Todo as TodoType, UserProfile } from '../supabase/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import CommonFooter from './CommonFooter';
import { getUniversitySlogan } from '../data/universitySlogans';

// 로컬 Todo 인터페이스 (호환성 유지)
interface Todo {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
}

const MyPage: React.FC = () => {
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // School info
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('1');
  const [semester, setSemester] = useState('1');

  // Goal info
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [universitySlogan, setUniversitySlogan] = useState('');

  // Todo & Calendar
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Auth modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const fetchRecords = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getMyActivityRecords();

      if (result.success && result.data) {
        setRecords(result.data);
      } else {
        console.error('활동 기록 조회 실패:', result.error);
        setRecords([]);
      }
    } catch (err: any) {
      console.error('활동 기록 조회 중 오류:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecords();

      // Load school info
      const saved = localStorage.getItem(`user_${user.id}_info`);
      if (saved) {
        const data = JSON.parse(saved);
        setSchool(data.school || '');
        setGrade(data.grade || '1');
        setSemester(data.semester || '1');
        setTargetUniversity(data.targetUniversity || '');
        setTargetMajor(data.targetMajor || '');
        setUniversitySlogan(data.universitySlogan || '');
      }

      // Load todos
      const savedTodos = localStorage.getItem(`user_${user.id}_todos`);
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchRecords]);

  const handleUniversityChange = (value: string) => {
    setTargetUniversity(value);
    // Auto-fill slogan if available
    const slogan = getUniversitySlogan(value);
    if (slogan) {
      setUniversitySlogan(slogan);
    }
  };

  const saveUserInfo = () => {
    if (user) {
      localStorage.setItem(`user_${user.id}_info`, JSON.stringify({
        school,
        grade,
        semester,
        targetUniversity,
        targetMajor,
        universitySlogan,
      }));
    }
  };

  const saveTodos = (newTodos: Todo[]) => {
    if (user) {
      localStorage.setItem(`user_${user.id}_todos`, JSON.stringify(newTodos));
      setTodos(newTodos);
    }
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const updated = [
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo,
        done: false,
        dueDate: selectedDate.toISOString(),
      },
    ];
    saveTodos(updated);
    setNewTodo('');
    setShowDatePicker(false);
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const handleDelete = async (recordId: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;

    try {
      const result = await deleteActivityRecord(recordId);

      if (result.success) {
        setRecords(records.filter((r) => r.id !== recordId));
      } else {
        alert('삭제 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      alert('삭제 실패: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      alert('로그아웃 실패');
    }
  };

  // Get todos for specific date
  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if date has todos
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const todosForDate = getTodosForDate(date);
      if (todosForDate.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-sm text-gray-500 mb-6">
              마이페이지는 로그인 후 이용할 수 있습니다
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg transition-colors"
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
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const todosForSelectedDate = getTodosForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => (window.location.href = '/')}
              className="text-lg font-semibold text-gray-900"
            >
              SchoolActivity
            </button>

            {targetUniversity && (
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm font-medium text-gray-900">{targetUniversity} {targetMajor && `· ${targetMajor}`}</p>
                {universitySlogan && (
                  <p className="text-xs text-gray-500 mt-0.5">{universitySlogan}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
              <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-900">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* School Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">현재 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">학교</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  onBlur={saveUserInfo}
                  placeholder="학교명 입력"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">학년</label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      saveUserInfo();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">학기</label>
                  <select
                    value={semester}
                    onChange={(e) => {
                      setSemester(e.target.value);
                      saveUserInfo();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="1">1학기</option>
                    <option value="2">2학기</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">목표</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">목표 대학교</label>
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => handleUniversityChange(e.target.value)}
                    onBlur={saveUserInfo}
                    placeholder="예: 서울대학교"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">목표 학과</label>
                  <input
                    type="text"
                    value={targetMajor}
                    onChange={(e) => setTargetMajor(e.target.value)}
                    onBlur={saveUserInfo}
                    placeholder="예: 컴퓨터공학과"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">학교 슬로건</label>
                <textarea
                  value={universitySlogan}
                  onChange={(e) => setUniversitySlogan(e.target.value)}
                  onBlur={saveUserInfo}
                  placeholder="목표 대학의 슬로건이나 비전 입력"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 resize-none"
                />
              </div>
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900"
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
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
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
                        onClick={() => deleteTodo(todo.id)}
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
            <div className="calendar-wrapper">
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
          <h3 className="font-semibold text-gray-900 mb-4">작성 기록</h3>
          {records.length === 0 ? (
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
              <p className="text-sm text-gray-500 mb-4">아직 작성된 기록이 없습니다</p>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
              >
                생기부 작성하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{record.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-xs text-gray-400 hover:text-red-600 ml-2"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {record.final_text || record.generated_draft || record.activity_summary || '내용 없음'}
                  </p>
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
        .calendar-wrapper .react-calendar__tile--active {
          background: #111827;
          color: white;
        }
        .calendar-wrapper .react-calendar__tile--now {
          background: #f3f4f6;
        }
        .calendar-wrapper .react-calendar__tile:enabled:hover {
          background: #e5e7eb;
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
        }
        .calendar-wrapper .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default MyPage;
