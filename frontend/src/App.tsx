import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { SchoolActivityProvider } from "./contexts/SchoolActivityContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { trackPageView } from "./utils/analytics";

// SchoolActivity Pages
import Page1BasicInfo from './pages/Page1BasicInfo';
import Page2ActivityInput from './pages/Page2ActivityInput';
import Page3DraftReview from './pages/Page3DraftReview';
import Page4FinalEdit from './pages/Page4FinalEdit';
import MyPage from './components/MyPage';
import InitialAuthPopup from './components/InitialAuthPopup';

// GA 페이지뷰 추적 컴포넌트
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    trackPageView(location.pathname, pageTitle);
  }, [location]);

  return null;
}

// 페이지 경로에 따른 제목 반환
function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    '/': '기본 정보 입력',
    '/page1': '기본 정보 입력',
    '/page2': '활동 내용 입력',
    '/page3': '초안 생성 및 검토',
    '/page4': '최종 첨삭 및 저장',
  };

  return titleMap[pathname] || '생활기록부 AI 작성';
}

function AppContent() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    // Show popup only if user is not authenticated and not a guest
    if (!loading && !isAuthenticated && !isGuest) {
      setShowAuthPopup(true);
    } else {
      setShowAuthPopup(false);
    }
  }, [isAuthenticated, isGuest, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {showAuthPopup && <InitialAuthPopup onClose={() => setShowAuthPopup(false)} />}
      <Routes>
        <Route path="/" element={<Page1BasicInfo />} />
        <Route path="/page1" element={<Page1BasicInfo />} />
        <Route path="/page2" element={<Page2ActivityInput />} />
        <Route path="/page3" element={<Page3DraftReview />} />
        <Route path="/page4" element={<Page4FinalEdit />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SchoolActivityProvider>
        <Router>
          <PageViewTracker />
          <AppContent />
        </Router>
      </SchoolActivityProvider>
    </AuthProvider>
  );
}

export default App;
