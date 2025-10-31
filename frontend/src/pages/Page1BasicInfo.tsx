import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { SectionType } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const Page1BasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const { setBasicInfo, setCurrentStep } = useSchoolActivity();

  const [grade, setGrade] = useState<string>('1');
  const [semester, setSemester] = useState<string>('1');
  const [sectionType, setSectionType] = useState<SectionType>('subject');
  const [subject, setSubject] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'detail' | 'inquiry' | 'foreign'>('detail');

  // 기본 과목 (국영수만)
  const basicSubjects = ['국어', '영어', '수학'];

  // 세부 과목 (영역별)
  const detailSubjects = {
    국어: ['화법과 작문', '독서', '문학', '언어와 매체'],
    영어: ['영어 회화', '영어 독해와 작문', '실용 영어'],
    수학: ['수학Ⅰ', '수학Ⅱ', '미적분', '확률과 통계', '기하'],
  };

  // 탐구 과목
  const inquirySubjects = {
    사회: ['통합사회', '한국사', '세계사', '동아시아사', '경제', '정치와 법', '사회·문화', '생활과 윤리', '윤리와 사상', '한국지리', '세계지리'],
    과학: ['통합과학', '과학탐구실험', '물리학Ⅰ', '물리학Ⅱ', '화학Ⅰ', '화학Ⅱ', '생명과학Ⅰ', '생명과학Ⅱ', '지구과학Ⅰ', '지구과학Ⅱ'],
  };

  // 제2외국어
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
      label: '과목 세부능력 및 특기사항 (세특)',
      description: '특정 과목에서의 학습 활동 및 성장',
    },
    {
      value: 'autonomy',
      label: '자율활동',
      description: '학급 활동, 학생회, 봉사 등',
    },
    {
      value: 'club',
      label: '동아리활동',
      description: '정규 동아리에서의 활동 및 성과',
    },
    {
      value: 'career',
      label: '진로활동',
      description: '진로 탐색 및 진로 관련 체험 활동',
    },
    {
      value: 'behavior',
      label: '행동특성 및 종합의견',
      description: '학생의 인성, 협력, 성장 과정 종합',
    },
  ];

  const handleNext = () => {
    if (sectionType === 'subject') {
      const finalSubject = subject === 'custom' ? customSubject : subject;
      if (!finalSubject.trim()) {
        alert('과목명을 입력해주세요.');
        return;
      }
      setBasicInfo({
        grade,
        semester,
        sectionType,
        subject: finalSubject,
      });
    } else {
      setBasicInfo({
        grade,
        semester,
        sectionType,
        subject: undefined,
      });
    }
    setCurrentStep('input');
    navigate('/page2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <CommonHeader />

      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">생활기록부 AI 작성</h1>
            <p className="text-gray-600">학년, 학기 및 작성할 항목을 선택하세요</p>
          </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 학년/학기 선택 */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              학년 / 학기
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">학년</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">학기</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="1">1학기</option>
                  <option value="2">2학기</option>
                </select>
              </div>
            </div>
          </div>

          {/* 항목 선택 */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              작성할 생기부 항목
            </label>
            <div className="space-y-3">
              {sectionOptions.map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                    sectionType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="sectionType"
                      value={option.value}
                      checked={sectionType === option.value}
                      onChange={(e) => setSectionType(e.target.value as SectionType)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 세특 선택 시 과목명 입력 */}
          {sectionType === 'subject' && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                과목명 <span className="text-red-500">*</span>
              </label>

              {/* 기본 과목 (국영수) */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">📚 기본 과목:</p>
                <div className="grid grid-cols-3 gap-3">
                  {basicSubjects.map((subj, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSubject(subj);
                        setCustomSubject('');
                      }}
                      className={`px-4 py-3 text-sm font-semibold rounded-lg border-2 transition-colors ${
                        subject === subj
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* 세부 과목 선택 버튼들 */}
              <div className="mb-4 space-y-2">
                <p className="text-xs text-gray-600 mb-2">🔍 세부 과목 선택:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openModal('detail')}
                    className="px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    국/영/수 세부과목 →
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('inquiry')}
                    className="px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    탐구 과목 →
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('foreign')}
                    className="px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    제2외국어 →
                  </button>
                </div>
              </div>

              {/* 직접 입력 옵션 */}
              <div>
                <label className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="subjectInput"
                    checked={subject === 'custom'}
                    onChange={() => setSubject('custom')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">직접 입력</span>
                </label>
                {subject === 'custom' && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="과목명을 직접 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    autoFocus
                  />
                )}
              </div>

              {subject && subject !== 'custom' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✓ 선택된 과목: <span className="font-bold">{subject}</span>
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-600 mt-3">
                세특은 특정 과목에 대한 활동이므로 과목명이 필요합니다.
              </p>
            </div>
          )}

          {/* 다음 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              다음 단계 →
            </button>
          </div>
        </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* 과목 선택 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalType === 'detail' && '국/영/수 세부 과목'}
                  {modalType === 'inquiry' && '탐구 과목'}
                  {modalType === 'foreign' && '제2외국어'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalType === 'detail' && (
                <div className="space-y-6">
                  {Object.entries(detailSubjects).map(([category, subjects]) => (
                    <div key={category}>
                      <h3 className="text-lg font-bold text-gray-700 mb-3">{category} 영역</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {subjects.map((subj, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectSubjectFromModal(subj)}
                            className="px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left font-medium"
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
                      <h3 className="text-lg font-bold text-gray-700 mb-3">{category} 탐구</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {subjects.map((subj, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectSubjectFromModal(subj)}
                            className="px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center font-medium"
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
                  <h3 className="text-lg font-bold text-gray-700 mb-3">제2외국어</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {foreignLanguages.map((subj, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSubjectFromModal(subj)}
                        className="px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center font-medium"
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <CommonFooter />
    </div>
  );
};

export default Page1BasicInfo;
