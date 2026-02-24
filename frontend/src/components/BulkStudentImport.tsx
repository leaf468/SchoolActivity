import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  TableCellsIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { TeacherStudentInfo, MajorTrack } from '../types/schoolActivity';

interface BulkStudentImportProps {
  onImport: (students: TeacherStudentInfo[]) => void;
  onClose: () => void;
}

interface ParsedStudent {
  name: string;
  classNumber?: string;
  desiredMajor?: string;
  track?: MajorTrack;
  isValid: boolean;
  error?: string;
}

const BulkStudentImport: React.FC<BulkStudentImportProps> = ({ onImport, onClose }) => {
  const [inputMode, setInputMode] = useState<'paste' | 'file'>('paste');
  const [textInput, setTextInput] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const trackMapping: Record<string, MajorTrack> = {
    '상경': '상경계열',
    '상경계열': '상경계열',
    '경영': '상경계열',
    '경제': '상경계열',
    '공학': '공학계열',
    '공학계열': '공학계열',
    '컴퓨터': '공학계열',
    '공대': '공학계열',
    '인문': '인문사회계열',
    '인문사회': '인문사회계열',
    '인문사회계열': '인문사회계열',
    '사회': '인문사회계열',
    '자연': '자연과학계열',
    '자연과학': '자연과학계열',
    '자연과학계열': '자연과학계열',
    '이과': '자연과학계열',
    '의생명': '의생명계열',
    '의생명계열': '의생명계열',
    '의대': '의생명계열',
    '의학': '의생명계열',
  };

  const inferTrack = (major: string): MajorTrack => {
    const lowerMajor = major.toLowerCase();

    // 의생명계열
    if (/의|약|간호|치의|한의|생명과학|생물/.test(lowerMajor)) {
      return '의생명계열';
    }
    // 공학계열
    if (/공학|컴퓨터|전자|기계|소프트웨어|it|ai|데이터/.test(lowerMajor)) {
      return '공학계열';
    }
    // 상경계열
    if (/경영|경제|회계|금융|무역|마케팅|상경/.test(lowerMajor)) {
      return '상경계열';
    }
    // 자연과학계열
    if (/수학|물리|화학|통계|자연과학/.test(lowerMajor)) {
      return '자연과학계열';
    }
    // 인문사회계열
    if (/인문|사회|심리|교육|언어|문학|역사|철학|법학|정치|행정|사회학/.test(lowerMajor)) {
      return '인문사회계열';
    }

    return '상경계열'; // 기본값
  };

  const parseStudents = useCallback((text: string): ParsedStudent[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const students: ParsedStudent[] = [];

    for (const line of lines) {
      // 다양한 구분자 지원: 탭, 쉼표, |
      const parts = line.split(/[\t,|]/).map(p => p.trim()).filter(p => p);

      if (parts.length === 0) continue;

      // 첫 번째 컬럼: 이름 (필수)
      const name = parts[0];

      if (!name || name.length < 2) {
        students.push({
          name: name || '(빈 이름)',
          isValid: false,
          error: '이름이 올바르지 않습니다 (2자 이상)',
        });
        continue;
      }

      // 숫자로 시작하면 헤더 행일 수 있음 (번호, 이름...)
      if (/^\d+$/.test(name) && parts.length > 1) {
        const realName = parts[1];
        if (realName && realName.length >= 2) {
          students.push({
            name: realName,
            classNumber: `${name}번`,
            desiredMajor: parts[2] || undefined,
            track: parts[3] ? (trackMapping[parts[3]] || inferTrack(parts[2] || '')) : (parts[2] ? inferTrack(parts[2]) : undefined),
            isValid: true,
          });
          continue;
        }
      }

      // 일반 파싱: 이름, 반/번호, 희망전공, 계열
      students.push({
        name,
        classNumber: parts[1] || undefined,
        desiredMajor: parts[2] || undefined,
        track: parts[3] ? (trackMapping[parts[3]] || inferTrack(parts[2] || '')) : (parts[2] ? inferTrack(parts[2]) : undefined),
        isValid: true,
      });
    }

    return students;
  }, []);

  const parseCSVFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'));
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  const handleTextParse = useCallback(() => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseStudents(textInput);
      setParsedStudents(parsed);
      setShowPreview(true);
      setIsProcessing(false);
    }, 300);
  }, [textInput, parseStudents]);

  const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const validExtensions = ['.csv', '.txt', '.tsv'];
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!validExtensions.includes(ext)) {
      alert('CSV, TXT, TSV 파일만 지원됩니다.');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await parseCSVFile(file);
      const parsed = parseStudents(text);
      setParsedStudents(parsed);
      setShowPreview(true);
    } catch (error) {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSVFile, parseStudents]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const text = await parseCSVFile(files[0]);
      const parsed = parseStudents(text);
      setParsedStudents(parsed);
      setShowPreview(true);
    } catch (error) {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSVFile, parseStudents]);

  const handleImport = useCallback(() => {
    const validStudents = parsedStudents.filter(s => s.isValid);

    const teacherStudents: TeacherStudentInfo[] = validStudents.map(s => ({
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: s.name,
      classNumber: s.classNumber,
      desiredMajor: s.desiredMajor,
      track: s.track,
    }));

    onImport(teacherStudents);
    onClose();
  }, [parsedStudents, onImport, onClose]);

  const removeStudent = useCallback((index: number) => {
    setParsedStudents(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validCount = parsedStudents.filter(s => s.isValid).length;
  const invalidCount = parsedStudents.filter(s => !s.isValid).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">학생 일괄 추가</h2>
              <p className="text-sm text-gray-500">Excel, CSV 파일 또는 텍스트로 학생 목록을 한 번에 추가하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Mode Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setInputMode('paste')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      inputMode === 'paste'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📋 텍스트 붙여넣기
                  </button>
                  <button
                    onClick={() => setInputMode('file')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      inputMode === 'file'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📁 파일 업로드
                  </button>
                </div>

                {inputMode === 'paste' ? (
                  <div className="space-y-4">
                    {/* Help Info */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-2">입력 형식 안내</p>
                          <p className="mb-2">
                            각 줄에 학생 정보를 입력하세요. 탭, 쉼표, | 로 구분합니다.
                          </p>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 font-mono text-xs">
                            <p>홍길동, 3반 12번, 경영학과, 상경계열</p>
                            <p>김철수, 3반 15번, 컴퓨터공학</p>
                            <p>이영희</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Excel에서 복사한 학생 목록을 붙여넣으세요...&#10;&#10;예시:&#10;홍길동	3반 12번	경영학과&#10;김철수	3반 15번	컴퓨터공학"
                      rows={10}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none font-mono text-sm"
                    />

                    <button
                      onClick={handleTextParse}
                      disabled={!textInput.trim() || isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          분석 중...
                        </span>
                      ) : (
                        '📊 학생 목록 분석하기'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Drop Zone */}
                    <div
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={handleFileDrop}
                      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                        isDragging
                          ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".csv,.txt,.tsv"
                        onChange={handleFileInput}
                        className="hidden"
                        id="bulk-file-input"
                      />
                      <label htmlFor="bulk-file-input" className="cursor-pointer">
                        <motion.div
                          animate={{ scale: isDragging ? 1.1 : 1 }}
                          className="flex flex-col items-center"
                        >
                          {isDragging ? (
                            <DocumentArrowUpIcon className="w-16 h-16 text-purple-600 mb-4" />
                          ) : (
                            <TableCellsIcon className="w-16 h-16 text-gray-400 mb-4" />
                          )}
                          <p className="text-lg font-semibold text-gray-700 mb-2">
                            {isDragging ? '여기에 파일을 놓으세요' : 'CSV 또는 Excel 파일 업로드'}
                          </p>
                          <p className="text-sm text-gray-500">
                            파일을 드래그하거나 클릭하여 업로드하세요
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            지원 형식: CSV, TXT, TSV
                          </p>
                        </motion.div>
                      </label>
                    </div>

                    {/* Help Info */}
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-semibold mb-1">Excel 파일 준비 방법</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Excel에서 학생 목록 열기</li>
                            <li>파일 → 다른 이름으로 저장</li>
                            <li>형식을 CSV (쉼표로 분리) 선택</li>
                            <li>저장 후 여기에 업로드</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                    >
                      ← 뒤로
                    </button>
                    <div className="flex items-center gap-3">
                      {validCount > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <CheckCircleIcon className="w-4 h-4" />
                          {validCount}명 추가 가능
                        </span>
                      )}
                      {invalidCount > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          {invalidCount}명 오류
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student List Preview */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {parsedStudents.map((student, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                        student.isValid
                          ? 'bg-white border-gray-200 hover:border-purple-300'
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          student.isValid
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                            : 'bg-red-200 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{student.name}</span>
                            {student.classNumber && (
                              <span className="text-sm text-gray-500">{student.classNumber}</span>
                            )}
                          </div>
                          {student.isValid ? (
                            <div className="flex items-center gap-2 text-sm">
                              {student.desiredMajor && (
                                <span className="text-purple-600">🎯 {student.desiredMajor}</span>
                              )}
                              {student.track && (
                                <span className="text-gray-400">· {student.track}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-red-600">{student.error}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudent(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {showPreview && validCount > 0 && (
          <div className="p-6 border-t-2 border-gray-100 bg-gray-50">
            <button
              onClick={handleImport}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-lg"
            >
              ✓ {validCount}명 학생 추가하기
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BulkStudentImport;
