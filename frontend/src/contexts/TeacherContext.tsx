import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TeacherState,
  TeacherBasicInfo,
  TeacherStudentInfo,
  TeacherStudentActivity,
  TeacherGeneratedRecord,
  SectionType,
} from '../types/schoolActivity';
import { useAuth } from './AuthContext';
import {
  upsertTeacherSession,
  addTeacherStudent as addTeacherStudentToSupabase,
  deleteTeacherStudent as deleteTeacherStudentFromSupabase,
  updateStudentActivity as updateStudentActivityInSupabase,
  saveStudentDraft,
  getTeacherSessionBySessionId,
  getTeacherStudentsBySession,
} from '../supabase';

interface TeacherContextType {
  state: TeacherState;
  basicInfo: TeacherState['basicInfo'];
  students: TeacherState['students'];
  generatedRecords: TeacherState['generatedRecords'];
  setBasicInfo: (info: TeacherBasicInfo) => void;
  addStudent: (student: TeacherStudentInfo) => void;
  removeStudent: (studentId: string) => void;
  updateStudent: (studentId: string, updates: Partial<TeacherStudentInfo>) => void;
  setStudentActivity: (activity: TeacherStudentActivity) => void;
  setGeneratedRecord: (record: TeacherGeneratedRecord) => void;
  setCurrentStep: (step: TeacherState['currentStep']) => void;
  clearAll: () => void;
  restoreSession: (sessionId: string) => Promise<void>;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export const useTeacher = (): TeacherContextType => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within TeacherProvider');
  }
  return context;
};

interface TeacherProviderProps {
  children: ReactNode;
}

