import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { SectionType } from '../types/schoolActivity';

const Page1BasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const { setBasicInfo, setCurrentStep } = useSchoolActivity();

  const [grade, setGrade] = useState<string>('1');
  const [semester, setSemester] = useState<string>('1');
  const [sectionType, setSectionType] = useState<SectionType>('subject');
  const [subject, setSubject] = useState<string>('');

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
    if (sectionType === 'subject' && !subject.trim()) {
      alert('과목명을 입력해주세요.');
      return;
    }

    setBasicInfo({
      grade,
      semester,
      sectionType,
      subject: sectionType === 'subject' ? subject : undefined,
    });
    setCurrentStep('input');
    navigate('/page2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                과목명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: 수학, 영어, 물리학 등"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-600 mt-2">
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
  );
};

export default Page1BasicInfo;
