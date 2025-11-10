import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  TeacherState,
  TeacherBasicInfo,
  TeacherStudentInfo,
  TeacherStudentActivity,
  TeacherGeneratedRecord,
} from '../types/schoolActivity';

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
  const [state, setState] = useState<TeacherState>({
    teacherId: `teacher_${Date.now()}`,
    sessionId: `session_${Date.now()}`,
    basicInfo: null,
    students: [],
    studentActivities: [],
    generatedRecords: [],
    currentStep: 'basic',
  });

  const setBasicInfo = (info: TeacherBasicInfo) => {
    setState((prev) => ({ ...prev, basicInfo: info }));
  };

  const addStudent = (student: TeacherStudentInfo) => {
    setState((prev) => ({
      ...prev,
      students: [...prev.students, student],
    }));
  };

  const removeStudent = (studentId: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      studentActivities: prev.studentActivities.filter((a) => a.studentId !== studentId),
      generatedRecords: prev.generatedRecords.filter((r) => r.studentId !== studentId),
    }));
  };

  const updateStudent = (studentId: string, updates: Partial<TeacherStudentInfo>) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ...updates } : s
      ),
    }));
  };

  const setStudentActivity = (activity: TeacherStudentActivity) => {
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
  };

  const setGeneratedRecord = (record: TeacherGeneratedRecord) => {
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
  };

  const setCurrentStep = (step: TeacherState['currentStep']) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const clearAll = () => {
    setState({
      teacherId: `teacher_${Date.now()}`,
      sessionId: `session_${Date.now()}`,
      basicInfo: null,
      students: [],
      studentActivities: [],
      generatedRecords: [],
      currentStep: 'basic',
    });
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
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};
