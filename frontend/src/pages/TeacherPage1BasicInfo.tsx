import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../contexts/TeacherContext';
import { SectionType } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import FileDropZone from '../components/FileDropZone';
import MultiFileDropZone from '../components/MultiFileDropZone';
import CustomSelect from '../components/ui/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';

const TeacherPage1BasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const { setBasicInfo, setCurrentStep } = useTeacher();
  const { toasts, removeToast, error } = useToast();

  const [grade, setGrade] = useState<1 | 2 | 3>(1);
  const [semester, setSemester] = useState<'1' | '2'>('1');
  const [sectionType, setSectionType] = useState<SectionType>('subject');
  const [subject, setSubject] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'detail' | 'inquiry' | 'foreign'>('detail');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [useMultiFileMode, setUseMultiFileMode] = useState(true);

  const basicSubjects = ['국어', '영어', '수학'];

  const detailSubjects = {
    국어: ['화법과 작문', '독서', '문학', '언어와 매체'],
    영어: ['영어 회화', '영어 독해와 작문', '실용 영어'],
    수학: ['수학Ⅰ', '수학Ⅱ', '미적분', '확률과 통계', '기하'],
  };

  const inquirySubjects = {
    사회: ['통합사회', '한국사', '세계사', '동아시아사', '경제', '정치와 법', '사회·문화', '생활과 윤리', '윤리와 사상', '한국지리', '세계지리'],
    과학: ['통합과학', '과학탐구실험', '물리학Ⅰ', '물리학Ⅱ', '화학Ⅰ', '화학Ⅱ', '생명과학Ⅰ', '생명과학Ⅱ', '지구과학Ⅰ', '지구과학Ⅱ'],
  };

  const foreignLanguages = ['중국어Ⅰ', '중국어Ⅱ', '일본어Ⅰ', '일본어Ⅱ', '프랑스어Ⅰ', '프랑스어Ⅱ', '독일어Ⅰ', '독일어Ⅱ', '스페인어Ⅰ', '스페인어Ⅱ', '러시아어Ⅰ', '러시아어Ⅱ', '아랍어Ⅰ', '아랍어Ⅱ', '베트남어Ⅰ', '베트남어Ⅱ'];

  const openModal = (type: 'detail' | 'inquiry' | 'foreign') => {
    setModalType(type);
    setShowModal(true);
  };

  const selectSubjectFromModal = (subj: string) => {
    setSubject(subj);
    setCustomSubject('');
    setShowModal(false);
  };

  const sectionOptions: { value: SectionType; label: string; description: string }[] = [
    {
      value: 'subject',
      label: '교과세특',
      description: '특정 과목에서의 학습 활동 및 성장',
    },
    {
      value: 'autonomy',
      label: '자율활동',
      description: '학급 활동, 학생회, 봉사 등',
    },
    {
      value: 'club',
      label: '동아리',
      description: '정규 동아리에서의 활동 및 성과',
    },
    {
      value: 'career',
      label: '진로활동',
      description: '진로 탐색 및 진로 관련 체험 활동',
    },
    {
      value: 'behavior',
      label: '행동특성',
      description: '학생의 인성, 협력, 성장 과정 종합',
    },
  ];

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    console.log('Selected file:', file.name);
  };

  const handleMultiFilesSelect = (files: File[]) => {
    setUploadedFiles(files);
    console.log('Selected files:', files.map(f => f.name));
  };

  const handleFileAnalyze = async (file: File): Promise<void> => {
    console.log('Analyzing file:', file.name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Analysis complete for:', file.name);
  };

  const handleNext = () => {
    if (sectionType === 'subject') {
      const finalSubject = subject === 'custom' ? customSubject : subject;
      if (!finalSubject.trim()) {
        error('과목명을 입력해주세요.');
        return;
      }
      setBasicInfo({
        grade,
        semester,
        sectionType,
        subject: finalSubject,
        teacherName: teacherName || undefined,
      });
    } else {
      setBasicInfo({
        grade,
        semester,
        sectionType,
        teacherName: teacherName || undefined,
      });
    }
    setCurrentStep('students');
    navigate('/teacher/students');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <CommonHeader />

      <div className="flex-1 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-sm font-semibold mb-3">
              <span>선생님 모드</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">생활기록부 일괄 작성</h1>
            <p className="text-gray-600 mt-2">같은 과목/활동의 여러 학생 생기부를 한번에 작성하세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 기본 정보 입력 */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-bold text-gray-900">
                    기본 정보 설정
                  </h2>
                </div>

                <div className="p-8 space-y-8">
                  {/* 선생님 이름 + 학년/학기 */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        선생님 성함 <span className="text-gray-400 text-xs">(선택)</span>
                      </label>
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="홍길동"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <CustomSelect
                        label="학년"
                        value={String(grade)}
                        onChange={(val) => setGrade(Number(val) as 1 | 2 | 3)}
                        options={[
                          { value: '1', label: '1학년' },
                          { value: '2', label: '2학년' },
                          { value: '3', label: '3학년' },
                        ]}
                      />
                    </div>
                    <div>
                      <CustomSelect
                        label="학기"
                        value={semester}
                        onChange={(val) => setSemester(val as '1' | '2')}
                        options={[
                          { value: '1', label: '1학기' },
                          { value: '2', label: '2학기' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* 항목 선택 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      작성할 생기부 항목
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {sectionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSectionType(option.value)}
                          className={`px-4 py-3 text-center transition-all border rounded-md ${
                            sectionType === option.value
                              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      {sectionOptions.find(o => o.value === sectionType)?.description}
                    </p>
                  </div>

                  {/* 세특 선택 시 과목명 입력 */}
                  <AnimatePresence>
                    {sectionType === 'subject' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 bg-gray-50 border border-gray-300 rounded-md"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-semibold text-gray-900">
                            과목명 <span className="text-red-600">*</span>
                          </label>
                          {subject && subject !== 'custom' && (
                            <span className="text-sm text-indigo-700 font-semibold bg-indigo-100 px-3 py-1 border border-indigo-200 rounded">
                              {subject}
                            </span>
                          )}
                        </div>

                        {/* 기본 과목 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {basicSubjects.map((subj) => (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => {
                                setSubject(subj);
                                setCustomSubject('');
                              }}
                              className={`px-5 py-2 text-sm font-semibold transition border rounded-md ${
                                subject === subj
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                              }`}
                            >
                              {subj}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => openModal('detail')}
                            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                          >
                            세부과목 +
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal('inquiry')}
                            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                          >
                            탐구 +
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal('foreign')}
                            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                          >
                            외국어 +
                          </button>
                        </div>

                        {/* 직접 입력 */}
                        <input
                          type="text"
                          value={subject === 'custom' ? customSubject : ''}
                          onChange={(e) => {
                            setSubject('custom');
                            setCustomSubject(e.target.value);
                          }}
                          placeholder="또는 과목명 직접 입력"
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 우측: 파일 업로드 */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">
                    파일 업로드
                  </h2>
                  <div className="flex items-center gap-0.5 bg-white p-0.5 border border-gray-300 rounded-md text-xs">
                    <button
                      onClick={() => setUseMultiFileMode(false)}
                      className={`px-3 py-1 font-semibold transition rounded ${
                        !useMultiFileMode ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      단일
                    </button>
                    <button
                      onClick={() => setUseMultiFileMode(true)}
                      className={`px-3 py-1 font-semibold transition rounded ${
                        useMultiFileMode ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      여러 파일
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-4">
                    기존 생기부 PDF를 업로드하면 AI가 분석하여 개선 사항을 제안합니다
                  </p>

                  {useMultiFileMode ? (
                    <MultiFileDropZone
                      onFilesSelect={handleMultiFilesSelect}
                      onFileAnalyze={handleFileAnalyze}
                      acceptedFileTypes={['.pdf']}
                      maxFileSize={10}
                      maxFiles={10}
                    />
                  ) : (
                    <FileDropZone
                      onFileSelect={handleFileSelect}
                      acceptedFileTypes={['.pdf']}
                      maxFileSize={10}
                    />
                  )}

                  {(uploadedFile || uploadedFiles.length > 0) && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-md text-xs text-green-800 font-medium">
                      {uploadedFiles.length > 0 ? `${uploadedFiles.length}개 파일` : '파일'} 업로드 완료
                    </div>
                  )}
                </div>
              </div>

              {/* 요약 카드 */}
              <div className="mt-6 bg-gray-50 border border-gray-300 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">설정 요약</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">학년/학기</span>
                    <span className="font-semibold text-gray-900">{grade}학년 {semester}학기</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">작성 항목</span>
                    <span className="font-semibold text-gray-900">
                      {sectionOptions.find(o => o.value === sectionType)?.label}
                    </span>
                  </div>
                  {sectionType === 'subject' && subject && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">과목명</span>
                      <span className="font-semibold text-indigo-700">
                        {subject === 'custom' ? customSubject : subject}
                      </span>
                    </div>
                  )}
                  {teacherName && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 font-medium">선생님</span>
                      <span className="font-semibold text-gray-900">{teacherName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              className="px-10 py-3.5 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition shadow-sm"
            >
              다음: 학생 추가 →
            </button>
          </div>

          {/* 진행 표시 */}
          <div className="mt-6 flex justify-center items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* 과목 선택 모달 */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-gray-300 rounded-lg"
            >
              <div className="sticky top-0 bg-gray-50 border-b border-gray-300 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'detail' && '국/영/수 세부 과목'}
                  {modalType === 'inquiry' && '탐구 과목'}
                  {modalType === 'foreign' && '제2외국어'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {modalType === 'detail' && (
                  <div className="space-y-6">
                    {Object.entries(detailSubjects).map(([category, subjects]) => (
                      <div key={category}>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                          <span className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-bold">
                            {category[0]}
                          </span>
                          {category} 영역
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {subjects.map((subj) => (
                            <button
                              key={subj}
                              onClick={() => selectSubjectFromModal(subj)}
                              className="px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition text-sm font-medium"
                            >
                              {subj}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {modalType === 'inquiry' && (
                  <div className="space-y-6">
                    {Object.entries(inquirySubjects).map(([category, subjects]) => (
                      <div key={category}>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                          <span className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-bold">
                            {category[0]}
                          </span>
                          {category} 탐구
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {subjects.map((subj) => (
                            <button
                              key={subj}
                              onClick={() => selectSubjectFromModal(subj)}
                              className="px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition text-sm font-medium"
                            >
                              {subj}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {modalType === 'foreign' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                      <span className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-bold">
                        외
                      </span>
                      제2외국어
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {foreignLanguages.map((subj) => (
                        <button
                          key={subj}
                          onClick={() => selectSubjectFromModal(subj)}
                          className="px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition text-sm font-medium"
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommonFooter />
    </div>
  );
};

export default TeacherPage1BasicInfo;
