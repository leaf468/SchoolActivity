import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { useAuth } from '../contexts/AuthContext';

interface InitialAuthPopupProps {
  onClose: () => void;
}

const InitialAuthPopup: React.FC<InitialAuthPopupProps> = ({ onClose }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { continueAsGuest, userMode, signInWithGoogle } = useAuth();

  const handleContinueAsGuest = () => {
    continueAsGuest();
    onClose();
    // Redirect based on user mode
    const redirectPath = userMode === 'teacher' ? '/teacher/basic' : '/info';
    window.location.href = redirectPath;
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // OAuth 리디렉션이 발생하므로 여기까지 도달하지 않을 수 있음
    } catch (err: any) {
      console.error('구글 인증 실패:', err);
      setError(err.message || '구글 인증에 실패했습니다.');
      setLoading(false);
    }
  };

  if (showLogin) {
    return <LoginModal onClose={() => setShowLogin(false)} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />;
  }

  if (showSignup) {
    return <SignupModal onClose={() => setShowSignup(false)} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">생기부 Office</h2>
            </div>
            <p className="text-sm text-gray-600">선생님을 위한 생기부 작성 전문 도구</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* 구글로 시작하기 (통합 로그인/회원가입) */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? '처리 중...' : 'Google로 시작하기'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
            >
              이메일로 로그인
            </button>

            <button
              onClick={() => setShowSignup(true)}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              이메일로 회원가입
            </button>

            <button
              onClick={handleContinueAsGuest}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
            >
              비회원으로 계속하기
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            비회원은 기록이 저장되지 않습니다
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InitialAuthPopup;
