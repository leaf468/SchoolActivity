// Analytics disabled - 모든 추적 비활성화

// 페이지뷰 추적 (비활성화)
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  // GA 추적 비활성화
};

// 이벤트 추적 (비활성화)
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  // GA 추적 비활성화
};

// 버튼 클릭 추적 (비활성화)
export const trackButtonClick = (buttonName: string, location?: string) => {
  // GA 추적 비활성화
};

// 별점 추적 (비활성화)
export const trackRating = (rating: number, portfolioId?: string) => {
  // GA 추적 비활성화
};

// PDF 다운로드 추적 (비활성화)
export const trackPDFDownload = (portfolioId?: string) => {
  // GA 추적 비활성화
};

// 포트폴리오 생성 추적 (비활성화)
export const trackPortfolioGeneration = (templateType?: string) => {
  // GA 추적 비활성화
};

// 템플릿 선택 추적 (비활성화)
export const trackTemplateSelection = (templateName: string) => {
  // GA 추적 비활성화
};

// 메인 페이지 방문 추적 (비활성화)
export const trackMainPageVisit = () => {
  // GA 추적 비활성화
};
