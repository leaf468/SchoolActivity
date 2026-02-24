import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacher } from '../contexts/TeacherContext';
import { TeacherStudentInfo, TeacherBasicInfo, SectionType, ActivityDetails } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { activityFileAnalyzer, ActivityFile, FileAnalysisResult } from '../services/activityFileAnalyzer';

// 반/과목 카드 타입
interface ClassCard {
  id: string;
  grade: 1 | 2 | 3;
  semester: '1' | '2';
  classNumber: string; // 예: "1반", "2반"
  sectionType: SectionType;
  subject?: string;
  studentCount: number;
  createdAt: string;
}

// 학생 + 파일 통합 타입
interface StudentWithFiles extends TeacherStudentInfo {
  files: ActivityFile[];
  analysisResults: FileAnalysisResult[];
  isAnalyzing: boolean;
  activityText: string; // 직접 입력한 활동 내용
}

const TeacherDashboard: React.FC = () => {
  const { setBasicInfo, setStudentActivity } = useTeacher();

  // 반/과목 카드 관리
  const [classCards, setClassCards] = useState<ClassCard[]>(() => {
    const saved = localStorage.getItem('teacher_class_cards');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCard, setSelectedCard] = useState<ClassCard | null>(null);
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  // 새 카드 폼
  const [newCardForm, setNewCardForm] = useState({
    grade: 1 as 1 | 2 | 3,
    semester: '1' as '1' | '2',
    classNumber: '',
    sectionType: 'subject' as SectionType,
    subject: '',
  });

  // 학생 + 파일 통합 관리
  const [studentsWithFiles, setStudentsWithFiles] = useState<StudentWithFiles[]>([]);

  // Excel 업로드 ref
  const excelInputRef = useRef<HTMLInputElement>(null);

  // 인라인 학생 입력 슬롯 (10개)
  const [inlineStudents, setInlineStudents] = useState<Array<{ name: string; number: string }>>(() =>
    Array.from({ length: 10 }, () => ({ name: '', number: '' }))
  );

  // 카드 저장
  const saveClassCards = useCallback((cards: ClassCard[]) => {
    localStorage.setItem('teacher_class_cards', JSON.stringify(cards));
    setClassCards(cards);
  }, []);

  // 새 카드 추가
  const handleAddCard = () => {
    if (!newCardForm.classNumber.trim()) {
      alert('반 번호를 입력해주세요.');
      return;
    }
    if (newCardForm.sectionType === 'subject' && !newCardForm.subject.trim()) {
      alert('과목명을 입력해주세요.');
      return;
    }

    const newCard: ClassCard = {
      id: `card_${Date.now()}`,
      grade: newCardForm.grade,
      semester: newCardForm.semester,
      classNumber: newCardForm.classNumber,
      sectionType: newCardForm.sectionType,
      subject: newCardForm.subject || undefined,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };

    saveClassCards([...classCards, newCard]);
    setShowNewCardModal(false);
    setNewCardForm({
      grade: 1,
      semester: '1',
      classNumber: '',
      sectionType: 'subject',
      subject: '',
    });

    // 새로 만든 카드 선택
    handleSelectCard(newCard);
  };

  // 카드 선택
  const handleSelectCard = (card: ClassCard) => {
    setSelectedCard(card);

    // BasicInfo 설정
    const basicInfo: TeacherBasicInfo = {
      grade: card.grade,
      semester: card.semester,
      sectionType: card.sectionType,
      subject: card.subject,
    };
    setBasicInfo(basicInfo);

    // 해당 카드의 학생 목록 로드 (localStorage에서)
    const savedStudents = localStorage.getItem(`students_${card.id}`);
    if (savedStudents) {
      setStudentsWithFiles(JSON.parse(savedStudents));
    } else {
      setStudentsWithFiles([]);
    }
  };

  // 학생 목록 저장
  const saveStudents = useCallback((students: StudentWithFiles[]) => {
    if (selectedCard) {
      localStorage.setItem(`students_${selectedCard.id}`, JSON.stringify(students));
      setStudentsWithFiles(students);

      // 카드의 학생 수 업데이트
      const updatedCards = classCards.map(c =>
        c.id === selectedCard.id ? { ...c, studentCount: students.length } : c
      );
      saveClassCards(updatedCards);
    }
  }, [selectedCard, classCards, saveClassCards]);

  // 인라인 입력에서 학생 추가
  const handleAddInlineStudents = () => {
    const newStudents: StudentWithFiles[] = inlineStudents
      .filter(s => s.name.trim())
      .map((s, idx) => ({
        id: `student_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
        name: s.name.trim(),
        classNumber: s.number.trim() || undefined,
        files: [],
        analysisResults: [],
        isAnalyzing: false,
        activityText: '',
      }));

    if (newStudents.length === 0) {
      alert('학생 이름을 1명 이상 입력해주세요.');
      return;
    }

    saveStudents([...studentsWithFiles, ...newStudents]);
    // 인라인 입력 초기화
    setInlineStudents(Array.from({ length: 10 }, () => ({ name: '', number: '' })));
  };

  // 인라인 슬롯 추가 (10개 더)
  const handleAddMoreSlots = () => {
    setInlineStudents(prev => [
      ...prev,
      ...Array.from({ length: 10 }, () => ({ name: '', number: '' }))
    ]);
  };

  // 인라인 학생 입력 업데이트
  const updateInlineStudent = (index: number, field: 'name' | 'number', value: string) => {
    setInlineStudents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 인라인 슬롯 삭제
  const removeInlineSlot = (index: number) => {
    if (inlineStudents.length > 1) {
      setInlineStudents(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Excel 파싱 (학년/반/번호 자동 인식)
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      const parsedStudents: StudentWithFiles[] = [];

      // 헤더 분석
      let nameCol = -1;
      let numberCol = -1;
      let classCol = -1;
      let majorCol = -1;

      const headerCols = lines[0].split(/[,\t]/);
      headerCols.forEach((col, idx) => {
        const colLower = col.toLowerCase().trim();
        if (colLower.includes('이름') || colLower.includes('name') || colLower.includes('성명')) {
          nameCol = idx;
        }
        if (colLower.includes('번호') || colLower.includes('number') || colLower.includes('학번')) {
          numberCol = idx;
        }
        if (colLower.includes('반') || colLower.includes('class')) {
          classCol = idx;
        }
        if (colLower.includes('희망') || colLower.includes('전공') || colLower.includes('진로') || colLower.includes('major')) {
          majorCol = idx;
        }
      });

      // 헤더가 없으면 첫 번째 열을 이름으로 가정
      if (nameCol === -1) {
        nameCol = 0;
        // 첫 줄도 데이터로 처리
      }

      const startRow = nameCol === 0 ? 0 : 1;

      for (let i = startRow; i < lines.length; i++) {
        const cols = lines[i].split(/[,\t]/);
        const name = cols[nameCol]?.trim();

        if (!name || name.length < 2) continue;

        let classNumber = '';
        if (numberCol >= 0 && cols[numberCol]) {
          classNumber = cols[numberCol].trim();
        }
        if (classCol >= 0 && cols[classCol]) {
          classNumber = `${cols[classCol].trim()}반 ${classNumber}`;
        }

        const student: StudentWithFiles = {
          id: `student_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
          name,
          classNumber: classNumber || undefined,
          desiredMajor: majorCol >= 0 ? cols[majorCol]?.trim() : undefined,
          files: [],
          analysisResults: [],
          isAnalyzing: false,
          activityText: '',
        };

        parsedStudents.push(student);
      }

      if (parsedStudents.length === 0) {
        alert('학생 정보를 찾을 수 없습니다. 파일 형식을 확인해주세요.');
        return;
      }

      saveStudents([...studentsWithFiles, ...parsedStudents]);
      alert(`${parsedStudents.length}명의 학생이 추가되었습니다.`);

    } catch (error) {
      console.error('Excel 파싱 오류:', error);
      alert('파일 처리 중 오류가 발생했습니다.');
    }

    // 입력 초기화
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  // 학생별 파일 업로드
  const handleStudentFileUpload = async (studentId: string, files: FileList) => {
    const student = studentsWithFiles.find(s => s.id === studentId);
    if (!student) return;

    const newFiles: ActivityFile[] = Array.from(files).map(f => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file: f,
      studentId,
      studentName: student.name,
      fileType: activityFileAnalyzer.detectFileType(f.name),
      status: 'pending' as const,
    }));

    const updatedStudents = studentsWithFiles.map(s =>
      s.id === studentId
        ? { ...s, files: [...s.files, ...newFiles] }
        : s
    );
    saveStudents(updatedStudents);
  };

  // 학생 파일 분석
  const handleAnalyzeStudent = async (studentId: string) => {
    const student = studentsWithFiles.find(s => s.id === studentId);
    if (!student || (student.files.length === 0 && !student.activityText.trim())) {
      alert('분석할 파일이나 텍스트가 없습니다.');
      return;
    }

    // 분석 중 상태 설정
    setStudentsWithFiles(prev => prev.map(s =>
      s.id === studentId ? { ...s, isAnalyzing: true } : s
    ));

    try {
      const results: FileAnalysisResult[] = [];

      const analysisContext = {
        sectionType: selectedCard?.sectionType || 'subject',
        subject: selectedCard?.subject,
        desiredMajor: student.desiredMajor,
      };

      // 파일 분석
      for (const file of student.files) {
        const result = await activityFileAnalyzer.analyzeFile(file, analysisContext);
        if (result) {
          results.push(result);
        }
      }

      // 텍스트 입력이 있으면 텍스트 파일로 처리
      if (student.activityText.trim()) {
        const textFile: ActivityFile = {
          id: `text_${Date.now()}`,
          file: new File([student.activityText], 'input.txt', { type: 'text/plain' }),
          studentId,
          studentName: student.name,
          fileType: 'other',
          textContent: student.activityText,
          status: 'pending',
        };

        const textResult = await activityFileAnalyzer.analyzeFile(textFile, analysisContext);
        if (textResult) {
          results.push(textResult);
        }
      }

      // 결과 저장
      const updatedStudents = studentsWithFiles.map(s =>
        s.id === studentId
          ? { ...s, analysisResults: results, isAnalyzing: false }
          : s
      );
      saveStudents(updatedStudents);

    } catch (error) {
      console.error('분석 오류:', error);
      setStudentsWithFiles(prev => prev.map(s =>
        s.id === studentId ? { ...s, isAnalyzing: false } : s
      ));
      alert('분석 중 오류가 발생했습니다.');
    }
  };

  // 학생 활동 텍스트 업데이트
  const handleUpdateActivityText = (studentId: string, text: string) => {
    const updatedStudents = studentsWithFiles.map(s =>
      s.id === studentId ? { ...s, activityText: text } : s
    );
    saveStudents(updatedStudents);
  };

  // 학생 삭제
  const handleRemoveStudent = (studentId: string) => {
    if (window.confirm('이 학생을 삭제하시겠습니까?')) {
      saveStudents(studentsWithFiles.filter(s => s.id !== studentId));
    }
  };

  // 파일 삭제
  const handleRemoveFile = (studentId: string, fileId: string) => {
    const updatedStudents = studentsWithFiles.map(s =>
      s.id === studentId
        ? { ...s, files: s.files.filter(f => f.id !== fileId) }
        : s
    );
    saveStudents(updatedStudents);
  };

  // 분석 결과에서 초안 선택하여 활동에 적용
  const handleApplyDraft = (studentId: string, draft: string) => {
    const student = studentsWithFiles.find(s => s.id === studentId);
    if (!student) return;

    // TeacherContext에도 저장
    const activityDetails: ActivityDetails = {
      activities: [{
        id: Date.now().toString(),
        period: '',
        role: '',
        content: draft,
        learnings: '',
        keywords: [],
      }],
      overallEmphasis: '',
      overallKeywords: [],
      maxCharacters: 500 as const,
    };

    setStudentActivity({
      studentId,
      studentName: student.name,
      activityDetails,
      emphasisKeywords: [],
    });

    // 학생 카드의 활동 텍스트도 업데이트
    handleUpdateActivityText(studentId, draft);
  };

  // 카드 삭제
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('이 반/과목 카드를 삭제하시겠습니까? 학생 데이터도 함께 삭제됩니다.')) {
      localStorage.removeItem(`students_${cardId}`);
      const updatedCards = classCards.filter(c => c.id !== cardId);
      saveClassCards(updatedCards);

      if (selectedCard?.id === cardId) {
        setSelectedCard(null);
        setStudentsWithFiles([]);
      }
    }
  };

  // 섹션 타입 라벨
  const getSectionLabel = (type: SectionType) => {
    switch (type) {
      case 'subject': return '교과세특';
      case 'autonomy': return '자율활동';
      case 'club': return '동아리활동';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex flex-col">
      <CommonHeader />

      <div className="flex-1 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">선생님 대시보드</h1>
            <p className="text-gray-600 mt-1">반/과목별로 학생들의 생기부를 관리하세요</p>
          </div>

          <div className="flex gap-6">
            {/* 좌측: 반/과목 카드 목록 */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">내 반/과목</h2>
                  <button
                    onClick={() => setShowNewCardModal(true)}
                    className="w-8 h-8 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                </div>

                {classCards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-sm">반/과목을 추가하세요</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {classCards.map(card => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedCard?.id === card.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => handleSelectCard(card)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">
                              {card.grade}학년 {card.classNumber}
                            </div>
                            <div className={`text-xs ${selectedCard?.id === card.id ? 'text-white/80' : 'text-gray-500'}`}>
                              {card.subject || getSectionLabel(card.sectionType)}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            selectedCard?.id === card.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {card.studentCount}명
                          </div>
                        </div>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.id);
                          }}
                          className={`mt-2 text-xs ${
                            selectedCard?.id === card.id ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          삭제
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 우측: 학생 관리 영역 */}
            <div className="flex-1">
              {!selectedCard ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h2 className="text-xl font-bold text-gray-700 mb-2">반/과목을 선택하세요</h2>
                  <p className="text-gray-500">좌측에서 관리할 반/과목을 선택하거나 새로 추가하세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 선택된 카드 정보 */}
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedCard.grade}학년 {selectedCard.classNumber} · {selectedCard.subject || getSectionLabel(selectedCard.sectionType)}
                        </h2>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                          전체 {studentsWithFiles.length}명
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          분석 완료 {studentsWithFiles.filter(s => s.analysisResults.length > 0).length}명
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 인라인 학생 입력 섹션 */}
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">학생 추가</h3>
                      <label className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-1">
                        📋 Excel 일괄 추가
                        <input
                          ref={excelInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls,.txt"
                          onChange={handleExcelUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 인라인 학생 입력 그리드 - 컴팩트 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                      {inlineStudents.map((student, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-50 rounded-lg p-1.5">
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => updateInlineStudent(index, 'name', e.target.value)}
                            placeholder={`${index + 1}. 이름`}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={student.number}
                            onChange={(e) => updateInlineStudent(index, 'number', e.target.value)}
                            placeholder="번호"
                            className="w-12 px-1 py-1 text-sm border border-gray-200 rounded text-center focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => removeInlineSlot(index)}
                            className="text-gray-400 hover:text-red-500 text-sm px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddMoreSlots}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                      >
                        + 10칸 더 추가
                      </button>
                      <button
                        onClick={handleAddInlineStudents}
                        className="px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
                      >
                        학생 등록하기
                      </button>
                    </div>
                  </div>

                  {/* 등록된 학생 카드 그리드 */}
                  {studentsWithFiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {studentsWithFiles.map((student, index) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.02 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                          >
                            {/* 학생 헤더 */}
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{student.name}</h3>
                                {student.classNumber && (
                                  <span className="text-xs text-gray-500">({student.classNumber})</span>
                                )}
                                {/* 상태 뱃지 */}
                                {student.files.length > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                                    📁{student.files.length}
                                  </span>
                                )}
                                {student.analysisResults.length > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">
                                    ✓
                                  </span>
                                )}
                                {student.isAnalyzing && (
                                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded animate-pulse">
                                    ...
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveStudent(student.id)}
                                className="text-gray-400 hover:text-red-500 text-lg"
                              >
                                ×
                              </button>
                            </div>

                            {/* 활동 내용 입력 & 분석 */}
                            <div className="p-3 space-y-2">
                              {/* 활동 내용 직접 입력 (먼저) */}
                              <textarea
                                value={student.activityText}
                                onChange={(e) => handleUpdateActivityText(student.id, e.target.value)}
                                placeholder="활동 내용 직접 입력..."
                                rows={2}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm resize-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                              />

                              {/* 분석 결과 */}
                              {student.analysisResults.length > 0 && (
                                <div className="p-2 bg-green-50 rounded-lg">
                                  <p className="text-xs font-bold text-green-700 mb-1">AI 분석 결과</p>
                                  {student.analysisResults[0].writingOptions?.slice(0, 2).map((option, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleApplyDraft(student.id, option.draft)}
                                      className="w-full text-left p-1.5 mb-1 bg-white rounded text-xs hover:bg-green-100 transition border border-green-200"
                                    >
                                      <span className="font-medium text-green-700">{option.style}</span>
                                      <p className="text-gray-600 truncate">{option.draft.slice(0, 50)}...</p>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* 파일 업로드 영역 (아래로 이동) */}
                              <div
                                className="border border-dashed border-gray-200 rounded-lg p-2 text-center hover:border-purple-400 transition cursor-pointer bg-gray-50"
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('border-purple-400', 'bg-purple-50');
                                }}
                                onDragLeave={(e) => {
                                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                                  if (e.dataTransfer.files.length > 0) {
                                    handleStudentFileUpload(student.id, e.dataTransfer.files);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.accept = '.pdf,.doc,.docx,.txt,.hwp';
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files) {
                                      handleStudentFileUpload(student.id, files);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                <p className="text-xs text-gray-500">📄 첨부파일 드래그/클릭</p>
                              </div>

                              {/* 업로드된 파일 목록 */}
                              {student.files.length > 0 && (
                                <div className="space-y-1">
                                  {student.files.map(file => (
                                    <div key={file.id} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                                      <span className="truncate flex-1">{file.file?.name || '파일'}</span>
                                      <button
                                        onClick={() => handleRemoveFile(student.id, file.id)}
                                        className="ml-1 text-gray-400 hover:text-red-500"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 분석 버튼 */}
                              <button
                                onClick={() => handleAnalyzeStudent(student.id)}
                                disabled={student.isAnalyzing || (student.files.length === 0 && !student.activityText.trim())}
                                className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs"
                              >
                                {student.isAnalyzing ? '분석 중...' : '🔍 AI 분석'}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 새 카드 추가 모달 */}
      <AnimatePresence>
        {showNewCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">새 반/과목 추가</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                    <select
                      value={newCardForm.grade}
                      onChange={(e) => setNewCardForm({ ...newCardForm, grade: Number(e.target.value) as 1 | 2 | 3 })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value={1}>1학년</option>
                      <option value={2}>2학년</option>
                      <option value={3}>3학년</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학기</label>
                    <select
                      value={newCardForm.semester}
                      onChange={(e) => setNewCardForm({ ...newCardForm, semester: e.target.value as '1' | '2' })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="1">1학기</option>
                      <option value="2">2학기</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">반</label>
                  <input
                    type="text"
                    value={newCardForm.classNumber}
                    onChange={(e) => setNewCardForm({ ...newCardForm, classNumber: e.target.value })}
                    placeholder="예: 1반, 2반"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">영역</label>
                  <select
                    value={newCardForm.sectionType}
                    onChange={(e) => setNewCardForm({ ...newCardForm, sectionType: e.target.value as SectionType })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="subject">교과세특</option>
                    <option value="autonomy">자율활동</option>
                    <option value="club">동아리활동</option>
                    <option value="career">진로활동</option>
                    <option value="behavior">행동특성</option>
                  </select>
                </div>

                {newCardForm.sectionType === 'subject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">과목명</label>
                    <input
                      type="text"
                      value={newCardForm.subject}
                      onChange={(e) => setNewCardForm({ ...newCardForm, subject: e.target.value })}
                      placeholder="예: 수학, 국어, 영어"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewCardModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  추가
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommonFooter />
    </div>
  );
};

export default TeacherDashboard;
