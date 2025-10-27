import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { SchoolActivityProvider } from "./contexts/SchoolActivityContext";
import { trackPageView } from "./utils/analytics";

// SchoolActivity Pages
import Page1BasicInfo from './pages/Page1BasicInfo';
import Page2ActivityInput from './pages/Page2ActivityInput';
import Page3DraftReview from './pages/Page3DraftReview';
import Page4FinalEdit from './pages/Page4FinalEdit';

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

function App() {
  return (
    <SchoolActivityProvider>
      <Router>
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Page1BasicInfo />} />
          <Route path="/page1" element={<Page1BasicInfo />} />
          <Route path="/page2" element={<Page2ActivityInput />} />
          <Route path="/page3" element={<Page3DraftReview />} />
          <Route path="/page4" element={<Page4FinalEdit />} />
        </Routes>
      </Router>
    </SchoolActivityProvider>
  );
}

export default App;
