import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { SchoolActivityProvider } from "./contexts/SchoolActivityContext";
import { TeacherProvider } from "./contexts/TeacherContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { trackPageView } from "./utils/analytics";

// Student Pages
import Landing from './pages/Landing';
import Page1BasicInfo from './pages/Page1BasicInfo';
import Page2ActivityInput from './pages/Page2ActivityInput';
import Page3DraftReview from './pages/Page3DraftReview';
import Page4FinalEdit from './pages/Page4FinalEdit';
import MyPage from './components/MyPage';
import TeacherMyPage from './pages/TeacherMyPage';

// New Student Pages
import StudentComparisonPage from './pages/StudentComparisonPage';
import StudentActivityRecommendationPage from './pages/StudentActivityRecommendationPage';
import StudentWritingStylePage from './pages/StudentWritingStylePage';
import StudentFuturePlanPage from './pages/StudentFuturePlanPage';

// Teacher Pages
import TeacherPage1BasicInfo from './pages/TeacherPage1BasicInfo';
import TeacherPage2StudentList from './pages/TeacherPage2StudentList';
import TeacherPage3BatchReview from './pages/TeacherPage3BatchReview';

// New Teacher Pages
import TeacherComparisonDashboard from './pages/TeacherComparisonDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

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
    '/': '랜딩 페이지',
    '/info': '학생 - 기본 정보 입력',
    '/input': '학생 - 활동 내용 입력',
    '/draft': '학생 - 초안 생성 및 검토',
    '/final': '학생 - 최종 첨삭 및 저장',
    '/mypage': '학생 - 마이페이지',
    '/teacher/mypage': '선생님 - 마이페이지',
    '/teacher/basic': '선생님 - 기본 정보 입력',
    '/teacher/students': '선생님 - 학생 관리',
    '/teacher/review': '선생님 - 일괄 생성 및 검토',
  };

  return titleMap[pathname] || '생활기록부 AI 작성';
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Student Routes */}
        <Route path="/info" element={<Page1BasicInfo />} />
        <Route path="/input" element={<Page2ActivityInput />} />
        <Route path="/draft" element={<Page3DraftReview />} />
        <Route path="/final" element={<Page4FinalEdit />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* New Student Features */}
        <Route path="/student/comparison" element={<StudentComparisonPage />} />
        <Route path="/student/activity-recommendation" element={<StudentActivityRecommendationPage />} />
        <Route path="/student/writing-style" element={<StudentWritingStylePage />} />
        <Route path="/student/future-plan" element={<StudentFuturePlanPage />} />

        {/* Teacher Routes */}
        <Route path="/teacher/mypage" element={<TeacherMyPage />} />
        <Route path="/teacher/basic" element={<TeacherPage1BasicInfo />} />
        <Route path="/teacher/students" element={<TeacherPage2StudentList />} />
        <Route path="/teacher/review" element={<TeacherPage3BatchReview />} />

        {/* New Teacher Features */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/comparison" element={<TeacherComparisonDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SchoolActivityProvider>
        <TeacherProvider>
          <Router>
            <PageViewTracker />
            <AppContent />
          </Router>
        </TeacherProvider>
      </SchoolActivityProvider>
    </AuthProvider>
  );
}

export default App;
