import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  FolderPlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { TeacherStudentInfo } from '../types/schoolActivity';
import {
  activityFileAnalyzer,
  ActivityFile,
  FileAnalysisResult,
  BulkFileMapping,
} from '../services/activityFileAnalyzer';

interface BulkActivityFileManagerProps {
  students: TeacherStudentInfo[];
  sectionType: string;
  subject?: string;
  onAnalysisComplete?: (mappings: BulkFileMapping[]) => void;
  onClose: () => void;
}

const BulkActivityFileManager: React.FC<BulkActivityFileManagerProps> = ({
  students,
  sectionType,
  subject,
  onAnalysisComplete,
  onClose,
}) => {
  const [mappings, setMappings] = useState<BulkFileMapping[]>(
    students.map(s => ({
      studentName: s.name,
      studentId: s.id,
      files: [],
      analysisResults: [],
    }))
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzing, setCurrentAnalyzing] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [completedStudents, setCompletedStudents] = useState<Set<string>>(new Set());

  const handleFileUpload = useCallback((studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const student = students.find(s => s.id === studentId);
    const newFiles: ActivityFile[] = Array.from(uploadedFiles).map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      studentId,
      studentName: student?.name,
      fileType: activityFileAnalyzer.detectFileType(file.name),
      status: 'pending' as const,
    }));

    setMappings(prev => prev.map(m =>
      m.studentId === studentId
        ? { ...m, files: [...m.files, ...newFiles] }
        : m
    ));
  }, [students]);

  const removeFile = useCallback((studentId: string, fileId: string) => {
    setMappings(prev => prev.map(m =>
      m.studentId === studentId
        ? { ...m, files: m.files.filter(f => f.id !== fileId) }
        : m
    ));
  }, []);

  const handleTextInput = useCallback((studentId: string, text: string) => {
    if (!text.trim()) return;

    const student = students.find(s => s.id === studentId);
    const textFile: ActivityFile = {
      id: `text_${Date.now()}`,
      file: new File([text], `${student?.name}_활동내용.txt`, { type: 'text/plain' }),
      studentId,
      studentName: student?.name,
      fileType: 'report',
      textContent: text,
      status: 'pending',
    };

    setMappings(prev => prev.map(m =>
      m.studentId === studentId
        ? { ...m, files: [...m.files, textFile] }
        : m
    ));
  }, [students]);

  const analyzeAllStudents = useCallback(async () => {
    const studentsWithFiles = mappings.filter(m => m.files.length > 0);
    if (studentsWithFiles.length === 0) {
      alert('분석할 파일이 있는 학생이 없습니다.');
      return;
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: studentsWithFiles.length });

    const updatedMappings = [...mappings];

    for (let i = 0; i < studentsWithFiles.length; i++) {
      const mapping = studentsWithFiles[i];
      setCurrentAnalyzing(mapping.studentId || null);
      setProgress({ current: i + 1, total: studentsWithFiles.length });

      const results: FileAnalysisResult[] = [];

      for (const file of mapping.files) {
        // 파일 상태 업데이트
        setMappings(prev => prev.map(m =>
          m.studentId === mapping.studentId
            ? {
                ...m,
                files: m.files.map(f =>
                  f.id === file.id ? { ...f, status: 'analyzing' as const } : f
                )
              }
            : m
        ));

        try {
          // 텍스트 추출
          if (!file.textContent) {
            file.textContent = await activityFileAnalyzer.extractTextFromFile(file.file);
          }

          // 분석
          const student = students.find(s => s.id === mapping.studentId);
          const result = await activityFileAnalyzer.analyzeFile(file, {
            sectionType,
            subject,
            desiredMajor: student?.desiredMajor,
            track: student?.track,
          });

          results.push(result);

          // 파일 상태 완료
          setMappings(prev => prev.map(m =>
            m.studentId === mapping.studentId
              ? {
                  ...m,
                  files: m.files.map(f =>
                    f.id === file.id ? { ...f, status: 'complete' as const } : f
                  )
                }
              : m
          ));
        } catch (error) {
          console.error(`파일 분석 오류 (${file.file.name}):`, error);
          setMappings(prev => prev.map(m =>
            m.studentId === mapping.studentId
              ? {
                  ...m,
                  files: m.files.map(f =>
                    f.id === file.id ? { ...f, status: 'error' as const, error: '분석 실패' } : f
                  )
                }
              : m
          ));
        }
      }

      // 분석 결과 저장
      const mappingIndex = updatedMappings.findIndex(m => m.studentId === mapping.studentId);
      if (mappingIndex !== -1) {
        updatedMappings[mappingIndex].analysisResults = results;
      }

      setCompletedStudents(prev => {
        const newSet = new Set(prev);
        newSet.add(mapping.studentId || '');
        return newSet;
      });

      // API 제한 방지
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setMappings(updatedMappings);
    setIsAnalyzing(false);
    setCurrentAnalyzing(null);
    onAnalysisComplete?.(updatedMappings.filter(m => (m.analysisResults?.length || 0) > 0));
  }, [mappings, students, sectionType, subject, onAnalysisComplete]);

  const hasAnalysisResults = (studentId: string): boolean => {
    const mapping = mappings.find(m => m.studentId === studentId);
    return (mapping?.analysisResults?.length || 0) > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">학생별 활동 자료 일괄 관리</h2>
                <p className="text-sm text-gray-500">
                  {students.length}명의 학생에게 활동 자료를 배정하고 분석합니다
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-indigo-700 font-medium">
                  분석 중: {currentAnalyzing ? students.find(s => s.id === currentAnalyzing)?.name : ''}
                </span>
                <span className="text-gray-600">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {mappings.map((mapping) => {
              const student = students.find(s => s.id === mapping.studentId);
              const isCurrentlyAnalyzing = currentAnalyzing === mapping.studentId;
              const isCompleted = completedStudents.has(mapping.studentId || '');

              return (
                <motion.div
                  key={mapping.studentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    isCurrentlyAnalyzing
                      ? 'border-yellow-400 bg-yellow-50'
                      : isCompleted
                      ? 'border-green-400 bg-green-50'
                      : mapping.files.length > 0
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrentlyAnalyzing
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isCurrentlyAnalyzing ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          mapping.studentName?.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{mapping.studentName}</p>
                        <div className="flex items-center gap-2 text-sm">
                          {student?.classNumber && (
                            <span className="text-gray-500">{student.classNumber}</span>
                          )}
                          {student?.desiredMajor && (
                            <span className="text-purple-600">{student.desiredMajor}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={`file-${mapping.studentId}`}
                        multiple
                        accept=".pdf,.txt,.docx"
                        onChange={(e) => handleFileUpload(mapping.studentId || '', e)}
                        className="hidden"
                        disabled={isAnalyzing}
                      />
                      <label
                        htmlFor={`file-${mapping.studentId}`}
                        className={`flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all text-sm ${
                          isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FolderPlusIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">파일 추가</span>
                      </label>

                      {mapping.files.length > 0 && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                          {mapping.files.length}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Files List */}
                  {mapping.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mapping.files.map(file => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                            file.status === 'complete'
                              ? 'bg-green-100'
                              : file.status === 'analyzing'
                              ? 'bg-yellow-100'
                              : file.status === 'error'
                              ? 'bg-red-100'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {file.fileType === 'essay' ? '📝' :
                               file.fileType === 'portfolio' ? '📁' :
                               file.fileType === 'report' ? '📊' : '📄'}
                            </span>
                            <span className="text-gray-700 truncate max-w-[200px]">{file.file.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {file.status === 'analyzing' && (
                              <ArrowPathIcon className="w-4 h-4 text-yellow-600 animate-spin" />
                            )}
                            {file.status === 'complete' && (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            )}
                            {!isAnalyzing && (
                              <button
                                onClick={() => removeFile(mapping.studentId || '', file.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Analysis Results Summary */}
                  {hasAnalysisResults(mapping.studentId || '') && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        분석 완료
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mapping.analysisResults?.slice(0, 1).map(result => (
                          <div key={result.fileId} className="text-xs text-gray-600">
                            <span className="font-medium">주제:</span> {result.mainTopic}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Input Option */}
                  {mapping.files.length === 0 && !isAnalyzing && (
                    <div className="mt-3">
                      <TextInputCollapsible
                        onSubmit={(text) => handleTextInput(mapping.studentId || '', text)}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {mappings.filter(m => m.files.length > 0).length}명의 학생에게 파일이 배정됨
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-all"
              >
                닫기
              </button>
              <button
                onClick={analyzeAllStudents}
                disabled={isAnalyzing || mappings.every(m => m.files.length === 0)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    전체 분석 시작
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 텍스트 입력 접이식 컴포넌트
const TextInputCollapsible: React.FC<{ onSubmit: (text: string) => void }> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
      setIsOpen(false);
    }
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          직접 텍스트 입력
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="활동 내용을 직접 입력하세요..."
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActivityFileManager;
