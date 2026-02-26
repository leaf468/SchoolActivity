import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacher } from '../contexts/TeacherContext';
import { TeacherStudentInfo, MajorTrack, SingleActivity, ActivityDetails, SectionType } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import BulkStudentImport from '../components/BulkStudentImport';
import { ActivityTemplates, ActivityTemplate } from '../components/ActivityTemplates';
import StudentDataAnalysisPanel from '../components/StudentDataAnalysisPanel';
import StudentActivityFilePanel from '../components/StudentActivityFilePanel';
import BulkActivityFileManager from '../components/BulkActivityFileManager';
import CustomSelect from '../components/ui/CustomSelect';
import { AnalyzedStudentData } from '../services/studentDataAnalyzer';
import { BulkFileMapping } from '../services/activityFileAnalyzer';

// 반 정보 인터페이스
interface ClassInfo {
  id: string;
  classNumber: string; // 예: "1반", "2반"
  students: TeacherStudentInfo[];
}

const TeacherPage2StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { state, addStudent, removeStudent, setStudentActivity, setCurrentStep } = useTeacher();

  // 반 관리 상태
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // 학생 입력 상태 (인라인 입력용)
  const [inlineStudents, setInlineStudents] = useState<Array<{
    id: string;
    name: string;
    studentNumber: string; // 번호
    desiredMajor: string;
    track: MajorTrack;
    files: File[];
  }>>([]);

  // 모달 상태
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showActivityFilePanel, setShowActivityFilePanel] = useState(false);
  const [showBulkFileManager, setShowBulkFileManager] = useState(false);
  const [currentEditingStudent, setCurrentEditingStudent] = useState<string | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // 간편 모드 / 전문 모드 토글
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  // 활동 입력 폼
  const [activityForm, setActivityForm] = useState<SingleActivity[]>([
    { id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }
  ]);
  const [activityKeywordInput, setActivityKeywordInput] = useState('');
  const [overallEmphasis, setOverallEmphasis] = useState('');
  const [overallKeywords, setOverallKeywords] = useState<string[]>([]);
  const [overallKeywordInput, setOverallKeywordInput] = useState('');

  // 간편 모드용 통합 입력
  const [simpleContent, setSimpleContent] = useState('');

  // 파일 입력 ref
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 초기화: 빈 학생 입력란 10개 생성
  useEffect(() => {
    if (inlineStudents.length === 0) {
      const initialStudents = Array.from({ length: 10 }, (_, i) => ({
        id: `temp_${Date.now()}_${i}`,
        name: '',
        studentNumber: '',
        desiredMajor: '',
        track: '상경계열' as MajorTrack,
        files: [],
      }));
      setInlineStudents(initialStudents);
    }
  }, []);

  // 클래스 기반으로 학생 그룹화
  useEffect(() => {
    // state.students에서 반별로 그룹화
    const classMap = new Map<string, TeacherStudentInfo[]>();

    state.students.forEach(student => {
      const classNum = student.classNumber?.match(/(\d+)반/)?.[1] || '미지정';
      const className = classNum === '미지정' ? '미지정' : `${classNum}반`;

      if (!classMap.has(className)) {
        classMap.set(className, []);
      }
      classMap.get(className)!.push(student);
    });

    const newClasses: ClassInfo[] = Array.from(classMap.entries()).map(([classNumber, students]) => ({
      id: `class_${classNumber}`,
      classNumber,
      students,
    }));

    setClasses(newClasses);
  }, [state.students]);

  // 인라인 학생 추가
  const addMoreStudentRows = (count: number = 5) => {
    const newStudents = Array.from({ length: count }, (_, i) => ({
      id: `temp_${Date.now()}_${i}`,
      name: '',
      studentNumber: '',
      desiredMajor: '',
      track: '상경계열' as MajorTrack,
      files: [],
    }));
    setInlineStudents([...inlineStudents, ...newStudents]);
  };

  // 인라인 학생 정보 업데이트
  const updateInlineStudent = (index: number, field: string, value: string) => {
    const updated = [...inlineStudents];
    updated[index] = { ...updated[index], [field]: value };
    setInlineStudents(updated);
  };

  // 인라인 학생 삭제
  const removeInlineStudent = (index: number) => {
    const updated = inlineStudents.filter((_, i) => i !== index);
    setInlineStudents(updated);
  };

  // 인라인 학생 파일 추가
  const handleFileAdd = (index: number, files: FileList | null) => {
    if (!files) return;
    const updated = [...inlineStudents];
    updated[index] = {
      ...updated[index],
      files: [...updated[index].files, ...Array.from(files)],
    };
    setInlineStudents(updated);
  };

  // 유효한 학생만 저장
  const saveValidStudents = () => {
    const validStudents = inlineStudents.filter(s => s.name.trim() !== '');

    validStudents.forEach(student => {
      const classNumber = selectedClassId
        ? classes.find(c => c.id === selectedClassId)?.classNumber
        : '';

      const fullClassNumber = classNumber ? `${classNumber} ${student.studentNumber}번` : student.studentNumber ? `${student.studentNumber}번` : undefined;

      // 이름과 반 번호로 중복 체크 (임시 ID가 아닌 실제 데이터로 체크)
      const isDuplicate = state.students.some(s =>
        s.name === student.name &&
        s.classNumber === fullClassNumber
      );

      if (!isDuplicate) {
        const newStudent: TeacherStudentInfo = {
          id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: student.name,
          classNumber: fullClassNumber,
          desiredMajor: student.desiredMajor || undefined,
          track: student.desiredMajor ? student.track : undefined,
        };

        addStudent(newStudent);
      }
    });

    // 저장 후 인라인 입력란 초기화
    setInlineStudents(Array.from({ length: 10 }, (_, i) => ({
      id: `temp_${Date.now()}_${i}`,
      name: '',
      studentNumber: '',
      desiredMajor: '',
      track: '상경계열' as MajorTrack,
      files: [],
    })));
  };

  // 반 추가
  const handleAddClass = () => {
    if (!newClassName.trim()) return;

    const newClass: ClassInfo = {
      id: `class_${Date.now()}`,
      classNumber: newClassName.includes('반') ? newClassName : `${newClassName}반`,
      students: [],
    };

    setClasses([...classes, newClass]);
    setSelectedClassId(newClass.id);
    setNewClassName('');
    setShowAddClassModal(false);

    // 새 반 선택시 빈 입력란 초기화
    setInlineStudents(Array.from({ length: 10 }, (_, i) => ({
      id: `temp_${Date.now()}_${i}`,
      name: '',
      studentNumber: '',
      desiredMajor: '',
      track: '상경계열' as MajorTrack,
      files: [],
    })));
  };

  // 반 삭제
  const handleRemoveClass = (classId: string) => {
    const classToRemove = classes.find(c => c.id === classId);
    if (!classToRemove) return;

    // 해당 반의 학생들도 삭제
    classToRemove.students.forEach(student => {
      removeStudent(student.id);
    });

    setClasses(classes.filter(c => c.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
  };

  // 활동 데이터 유무 확인
  const hasActivityData = (studentId: string): boolean => {
    return state.studentActivities.some(a => a.studentId === studentId);
  };

  // 통계
  const stats = {
    total: state.students.length,
    completed: state.students.filter(s => hasActivityData(s.id)).length,
    pending: state.students.filter(s => !hasActivityData(s.id)).length,
    classCount: classes.length,
  };

  // 일괄 추가 핸들러
  const handleBulkImport = (students: TeacherStudentInfo[]) => {
    students.forEach(student => addStudent(student));
  };

  // 템플릿 적용
  const handleApplyTemplate = (template: ActivityTemplate) => {
    const newActivities: SingleActivity[] = template.activities.map((act, idx) => ({
      id: `${Date.now()}_${idx}`,
      period: act.period || '',
      role: act.role || '',
      content: act.content || '',
      learnings: act.learnings || '',
      keywords: act.keywords || [],
    }));

    setActivityForm(newActivities);
    setOverallEmphasis(template.overallEmphasis || '');
    setOverallKeywords(template.overallKeywords || []);
  };

  // AI 분석 결과 적용
  const handleApplyAnalysis = (analysis: AnalyzedStudentData) => {
    const newActivities: SingleActivity[] = analysis.keyActivities.slice(0, 5).map((act, idx) => ({
      id: `${Date.now()}_${idx}`,
      period: '',
      role: act.role || '',
      content: act.activity + (act.achievement ? ` ${act.achievement}` : ''),
      learnings: act.learnings || '',
      keywords: [],
    }));

    if (newActivities.length > 0) {
      setActivityForm(newActivities);
    }

    setOverallEmphasis(analysis.summary);
    setOverallKeywords([...analysis.careerKeywords.slice(0, 3), ...analysis.coreCompetencies.slice(0, 2)]);
  };

  // 생성된 텍스트 적용
  const handleApplyGeneratedText = (text: string) => {
    setActivityForm([{
      id: Date.now().toString(),
      period: '',
      role: '',
      content: text,
      learnings: '',
      keywords: [],
    }]);
    setOverallEmphasis('AI 분석 기반 생성');
  };

  // 파일 분석 초안 적용
  const handleApplyFileDraft = (draft: string) => {
    setActivityForm([{
      id: Date.now().toString(),
      period: '',
      role: '',
      content: draft,
      learnings: '',
      keywords: [],
    }]);
    setOverallEmphasis('AI 분석 기반 생성');
  };

  // 활동 모달 열기
  const handleOpenActivityModal = (studentId: string) => {
    setCurrentEditingStudent(studentId);

    const existingActivity = state.studentActivities.find(a => a.studentId === studentId);
    if (existingActivity) {
      const details = existingActivity.activityDetails;
      if ('activities' in details) {
        setActivityForm(details.activities);
        setOverallEmphasis(details.overallEmphasis || '');
        setOverallKeywords(details.overallKeywords || []);

        // 기존 데이터를 간편 모드로도 표시
        if (details.activities.length === 1 && details.activities[0].content) {
          setSimpleContent(details.activities[0].content);
        } else {
          setSimpleContent('');
        }
      }
    } else {
      setActivityForm([{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }]);
      setOverallEmphasis('');
      setOverallKeywords([]);
      setSimpleContent('');
    }

    // 기본값은 간편 모드
    setIsSimpleMode(true);
    setShowActivityModal(true);
  };

  // 활동 저장
  const handleSaveActivity = () => {
    if (!currentEditingStudent) return;

    const student = state.students.find(s => s.id === currentEditingStudent);
    if (!student) return;

    // 간편 모드인 경우
    if (isSimpleMode) {
      if (!simpleContent.trim()) {
        alert('활동 내용을 입력해주세요.');
        return;
      }

      // 간편 모드 내용을 첫 번째 활동으로 변환
      const singleActivity: SingleActivity = {
        id: '1',
        period: '',
        role: '',
        content: simpleContent.trim(),
        learnings: '',
        keywords: overallKeywords,
      };

      setActivityForm([singleActivity]);
    } else {
      // 전문 모드인 경우 기존 로직
      const hasContent = activityForm.some(a => a.content.trim().length > 0);
      if (!hasContent) {
        alert('최소 1개 활동의 내용을 입력해주세요.');
        return;
      }
    }

    let activityDetails: ActivityDetails;

    switch (state.basicInfo?.sectionType) {
      case 'subject':
        activityDetails = {
          subject: state.basicInfo.subject || '',
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'club':
        activityDetails = {
          clubName: overallEmphasis || '동아리',
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'autonomy':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      case 'career':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 700,
        };
        break;
      case 'behavior':
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
        break;
      default:
        activityDetails = {
          activities: activityForm,
          overallEmphasis,
          overallKeywords,
          maxCharacters: 500,
        };
    }

    setStudentActivity({
      studentId: currentEditingStudent,
      studentName: student.name,
      activityDetails,
      emphasisKeywords: overallKeywords,
    });

    setShowActivityModal(false);
    setCurrentEditingStudent(null);
  };

  // 활동 추가/삭제/업데이트
  const addActivity = () => {
    setActivityForm([
      ...activityForm,
      { id: Date.now().toString(), period: '', role: '', content: '', learnings: '', keywords: [] }
    ]);
  };

  const removeActivity = (id: string) => {
    if (activityForm.length > 1) {
      setActivityForm(activityForm.filter(a => a.id !== id));
    }
  };

  const updateActivity = (id: string, field: keyof SingleActivity, value: string | string[]) => {
    setActivityForm(activityForm.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addKeywordToActivity = (activityId: string, keyword: string) => {
    if (!keyword.trim()) return;
    setActivityForm(activityForm.map(a => {
      if (a.id === activityId) {
        const currentKeywords = a.keywords || [];
        if (currentKeywords.includes(keyword.trim())) {
          return { ...a, keywords: currentKeywords.filter(k => k !== keyword.trim()) };
        } else {
          return { ...a, keywords: [...currentKeywords, keyword.trim()] };
        }
      }
      return a;
    }));
  };

  const removeKeywordFromActivity = (activityId: string, keyword: string) => {
    setActivityForm(activityForm.map(a =>
      a.id === activityId
        ? { ...a, keywords: (a.keywords || []).filter(k => k !== keyword) }
        : a
    ));
  };

  const addOverallKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    if (overallKeywords.includes(keyword.trim())) {
      setOverallKeywords(overallKeywords.filter(k => k !== keyword.trim()));
    } else {
      setOverallKeywords([...overallKeywords, keyword.trim()]);
    }
  };

  // 네비게이션
  const handleNext = () => {
    // 먼저 유효한 학생들 저장
    saveValidStudents();

    if (state.students.length === 0) {
      alert('최소 1명의 학생을 추가해주세요.');
      return;
    }

    const studentsWithoutActivities = state.students.filter(
      s => !state.studentActivities.find(a => a.studentId === s.id)
    );

    if (studentsWithoutActivities.length > 0) {
      const names = studentsWithoutActivities.map(s => s.name).join(', ');
      const confirm = window.confirm(
        `${names} 학생의 활동이 입력되지 않았습니다.\n그래도 계속하시겠습니까?`
      );
      if (!confirm) return;
    }

    setCurrentStep('review');
    navigate('/teacher/review');
  };

  const handlePrev = () => {
    navigate('/teacher/basic');
  };

  useEffect(() => {
    if (!state.basicInfo) {
      navigate('/teacher/basic');
    }
  }, [state.basicInfo, navigate]);

  if (!state.basicInfo) {
    return null;
  }

  // 섹션 타입 라벨
  const getSectionLabel = (sectionType: SectionType) => {
    switch (sectionType) {
      case 'subject': return `${state.basicInfo?.subject || ''} 교과세특`;
      case 'autonomy': return '자율활동';
      case 'club': return '동아리활동';
      case 'career': return '진로활동';
      case 'behavior': return '행동특성';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <CommonHeader />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-2">
                  <span>👨‍🏫</span>
                  <span>선생님 모드</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
                <p className="text-gray-600 mt-1">
                  {state.basicInfo.grade}학년 {state.basicInfo.semester}학기 · {getSectionLabel(state.basicInfo.sectionType)}
                </p>
              </div>

              {/* 우상단 버튼 그룹 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition flex items-center gap-2 text-sm"
                >
                  <span>📋</span>
                  엑셀에서 일괄 추가
                </button>
                {state.students.length > 0 && (
                  <button
                    onClick={() => setShowBulkFileManager(true)}
                    className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition flex items-center gap-2 text-sm"
                  >
                    <span>📁</span>
                    일괄 파일 관리
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{stats.classCount}</p>
              <p className="text-sm text-gray-600">등록된 반</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">전체 학생</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">입력 완료</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
              <p className="text-sm text-gray-600">입력 대기</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 좌측: 반 카드 목록 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>🏫</span>
                    반 목록
                  </h2>
                </div>

                <div className="p-3 space-y-2">
                  {/* 전체 보기 */}
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedClassId === null
                        ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">전체 보기</span>
                      <span className="text-sm bg-white px-2 py-0.5 rounded-full">
                        {state.students.length}명
                      </span>
                    </div>
                  </button>

                  {/* 반별 카드 */}
                  {classes.map(classInfo => (
                    <motion.div
                      key={classInfo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative group p-3 rounded-lg cursor-pointer transition ${
                        selectedClassId === classInfo.id
                          ? 'bg-indigo-100 border-2 border-indigo-400'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedClassId(classInfo.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          selectedClassId === classInfo.id ? 'text-indigo-800' : 'text-gray-700'
                        }`}>
                          {classInfo.classNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-white px-2 py-0.5 rounded-full">
                            {classInfo.students.length}명
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`${classInfo.classNumber}을(를) 삭제하시겠습니까?`)) {
                                handleRemoveClass(classInfo.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {/* 완료율 바 */}
                      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${classInfo.students.length > 0
                              ? (classInfo.students.filter(s => hasActivityData(s.id)).length / classInfo.students.length) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* 반 추가 버튼 */}
                  <button
                    onClick={() => setShowAddClassModal(true)}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    <span>반 추가</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 우측: 학생 입력/목록 영역 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <span>👨‍🎓</span>
                    {selectedClassId
                      ? `${classes.find(c => c.id === selectedClassId)?.classNumber} 학생`
                      : '전체 학생'
                    }
                  </h2>
                  <div className="text-sm text-gray-500">
                    {selectedClassId
                      ? `${classes.find(c => c.id === selectedClassId)?.students.length || 0}명`
                      : `${state.students.length}명`
                    }
                  </div>
                </div>

                {/* 인라인 학생 입력 폼 */}
                <div className="p-4">
                  {/* 테이블 헤더 */}
                  <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-2 text-sm font-medium text-gray-500">
                    <div className="col-span-1">번호</div>
                    <div className="col-span-2">이름</div>
                    <div className="col-span-2">희망진로</div>
                    <div className="col-span-2">계열</div>
                    <div className="col-span-3">첨부파일</div>
                    <div className="col-span-2">관리</div>
                  </div>

                  {/* 기존 저장된 학생 목록 */}
                  {(selectedClassId
                    ? classes.find(c => c.id === selectedClassId)?.students || []
                    : state.students
                  ).map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mb-2 rounded-lg border-2 overflow-hidden ${
                        hasActivityData(student.id)
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* 학생 기본 정보 행 */}
                      <div
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                      >
                        <div className="md:col-span-1 flex items-center gap-2">
                          <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          {hasActivityData(student.id) && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </div>
                        <div className="md:col-span-2 font-medium text-gray-800">
                          {student.name}
                        </div>
                        <div className="md:col-span-2 text-gray-600 text-sm">
                          {student.desiredMajor || '-'}
                        </div>
                        <div className="md:col-span-2 text-gray-600 text-sm">
                          {student.track || '-'}
                        </div>
                        <div className="md:col-span-3 text-gray-500 text-sm">
                          <span className="text-indigo-600">
                            {expandedStudentId === student.id ? '▼ 접기' : '▶ 펼치기'}
                          </span>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenActivityModal(student.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              hasActivityData(student.id)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {hasActivityData(student.id) ? '수정' : '입력'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
                                removeStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* 확장된 파일 관리 영역 */}
                      <AnimatePresence>
                        {expandedStudentId === student.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 bg-gray-50 p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">📎 첨부파일 관리</h4>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={(el) => { fileInputRefs.current[student.id] = el; }}
                                onChange={(e) => {
                                  // TODO: 파일 업로드 로직 구현
                                  console.log('Files:', e.target.files);
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current[student.id]?.click()}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
                              >
                                + 파일 추가
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">
                              소논문, 포트폴리오, 활동 증빙자료 등을 추가하세요.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {/* 구분선 */}
                  {state.students.length > 0 && (
                    <div className="my-6 border-t-2 border-dashed border-gray-200 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm text-gray-400">
                        새 학생 추가
                      </span>
                    </div>
                  )}

                  {/* 인라인 입력 폼 */}
                  <div className="space-y-2">
                    {inlineStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg items-center"
                      >
                        <div className="md:col-span-1">
                          <span className="text-sm text-gray-500">
                            {(selectedClassId
                              ? classes.find(c => c.id === selectedClassId)?.students.length || 0
                              : state.students.length
                            ) + index + 1}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => updateInlineStudent(index, 'name', e.target.value)}
                            placeholder="이름"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={student.desiredMajor}
                            onChange={(e) => updateInlineStudent(index, 'desiredMajor', e.target.value)}
                            placeholder="희망진로"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <CustomSelect
                            value={student.track}
                            onChange={(val) => updateInlineStudent(index, 'track', val)}
                            options={[
                              { value: '상경계열', label: '상경계열' },
                              { value: '공학계열', label: '공학계열' },
                              { value: '인문사회계열', label: '인문사회계열' },
                              { value: '자연과학계열', label: '자연과학계열' },
                              { value: '의생명계열', label: '의생명계열' },
                            ]}
                            className="text-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[`inline_${index}`] = el; }}
                              onChange={(e) => handleFileAdd(index, e.target.files)}
                            />
                            <button
                              onClick={() => fileInputRefs.current[`inline_${index}`]?.click()}
                              className="px-2 py-1.5 text-xs bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                            >
                              📎 파일
                            </button>
                            {student.files.length > 0 && (
                              <span className="text-xs text-indigo-600">
                                {student.files.length}개
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            onClick={() => removeInlineStudent(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 학생 추가 버튼 */}
                  <button
                    onClick={() => addMoreStudentRows(5)}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    <span>학생 5명 추가</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition"
            >
              ← 이전 단계
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transition"
            >
              다음: 일괄 생성 →
            </button>
          </div>

          {/* 진행 표시 */}
          <div className="mt-6 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* 반 추가 모달 */}
      <AnimatePresence>
        {showAddClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">반 추가</h2>
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반 이름
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 1반, 2반"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddClass();
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleAddClass}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  추가
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 활동 입력 모달 */}
      {showActivityModal && currentEditingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {state.students.find(s => s.id === currentEditingStudent)?.name} - 활동 입력
                </h2>
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setCurrentEditingStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              {/* 빠른 템플릿 버튼 및 AI 분석 토글 */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md text-sm flex items-center gap-2"
                >
                  ⚡ 빠른 템플릿
                </button>
                <button
                  onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all shadow-md text-sm flex items-center gap-2 ${
                    showAnalysisPanel
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700'
                  }`}
                >
                  🤖 {showAnalysisPanel ? 'AI 분석 패널 닫기' : '기존 자료 AI 분석'}
                </button>
                <button
                  onClick={() => setShowActivityFilePanel(!showActivityFilePanel)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all shadow-md text-sm flex items-center gap-2 ${
                    showActivityFilePanel
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                  }`}
                >
                  📄 {showActivityFilePanel ? '파일 분석 패널 닫기' : '소논문/포폴 업로드'}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI 분석 패널 */}
              {showAnalysisPanel && currentEditingStudent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <StudentDataAnalysisPanel
                    studentName={state.students.find(s => s.id === currentEditingStudent)?.name || ''}
                    studentGrade={state.basicInfo?.grade}
                    desiredMajor={state.students.find(s => s.id === currentEditingStudent)?.desiredMajor}
                    track={state.students.find(s => s.id === currentEditingStudent)?.track}
                    sectionType={state.basicInfo?.sectionType || 'subject'}
                    onAnalysisComplete={handleApplyAnalysis}
                    onGeneratedText={handleApplyGeneratedText}
                  />
                </motion.div>
              )}

              {/* 활동 파일 분석 패널 */}
              {showActivityFilePanel && currentEditingStudent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <StudentActivityFilePanel
                    studentName={state.students.find(s => s.id === currentEditingStudent)?.name || ''}
                    studentId={currentEditingStudent}
                    sectionType={state.basicInfo?.sectionType || 'subject'}
                    subject={state.basicInfo?.subject}
                    desiredMajor={state.students.find(s => s.id === currentEditingStudent)?.desiredMajor}
                    onSelectDraft={handleApplyFileDraft}
                    onClose={() => setShowActivityFilePanel(false)}
                  />
                </motion.div>
              )}

              {/* 입력 모드 토글 */}
              <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
                <button
                  onClick={() => setIsSimpleMode(true)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isSimpleMode
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  간편 입력
                </button>
                <button
                  onClick={() => setIsSimpleMode(false)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    !isSimpleMode
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  전문 버젼
                </button>
              </div>

              {/* 간편 입력 모드 */}
              {isSimpleMode ? (
                <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    활동 내용 입력 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={simpleContent}
                    onChange={(e) => setSimpleContent(e.target.value)}
                    placeholder="학생의 활동 내용을 자유롭게 입력해주세요. AI가 교과세특 형식에 맞게 변환해드립니다."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              ) : (
                <>
                  {/* 전문 버젼 - 활동 목록 */}
                  {activityForm.map((activity, index) => (
                    <div key={activity.id} className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">활동 {index + 1}</h3>
                        </div>
                        {activityForm.length > 1 && (
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition-all"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            활동 기간 <span className="text-gray-400">(선택)</span>
                          </label>
                          <input
                            type="text"
                            value={activity.period || ''}
                            onChange={(e) => updateActivity(activity.id, 'period', e.target.value)}
                            placeholder="예: 2024.03~06"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            활동 내용 <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={activity.content}
                            onChange={(e) => updateActivity(activity.id, 'content', e.target.value)}
                            placeholder="구체적 활동 내용"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            깨달은 바 <span className="text-gray-400">(선택)</span>
                          </label>
                          <textarea
                            value={activity.learnings || ''}
                            onChange={(e) => updateActivity(activity.id, 'learnings', e.target.value)}
                            placeholder="배운 점, 성장"
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">키워드</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={activityKeywordInput}
                              onChange={(e) => setActivityKeywordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addKeywordToActivity(activity.id, activityKeywordInput);
                                  setActivityKeywordInput('');
                                }
                              }}
                              placeholder="키워드 입력 (Enter)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                addKeywordToActivity(activity.id, activityKeywordInput);
                                setActivityKeywordInput('');
                              }}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                            >
                              추가
                            </button>
                          </div>
                          {activity.keywords && activity.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {activity.keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                                  {kw}
                                  <button onClick={() => removeKeywordFromActivity(activity.id, kw)} className="font-bold hover:text-indigo-900">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addActivity}
                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all"
                  >
                    + 활동 추가
                  </button>
                </>
              )}

              {/* 강조 키워드 (간편 모드에서만 표시) */}
              {isSimpleMode && (
                <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-3">강조 키워드 (선택)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={overallKeywordInput}
                      onChange={(e) => setOverallKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addOverallKeyword(overallKeywordInput);
                          setOverallKeywordInput('');
                        }
                      }}
                      placeholder="키워드 입력 후 Enter"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        addOverallKeyword(overallKeywordInput);
                        setOverallKeywordInput('');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      추가
                    </button>
                  </div>
                  {overallKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {overallKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                          {kw}
                          <button onClick={() => setOverallKeywords(overallKeywords.filter(k => k !== kw))} className="font-bold hover:text-indigo-900">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setCurrentEditingStudent(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveActivity}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 추가 모달 */}
      {showBulkImportModal && (
        <BulkStudentImport
          onImport={handleBulkImport}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}

      {/* 템플릿 선택 모달 */}
      {showTemplateModal && state.basicInfo && (
        <ActivityTemplates
          sectionType={state.basicInfo.sectionType}
          onSelectTemplate={handleApplyTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {/* 일괄 파일 관리 모달 */}
      {showBulkFileManager && (
        <BulkActivityFileManager
          students={state.students}
          sectionType={state.basicInfo?.sectionType || 'subject'}
          subject={state.basicInfo?.subject}
          onAnalysisComplete={(mappings: BulkFileMapping[]) => {
            mappings.forEach(mapping => {
              const results = mapping.analysisResults || [];
              if (results.length > 0 && mapping.studentId) {
                const student = state.students.find(s => s.id === mapping.studentId);
                const firstResult = results[0];
                if (student && firstResult.writingOptions.length > 0) {
                  const draft = firstResult.writingOptions[0].draft;

                  const activityDetails: ActivityDetails = {
                    activities: [{
                      id: Date.now().toString(),
                      period: '',
                      role: '',
                      content: draft,
                      learnings: '',
                      keywords: firstResult.subjectRelevance[0]?.connectionPoints || [],
                    }],
                    overallEmphasis: firstResult.summary,
                    overallKeywords: firstResult.demonstratedCompetencies.map(c => c.competency).slice(0, 3),
                    maxCharacters: 500 as const,
                  };

                  setStudentActivity({
                    studentId: mapping.studentId,
                    studentName: student.name,
                    activityDetails,
                    emphasisKeywords: activityDetails.overallKeywords,
                  });
                }
              }
            });
            setShowBulkFileManager(false);
          }}
          onClose={() => setShowBulkFileManager(false)}
        />
      )}

      <CommonFooter />
    </div>
  );
};

export default TeacherPage2StudentList;