export const TeacherProvider: React.FC<TeacherProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isGuest } = useAuth();

  // Initialize state from localStorage if available
  const [state, setState] = useState<TeacherState>(() => {
    try {
      const saved = localStorage.getItem('teacher_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[TeacherContext] Loaded state from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[TeacherContext] Failed to load state from localStorage:', error);
    }

    // Default initial state
    return {
      teacherId: `teacher_${Date.now()}`,
      sessionId: `session_${Date.now()}`,
      basicInfo: null,
      students: [],
      studentActivities: [],
      generatedRecords: [],
      currentStep: 'basic',
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('teacher_state', JSON.stringify(state));
      console.log('[TeacherContext] Saved state to localStorage');
    } catch (error) {
      console.error('[TeacherContext] Failed to save state to localStorage:', error);
    }
  }, [state]);

  // Restore session from DB on mount (if sessionId exists in localStorage)
  useEffect(() => {
    const restoreFromDB = async () => {
      if (!isAuthenticated || isGuest || !user) return;

      const savedSessionId = state.sessionId;
      if (!savedSessionId || savedSessionId.startsWith('session_')) {
        // Check if it's a real session ID (not a newly generated one)
        const sessionResult = await getTeacherSessionBySessionId(savedSessionId);
        if (sessionResult.success && sessionResult.data) {
          console.log('[TeacherContext] Restoring session from DB:', savedSessionId);

          // Load students for this session
          const studentsResult = await getTeacherStudentsBySession(savedSessionId);
          if (studentsResult.success && studentsResult.data) {
            // Convert DB students to TeacherStudentInfo format
            const students: TeacherStudentInfo[] = studentsResult.data.map((s: any) => ({
              id: s.student_id,
              name: s.student_name,
              classNumber: s.class_number || '',
              desiredMajor: s.desired_major || '',
              track: s.track || '',
            }));

            // Load student activities from activity_details JSONB field
            const studentActivities: TeacherStudentActivity[] = studentsResult.data
              .filter((s: any) => s.activity_details)
              .map((s: any) => ({
                studentId: s.student_id,
                studentName: s.student_name,
                activityDetails: s.activity_details,
                emphasisKeywords: s.emphasis_keywords || [],
              }));

            // Load generated records from generated_draft field
            const generatedRecords: TeacherGeneratedRecord[] = studentsResult.data
              .filter((s: any) => s.generated_draft)
              .map((s: any) => ({
                studentId: s.student_id,
                studentName: s.student_name,
                generatedRecord: {
                  id: `gen_${s.student_id}`,
                  studentInfo: {} as any, // Will be populated when needed
                  activityInput: {} as any, // Will be populated when needed
                  generatedText: s.generated_draft,
                  confidence: s.draft_confidence || 0.8,
                  usedFewShots: [],
                  createdAt: s.created_at || new Date().toISOString(),
                  updatedAt: s.updated_at,
                },
              }));

            // Restore state with loaded data
            setState(prev => ({
              ...prev,
              students: students,
              studentActivities: studentActivities,
              generatedRecords: generatedRecords,
            }));

            console.log('[TeacherContext] Loaded from DB:', {
              students: students.length,
              activities: studentActivities.length,
              records: generatedRecords.length,
            });
          }
        }
      }
    };

    restoreFromDB();
  }, [isAuthenticated, isGuest, user]); // Only run once on mount when auth changes

  // 기본 정보가 변경될 때 Supabase에 자동 저장
  useEffect(() => {
    if (!isAuthenticated || isGuest || !user || !state.basicInfo) return;

    const timeoutId = setTimeout(async () => {
      try {
        const title = `${state.basicInfo.grade}학년 ${state.basicInfo.semester}학기 ${
          state.basicInfo.sectionType === 'subject'
            ? state.basicInfo.subject
            : state.basicInfo.sectionType === 'autonomy'
            ? '자율활동'
            : state.basicInfo.sectionType === 'club'
            ? '동아리활동'
            : state.basicInfo.sectionType === 'career'
            ? '진로활동'
            : '행동특성'
        }`;

        await upsertTeacherSession({
          session_id: state.sessionId,
          grade: state.basicInfo.grade,
          semester: state.basicInfo.semester,
          section_type: state.basicInfo.sectionType,
          subject: state.basicInfo.subject,
          teacher_name: state.basicInfo.teacherName,
          title: title,
        });
      } catch (error) {
        console.error('Supabase 자동 저장 실패:', error);
      }
    }, 1000); // 1초 debounce

    return () => clearTimeout(timeoutId);
  }, [state.basicInfo, state.sessionId, isAuthenticated, isGuest, user]);

  const setBasicInfo = (info: TeacherBasicInfo) => {
    setState((prev) => ({ ...prev, basicInfo: info }));
  };

  const addStudent = async (student: TeacherStudentInfo) => {
    setState((prev) => ({
      ...prev,
      students: [...prev.students, student],
    }));

    // Supabase에 학생 추가
    if (isAuthenticated && !isGuest && user) {
      try {
        await addTeacherStudentToSupabase({
          session_id: state.sessionId,
          student_id: student.id,
          student_name: student.name,
          class_number: student.classNumber,
          desired_major: student.desiredMajor,
          track: student.track,
        });
      } catch (error) {
        console.error('학생 추가 중 오류:', error);
      }
    }
  };

  const removeStudent = async (studentId: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      studentActivities: prev.studentActivities.filter((a) => a.studentId !== studentId),
      generatedRecords: prev.generatedRecords.filter((r) => r.studentId !== studentId),
    }));

    // Supabase에서 학생 삭제
    if (isAuthenticated && !isGuest && user) {
      try {
        await deleteTeacherStudentFromSupabase(studentId);
      } catch (error) {
        console.error('학생 삭제 중 오류:', error);
      }
    }
  };

  const updateStudent = (studentId: string, updates: Partial<TeacherStudentInfo>) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ...updates } : s
      ),
    }));
  };

  const setStudentActivity = async (activity: TeacherStudentActivity) => {
    setState((prev) => {
      const existingIndex = prev.studentActivities.findIndex(
        (a) => a.studentId === activity.studentId
      );

      if (existingIndex >= 0) {
        const updated = [...prev.studentActivities];
        updated[existingIndex] = activity;
        return { ...prev, studentActivities: updated };
      } else {
        return {
          ...prev,
          studentActivities: [...prev.studentActivities, activity],
        };
      }
    });

    // Supabase에 활동 정보 업데이트
    if (isAuthenticated && !isGuest && user) {
      try {
        await updateStudentActivityInSupabase(
          activity.studentId,
          activity.activityDetails,
          activity.emphasisKeywords
        );
      } catch (error) {
        console.error('활동 정보 업데이트 중 오류:', error);
      }
    }
  };

  const setGeneratedRecord = async (record: TeacherGeneratedRecord) => {
    setState((prev) => {
      const existingIndex = prev.generatedRecords.findIndex(
        (r) => r.studentId === record.studentId
      );

      if (existingIndex >= 0) {
        const updated = [...prev.generatedRecords];
        updated[existingIndex] = record;
        return { ...prev, generatedRecords: updated };
      } else {
        return {
          ...prev,
          generatedRecords: [...prev.generatedRecords, record],
        };
      }
    });

    // Supabase에 생성된 초안 저장
    if (isAuthenticated && !isGuest && user) {
      try {
        await saveStudentDraft(
          record.studentId,
          record.generatedRecord.generatedText,
          record.generatedRecord.confidence
        );
      } catch (error) {
        console.error('초안 저장 중 오류:', error);
      }
    }
  };

  const setCurrentStep = (step: TeacherState['currentStep']) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const clearAll = () => {
    const newState: TeacherState = {
      teacherId: `teacher_${Date.now()}`,
      sessionId: `session_${Date.now()}`,
      basicInfo: null,
      students: [],
      studentActivities: [],
      generatedRecords: [],
      currentStep: 'basic' as const,
    };
    setState(newState);
    // Clear localStorage as well
    localStorage.removeItem('teacher_state');
    console.log('[TeacherContext] Cleared all state and localStorage');
  };

  const restoreSession = async (sessionId: string) => {
    try {
      console.log('[TeacherContext] Restoring session:', sessionId);

      // Load session from DB
      const sessionResult = await getTeacherSessionBySessionId(sessionId);
      if (!sessionResult.success || !sessionResult.data) {
        throw new Error('Failed to load session');
      }

      const session = sessionResult.data;

      // Load students for this session
      const studentsResult = await getTeacherStudentsBySession(sessionId);
      const students: TeacherStudentInfo[] = studentsResult.success && studentsResult.data
        ? studentsResult.data.map((s: any) => ({
            id: s.student_id,
            name: s.student_name,
            classNumber: s.class_number || '',
            desiredMajor: s.desired_major || '',
            track: s.track || '',
          }))
        : [];

      // Load student activities from activity_details JSONB field
      const studentActivities: TeacherStudentActivity[] = studentsResult.success && studentsResult.data
        ? studentsResult.data
            .filter((s: any) => s.activity_details)
            .map((s: any) => ({
              studentId: s.student_id,
              studentName: s.student_name,
              activityDetails: s.activity_details,
              emphasisKeywords: s.emphasis_keywords || [],
            }))
        : [];

      // Load generated records from generated_draft field
      const generatedRecords: TeacherGeneratedRecord[] = studentsResult.success && studentsResult.data
        ? studentsResult.data
            .filter((s: any) => s.generated_draft)
            .map((s: any) => ({
              studentId: s.student_id,
              studentName: s.student_name,
              generatedRecord: {
                id: `gen_${s.student_id}`,
                studentInfo: {} as any,
                activityInput: {} as any,
                generatedText: s.generated_draft,
                confidence: s.draft_confidence || 0.8,
                usedFewShots: [],
                createdAt: s.created_at || new Date().toISOString(),
                updatedAt: s.updated_at,
              },
            }))
        : [];

      // Restore basic info from session
      const basicInfo: TeacherBasicInfo = {
        grade: session.grade as 1 | 2 | 3,
        semester: session.semester as '1' | '2',
        sectionType: session.section_type as SectionType,
        subject: session.subject || undefined,
        teacherName: session.teacher_name || undefined,
      };

      // Update state with restored data
      setState({
        teacherId: `teacher_${Date.now()}`,
        sessionId: sessionId,
        basicInfo: basicInfo,
        students: students,
        studentActivities: studentActivities,
        generatedRecords: generatedRecords,
        currentStep: 'review', // Start at review step since session already exists
      });

      console.log('[TeacherContext] Session restored successfully');
    } catch (error) {
      console.error('[TeacherContext] Failed to restore session:', error);
      throw error;
    }
  };

  return (
    <TeacherContext.Provider
      value={{
        state,
        basicInfo: state.basicInfo,
        students: state.students,
        generatedRecords: state.generatedRecords,
        setBasicInfo,
        addStudent,
        removeStudent,
        updateStudent,
        setStudentActivity,
        setGeneratedRecord,
        setCurrentStep,
        clearAll,
        restoreSession,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};
