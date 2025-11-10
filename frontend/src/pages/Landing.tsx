import React, { useEffect } from 'react';
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

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    trackMainPageVisit();
  }, []);

  const handleGetStarted = (mode: 'student' | 'teacher') => {
    trackButtonClick(mode === 'student' ? '학생용_시작' : '선생님용_시작', 'Landing');
    navigate(mode === 'student' ? '/page1' : '/teacher/basic');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-6">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">AI 기반 생활기록부 작성 도우미</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            생활기록부 작성,<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              이제 AI와 함께
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            학생의 활동을 입력하면 AI가 자동으로 체계적이고 전문적인 생활기록부를 작성해드립니다.<br />
            교사의 업무 부담을 줄이고, 학생의 성장을 더 잘 표현할 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('student')}
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <AcademicCapIcon className="w-6 h-6 mr-2" />
              학생용 시작하기
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              선생님용 시작하기
            </motion.button>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              💙 <span className="font-semibold">학생용</span>: 1명의 다양한 분야 생기부 작성
            </p>
            <p className="text-sm text-gray-600">
              💜 <span className="font-semibold">선생님용</span>: 같은 과목/활동의 여러 학생 일괄 작성
            </p>
            <p className="mt-4 text-xs text-gray-500">
              회원가입 없이 바로 시작 가능 · 무료 체험
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">빠른 작성</h3>
            <p className="text-gray-600 leading-relaxed">
              학생의 활동 내용만 입력하면 몇 분 안에 완성도 높은 생활기록부를 자동으로 생성합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">전문적인 표현</h3>
            <p className="text-gray-600 leading-relaxed">
              교육 현장에 적합한 전문적이고 체계적인 문장으로 학생의 성장 과정을 표현합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">맞춤형 생성</h3>
            <p className="text-gray-600 leading-relaxed">
              학년, 학기, 과목, 활동 유형에 맞춰 최적화된 내용을 자동으로 생성합니다.
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            간단한 4단계로 완성
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: '기본 정보 입력',
                desc: '학년, 학기, 과목 선택',
                icon: DocumentTextIcon
              },
              {
                step: 2,
                title: '활동 내용 입력',
                desc: '학생의 활동과 성과 작성',
                icon: AcademicCapIcon
              },
              {
                step: 3,
                title: 'AI 초안 생성',
                desc: 'AI가 자동으로 초안 작성',
                icon: SparklesIcon
              },
              {
                step: 4,
                title: '검토 및 저장',
                desc: '최종 확인 후 다운로드',
                icon: CheckCircleIcon
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-md h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                    {item.step}
                  </div>
                  <div className="mb-4 flex justify-center">
                    <item.icon className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32 bg-white rounded-3xl shadow-xl p-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            왜 SchoolActivity를 선택해야 할까요?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">시간 절약</h4>
                <p className="text-gray-600">기존 1시간 이상 걸리던 작업을 5분 만에 완료할 수 있습니다.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">교육 전문성</h4>
                <p className="text-gray-600">교육 현장의 실제 생활기록부 작성 경험을 바탕으로 개발되었습니다.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">높은 완성도</h4>
                <p className="text-gray-600">AI가 문맥을 이해하고 자연스럽고 전문적인 문장을 생성합니다.</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">쉬운 편집</h4>
                <p className="text-gray-600">생성된 내용을 원하는 대로 쉽게 수정하고 보완할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-32 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-16 text-white"
        >
          <h2 className="text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-10 opacity-90">
            회원가입 없이 즉시 사용 가능합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('student')}
              className="inline-flex items-center px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <AcademicCapIcon className="w-6 h-6 mr-2" />
              학생용
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center px-10 py-4 bg-white text-purple-600 font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              선생님용
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            © 2025 SchoolActivity. AI 기반 생활기록부 작성 서비스
          </p>
          <p className="text-xs mt-2">
            교육 현장의 효율성을 높이는 AI 솔루션
          </p>
        </div>
      </footer>
    </div>
  );
}
