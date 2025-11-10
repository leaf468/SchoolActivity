import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import {
  SchoolActivityState,
  BasicInfo,
  ActivityDetails,
  DraftResult,
} from '../types/schoolActivity';
import { useAuth } from './AuthContext';
import { upsertActivityRecordBySession } from '../supabase';

type SchoolActivityAction =
  | { type: 'SET_BASIC_INFO'; payload: BasicInfo }
  | { type: 'SET_ACTIVITY_DETAILS'; payload: ActivityDetails }
  | { type: 'SET_EMPHASIS_KEYWORDS'; payload: string[] }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_DRAFT_RESULT'; payload: DraftResult }
  | { type: 'CLEAR_DRAFT' }
  | { type: 'SET_FINAL_TEXT'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: SchoolActivityState['currentStep'] }
  | { type: 'RESET' };

const STORAGE_KEY = 'school_activity_state';

const initialState: SchoolActivityState = {
  userId: `user_${Date.now()}`,
  sessionId: `session_${Date.now()}`,
  studentInfo: null,
  currentActivity: null,
  generatedDraft: null,
  verificationResult: null,
  currentStep: 'basic',
  allRecords: [],
  // Legacy support
  basicInfo: null,
  activityDetails: null,
  emphasisKeywords: [],
  draftResult: null,
  finalText: null,
};

const loadFromStorage = (): SchoolActivityState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored);
      return {
        ...initialState,
        ...parsedState,
        userId: parsedState.userId || `user_${Date.now()}`,
        sessionId: parsedState.sessionId || `session_${Date.now()}`,
      };
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }
  return null;
};

