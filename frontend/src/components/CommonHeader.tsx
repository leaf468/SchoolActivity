import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const CommonHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest, userMode, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [universitySlogan, setUniversitySlogan] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const saved = localStorage.getItem(`user_${user.id}_info`);
      if (saved) {
        const data = JSON.parse(saved);
        setTargetUniversity(data.targetUniversity || '');
        setTargetMajor(data.targetMajor || '');
        setUniversitySlogan(data.universitySlogan || '');
      }
    }
  }, [isAuthenticated, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      alert('로그아웃 실패');
    }
  };

  const handleLogoClick = () => {
    // Navigate based on authentication state
    if (isAuthenticated && !isGuest) {
      // For authenticated users, go to their MyPage
      const homePath = userMode === 'teacher' ? '/teacher/mypage' : '/mypage';
      navigate(homePath);
    } else {
      // For unauthenticated users, go to Landing page
      navigate('/');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <button
              onClick={handleLogoClick}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              SchoolActivity
            </button>

            {targetUniversity && (
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {targetUniversity} {targetMajor && `· ${targetMajor}`}
                </p>
                {universitySlogan && (
                  <p className="text-xs text-gray-500 mt-0.5">{universitySlogan}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {!isAuthenticated && !isGuest ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  로그인
                </button>
              ) : isAuthenticated && !isGuest ? (
                <>
                  <span className="text-sm font-medium text-gray-700">{user?.name || user?.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    로그아웃
                  </button>
                </>
              ) : null}
              {isAuthenticated && !isGuest && (
                <button
                  onClick={() => navigate(userMode === 'teacher' ? '/teacher/basic' : '/info')}
                  className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  + 새 생기부 작성
                </button>
              )}
              <button
                onClick={() => navigate(userMode === 'teacher' ? '/teacher/mypage' : '/mypage')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                마이페이지
              </button>
            </div>
          </div>
        </div>
      </header>

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
};

export default CommonHeader;
