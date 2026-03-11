import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { trackMainPageVisit, trackButtonClick } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import InitialAuthPopup from '../components/InitialAuthPopup';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, userMode, setUserMode } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    trackMainPageVisit();
  }, []);

  // Auto-redirect authenticated users to their MyPage
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      const redirectPath = userMode === 'teacher' ? '/teacher/mypage' : '/mypage';
      navigate(redirectPath);
    }
  }, [isAuthenticated, isGuest, userMode, navigate]);

  const handleGetStarted = (mode: 'student' | 'teacher') => {
    trackButtonClick(mode === 'student' ? '학생용_시작' : '선생님용_시작', 'Landing');

    // Set user mode
    setUserMode(mode);
    setSelectedMode(mode);

    // Show auth popup
    setShowAuthPopup(true);
  };

  const handleAuthPopupClose = () => {
    setShowAuthPopup(false);
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">생기부 Office</h1>
                <p className="text-xs text-gray-500">sgboffice.org</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">선생님을 위한 생기부 작성 도구</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm font-semibold text-indigo-700">교사 전용 AI 생기부 작성 시스템</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
            생기부 작성,<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              전문 도구로 해결하세요
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            한 과목의 여러 학생 생기부를 일괄 생성하고 관리하세요.<br />
            <span className="font-medium text-gray-900">AI 기반 자동 생성 + 일괄 관리 시스템</span>으로 업무 효율을 극대화합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              <DocumentTextIcon className="w-7 h-7 mr-3" />
              선생님용 시작하기
            </motion.button>
          </div>

          <div className="mt-8 flex justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>회원가입 없이 즉시 시작</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>무료 체험 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span>일괄 관리 시스템</span>
            </div>
          </div>
        </motion.div>

        {/* Key Features for Teachers */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-indigo-200">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <DocumentTextIcon className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">일괄 생성 시스템</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              같은 과목/활동의 여러 학생 생기부를 한 번에 생성하고 관리합니다.
              학생별 맞춤 내용으로 자동 생성되어 개별 작업 시간을 획기적으로 단축합니다.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-purple-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <ChartBarIcon className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">학생 데이터 관리</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              학생 정보, 활동 내역, 생성된 생기부를 체계적으로 저장하고 관리합니다.
              과목별, 학생별 검색 및 필터링으로 원하는 기록을 즉시 찾을 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-pink-200">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <ClockIcon className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">시간 효율 극대화</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              한 학생당 평균 30-60분 걸리던 생기부 작성을 5분 내로 단축합니다.
              AI가 초안을 자동 생성하고 선생님은 최종 검토만 진행합니다.
            </p>
          </div>
        </motion.div>

        {/* Teacher Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            선생님용 작업 흐름
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            한 과목의 여러 학생 생기부를 효율적으로 관리하는 3단계 워크플로우
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: '과목/활동 정보 입력',
                desc: '학년, 학기, 과목명과 공통 활동 정보를 한 번만 입력합니다',
                icon: DocumentTextIcon,
                color: 'from-indigo-500 to-indigo-600'
              },
              {
                step: 2,
                title: '학생별 활동 입력',
                desc: '학생 목록을 추가하고 각 학생의 개별 활동 내용을 입력합니다',
                icon: AcademicCapIcon,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: 3,
                title: '일괄 생성 및 관리',
                desc: '전체 학생의 생기부를 한 번에 생성하고 개별 검토 후 저장합니다',
                icon: SparklesIcon,
                color: 'from-pink-500 to-pink-600'
              }
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all h-full border border-gray-100 hover:border-indigo-200">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 mx-auto shadow-md`}>
                    {item.step}
                  </div>
                  <div className="mb-5 flex justify-center">
                    <item.icon className="w-12 h-12 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 transform -translate-y-1/2 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits for Teachers */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32 bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-12 md:p-16 border border-indigo-100"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            왜 생기부 Office인가요?
          </h2>
          <p className="text-xl text-gray-600 mb-16 text-center max-w-3xl mx-auto">
            선생님의 업무 효율을 위해 설계된 전문 도구
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">일괄 처리로 시간 절약</h4>
                <p className="text-gray-600 leading-relaxed">한 학급 30명 생기부 작성 시간을 20시간에서 2-3시간으로 단축합니다.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">교육 현장 맞춤 설계</h4>
                <p className="text-gray-600 leading-relaxed">실제 교사의 생기부 작성 경험과 피드백을 반영하여 개발되었습니다.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">학생별 차별화된 내용</h4>
                <p className="text-gray-600 leading-relaxed">같은 활동이라도 각 학생의 특성과 성과를 반영한 맞춤형 생기부를 생성합니다.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">체계적인 데이터 관리</h4>
                <p className="text-gray-600 leading-relaxed">학생 정보와 생성 기록을 안전하게 저장하고 언제든지 조회 및 수정이 가능합니다.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">전문적인 표현력</h4>
                <p className="text-gray-600 leading-relaxed">AI가 교육 현장에 적합한 전문적이고 자연스러운 문장을 자동 생성합니다.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CheckCircleIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">유연한 편집 기능</h4>
                <p className="text-gray-600 leading-relaxed">AI 생성 내용을 선생님의 의도에 맞게 쉽게 수정하고 보완할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-32 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 md:p-20 text-white shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 font-light">
            회원가입 없이 즉시 사용 가능합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center px-14 py-5 bg-white text-indigo-600 font-extrabold rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              <DocumentTextIcon className="w-7 h-7 mr-3" />
              선생님용 시작하기
            </motion.button>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              신용카드 불필요
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              무료 체험 제공
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              즉시 사용 가능
            </span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-slate-900 text-gray-400 py-16 mt-32 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">생기부 Office</h3>
                  <p className="text-xs text-gray-500">sgboffice.org</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                선생님을 위한 AI 기반 생활기록부 작성 전문 도구
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © 2025 생기부 Office. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                교육 현장의 효율성을 높이는 AI 솔루션
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Popup */}
      {showAuthPopup && <InitialAuthPopup onClose={handleAuthPopupClose} />}
    </div>
  );
}