const saveToStorage = (state: SchoolActivityState) => {
  try {
    // 입력 데이터만 저장하고, 생성된 결과물(draftResult, finalText)은 제외
    const stateToSave = {
      ...state,
      draftResult: null, // 항상 null로 저장
      finalText: null,   // 항상 null로 저장
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

function schoolActivityReducer(
  state: SchoolActivityState,
  action: SchoolActivityAction
): SchoolActivityState {
  switch (action.type) {
    case 'SET_BASIC_INFO':
      return { ...state, basicInfo: action.payload };
    case 'SET_ACTIVITY_DETAILS':
      return { ...state, activityDetails: action.payload };
    case 'SET_EMPHASIS_KEYWORDS':
      return { ...state, emphasisKeywords: action.payload };
    case 'ADD_KEYWORD':
      return {
        ...state,
        emphasisKeywords: [...state.emphasisKeywords, action.payload],
      };
    case 'REMOVE_KEYWORD':
      return {
        ...state,
        emphasisKeywords: state.emphasisKeywords.filter(
          (keyword) => keyword !== action.payload
        ),
      };
    case 'SET_DRAFT_RESULT':
      return { ...state, draftResult: action.payload };
    case 'CLEAR_DRAFT':
      return { ...state, draftResult: null };
    case 'SET_FINAL_TEXT':
      return { ...state, finalText: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET':
      return {
        ...initialState,
        userId: `user_${Date.now()}`,
        sessionId: `session_${Date.now()}`,
        studentInfo: null,
        currentActivity: null,
        generatedDraft: null,
        verificationResult: null,
        allRecords: [],
        basicInfo: null,
        activityDetails: null,
        emphasisKeywords: [],
        draftResult: null,
        finalText: null,
      };
    default:
      return state;
  }
}

interface SchoolActivityContextValue {
  state: SchoolActivityState;
  dispatch: React.Dispatch<SchoolActivityAction>;

  // Direct state access (for new features)
  studentInfo: SchoolActivityState['studentInfo'];
  allRecords: SchoolActivityState['allRecords'];

  // Helper functions
  setBasicInfo: (info: BasicInfo) => void;
  setActivityDetails: (details: ActivityDetails) => void;
  setEmphasisKeywords: (keywords: string[]) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  setDraftResult: (result: DraftResult) => void;
  clearDraft: () => void;
  setFinalText: (text: string) => void;
  setCurrentStep: (step: SchoolActivityState['currentStep']) => void;
  reset: () => void;
}

const SchoolActivityContext = createContext<SchoolActivityContextValue | undefined>(undefined);

export function SchoolActivityProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isGuest } = useAuth();
  const savedState = loadFromStorage();
  const [state, dispatch] = useReducer(schoolActivityReducer, savedState || initialState);

  // Save to localStorage when state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage(state);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Supabase 자동 저장 (로그인한 사용자만)
  useEffect(() => {
    // 로그인하지 않았거나 게스트면 스킵
    if (!isAuthenticated || isGuest || !user) return;

    // 저장할 데이터가 없으면 스킵
    if (!state.basicInfo && !state.activityDetails) return;

    const timeoutId = setTimeout(async () => {
      try {
        // 제목 생성
        const title = state.basicInfo
          ? `${state.basicInfo.grade}학년 ${state.basicInfo.semester}학기 - ${
              state.basicInfo.sectionType === 'subject' ? state.basicInfo.subject :
              state.basicInfo.sectionType === 'autonomy' ? '자율활동' :
              state.basicInfo.sectionType === 'club' ? '동아리활동' :
              state.basicInfo.sectionType === 'career' ? '진로활동' : '행동특성 및 종합의견'
            }`
          : '임시 저장';

        // ActivityDetails에서 활동 내용 추출
        let activitySummary = null;
        if (state.activityDetails) {
          const details = state.activityDetails;
          if ('activities' in details && details.activities.length > 0) {
            // 모든 활동의 content를 결합
            activitySummary = details.activities.map(a => a.content).join(' ');
          }
        }

        // student_grade 안전하게 파싱 (1, 2, 3만 허용)
        const parseGrade = (grade: string | undefined): number | null => {
          if (!grade) return null;
          const parsed = parseInt(grade, 10);
          if (isNaN(parsed) || parsed < 1 || parsed > 3) {
            return null;
          }
          return parsed;
        };

        // Supabase에 자동 저장
        await upsertActivityRecordBySession(
          state.sessionId,
          {
            title: title,
            student_name: null, // BasicInfo에는 student_name이 없음
            student_grade: parseGrade(state.basicInfo?.grade),
            section_type: state.basicInfo?.sectionType || null,
            activity_summary: activitySummary,
            keywords: state.emphasisKeywords.length > 0 ? state.emphasisKeywords : null,
            activity_details: {
              basicInfo: state.basicInfo,
              activityDetails: state.activityDetails,
            },
            // draftResult와 finalText는 Page3, Page4에서 별도로 저장됨
          }
        );
      } catch (error) {
        console.error('Supabase 자동 저장 실패:', error);
        // 에러가 나도 localStorage는 유지되므로 조용히 실패
        // 사용자에게 알림 표시하지 않음 (UX 개선)
      }
    }, 1000); // 1초 debounce (타이핑 중에는 저장 안 함)

    return () => clearTimeout(timeoutId);
  }, [state.basicInfo, state.activityDetails, state.emphasisKeywords, state.sessionId, isAuthenticated, isGuest, user]);

  const setBasicInfo = useCallback((info: BasicInfo) => {
    dispatch({ type: 'SET_BASIC_INFO', payload: info });
  }, []);

  const setActivityDetails = useCallback((details: ActivityDetails) => {
    dispatch({ type: 'SET_ACTIVITY_DETAILS', payload: details });
  }, []);

  const setEmphasisKeywords = useCallback((keywords: string[]) => {
    dispatch({ type: 'SET_EMPHASIS_KEYWORDS', payload: keywords });
  }, []);

  const addKeyword = useCallback((keyword: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  }, []);

  const removeKeyword = useCallback((keyword: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: keyword });
  }, []);

  const setDraftResult = useCallback((result: DraftResult) => {
    dispatch({ type: 'SET_DRAFT_RESULT', payload: result });
  }, []);

  const clearDraft = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAFT' });
  }, []);

  const setFinalText = useCallback((text: string) => {
    dispatch({ type: 'SET_FINAL_TEXT', payload: text });
  }, []);

  const setCurrentStep = useCallback((step: SchoolActivityState['currentStep']) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const reset = useCallback(() => {
    clearStorage();
    dispatch({ type: 'RESET' });
  }, []);

  const value: SchoolActivityContextValue = {
    state,
    dispatch,
    studentInfo: state.studentInfo,
    allRecords: state.allRecords,
    setBasicInfo,
    setActivityDetails,
    setEmphasisKeywords,
    addKeyword,
    removeKeyword,
    setDraftResult,
    clearDraft,
    setFinalText,
    setCurrentStep,
    reset,
  };

  return (
    <SchoolActivityContext.Provider value={value}>
      {children}
    </SchoolActivityContext.Provider>
  );
}

export function useSchoolActivity() {
  const context = useContext(SchoolActivityContext);
  if (context === undefined) {
    throw new Error('useSchoolActivity must be used within a SchoolActivityProvider');
  }
  return context;
}
