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
  const { continueAsGuest, userMode } = useAuth();

  const handleContinueAsGuest = () => {
    continueAsGuest();
    onClose();
    // Redirect based on user mode
    const redirectPath = userMode === 'teacher' ? '/teacher/basic' : '/info';
    window.location.href = redirectPath;
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">SchoolActivity</h2>
            <p className="text-sm text-gray-500">AI 생활기록부 작성 도우미</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
            >
              로그인
            </button>

            <button
              onClick={() => setShowSignup(true)}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              회원가입
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
