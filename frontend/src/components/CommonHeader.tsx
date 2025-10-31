import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const CommonHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
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

  return (
    <>
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 relative">
            <button
              onClick={() => navigate('/')}
              className="text-lg font-semibold text-gray-900"
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

            <div className="flex items-center gap-4">
              {!isAuthenticated && !isGuest ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  로그인
                </button>
              ) : isAuthenticated && !isGuest ? (
                <>
                  <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    로그아웃
                  </button>
                </>
              ) : null}
              <button
                onClick={() => navigate('/mypage')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
