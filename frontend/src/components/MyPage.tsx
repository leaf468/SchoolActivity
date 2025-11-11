import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  getMyTodos,
  createTodo as createTodoSupabase,
  updateTodo as updateTodoSupabase,
  toggleTodo as toggleTodoSupabase,
  deleteTodo as deleteTodoSupabase,
  getMyActivityRecords,
  deleteActivityRecord,
} from '../supabase';
import type { ActivityRecord, Todo as TodoType, UserProfile } from '../supabase/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import CommonFooter from './CommonFooter';
import RecordDetailModal from './RecordDetailModal';
import { getUniversitySlogan } from '../data/universitySlogans';

const MyPage: React.FC = () => {
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // School info
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('1');
  const [semester, setSemester] = useState('1');

  // Goal info
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [universitySlogan, setUniversitySlogan] = useState('');

  // Todo & Calendar
  const [todos, setTodos] = useState<TodoType[]>([]);
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
        setGrade(profile.grade || '1');
        setSemester(profile.semester || '1');
        setTargetUniversity(profile.target_university || '');
        setTargetMajor(profile.target_major || '');
        setUniversitySlogan(profile.university_slogan || '');
      } else {
        console.error('프로필 조회 실패:', result.error);
      }
    } catch (err: any) {
      console.error('프로필 조회 중 오류:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecords();
      fetchTodos();
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchRecords, fetchTodos, fetchProfile]);

  const handleUniversityChange = (value: string) => {
    setTargetUniversity(value);
    // Auto-fill slogan if available
    const slogan = getUniversitySlogan(value);
    if (slogan) {
      setUniversitySlogan(slogan);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const result = await updateMyProfile({
        school,
        grade,
        semester,
        target_university: targetUniversity,
        target_major: targetMajor,
        university_slogan: universitySlogan,
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

  const handleDelete = async (recordId: string, e?: React.MouseEvent) => {
    // 이벤트 버블링 방지
    if (e) {
      e.stopPropagation();
    }

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

  const handleRecordUpdate = (updatedRecord: ActivityRecord) => {
    // 기록 목록 업데이트
    setRecords(records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
    // 현재 선택된 기록도 업데이트 (모달에서 즉시 반영되도록)
    if (selectedRecord && selectedRecord.id === updatedRecord.id) {
      setSelectedRecord(updatedRecord);
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
      if (!todo.due_date) return false;
      const todoDate = new Date(todo.due_date);
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">현재 정보</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  편집
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // 취소 시 원래 데이터로 복원
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">학교</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  disabled={!isEditing}
                  placeholder="학교명 입력"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">학년</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
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
                    onChange={(e) => setSemester(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
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
                    onChange={(e) => {
                      if (isEditing) {
                        handleUniversityChange(e.target.value);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="예: 서울대학교"
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">목표 학과</label>
                  <input
                    type="text"
                    value={targetMajor}
                    onChange={(e) => setTargetMajor(e.target.value)}
                    disabled={!isEditing}
                    placeholder="예: 컴퓨터공학과"
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">학교 슬로건</label>
                <textarea
                  value={universitySlogan}
                  onChange={(e) => setUniversitySlogan(e.target.value)}
                  disabled={!isEditing}
                  placeholder="목표 대학의 슬로건이나 비전 입력"
                  rows={2}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 resize-none ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
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
                  onClick={() => setSelectedRecord(record)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{record.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="text-xs text-gray-400 hover:text-red-600 ml-2 z-10"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {record.final_text || record.generated_draft || record.activity_summary || '내용 없음'}
                  </p>
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

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleRecordUpdate}
        />
      )}

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
