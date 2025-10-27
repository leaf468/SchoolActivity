import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import {
  SubjectActivity,
  AutonomyActivity,
  ClubActivity,
  CareerActivity,
  BehaviorActivity,
} from '../types/schoolActivity';
import { schoolRecordService } from '../services/schoolRecordService';

const Page2ActivityInput: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActivityDetails, setEmphasisKeywords, addKeyword, removeKeyword, setCurrentStep } =
    useSchoolActivity();

  const { basicInfo, emphasisKeywords } = state;
  const [keywordInput, setKeywordInput] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // 세특 (Subject) 입력 필드
  const [subjectForm, setSubjectForm] = useState<SubjectActivity>({
    subject: basicInfo?.subject || '',
    background: '',
    process: '',
    result: '',
    growth: '',
  });

  // 자율활동 입력 필드
  const [autonomyForm, setAutonomyForm] = useState<AutonomyActivity>({
    activityName: '',
    role: '',
    content: '',
    impact: '',
  });

  // 동아리활동 입력 필드
  const [clubForm, setClubForm] = useState<ClubActivity>({
    clubName: '',
    role: '',
    activities: '',
    achievements: '',
  });

  // 진로활동 입력 필드
  const [careerForm, setCareerForm] = useState<CareerActivity>({
    activityType: '',
    content: '',
    insights: '',
  });

  // 행동특성 입력 필드
  const [behaviorForm, setBehaviorForm] = useState<BehaviorActivity>({
    strengths: '',
    collaboration: '',
    growth: '',
    character: '',
  });

  useEffect(() => {
    if (!basicInfo) {
      navigate('/page1');
    }
  }, [basicInfo, navigate]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !emphasisKeywords.includes(keywordInput.trim())) {
      addKeyword(keywordInput.trim());
      setKeywordInput('');
    }
  };

  const handleNext = () => {
    let activityData;

    switch (basicInfo?.sectionType) {
      case 'subject':
        activityData = subjectForm;
        break;
      case 'autonomy':
        activityData = autonomyForm;
        break;
      case 'club':
        activityData = clubForm;
        break;
      case 'career':
        activityData = careerForm;
        break;
      case 'behavior':
        activityData = behaviorForm;
        break;
      default:
        alert('항목 선택 오류');
        return;
    }

    // 입력 명확성 검증
    const validation = schoolRecordService.analyzeInputForClarity(activityData);
    if (!validation.isValid) {
      setWarnings(validation.warnings);
      return;
    }

    setActivityDetails(activityData);
    setCurrentStep('draft');
    navigate('/page3');
  };

  const handlePrev = () => {
    navigate('/page1');
  };

  if (!basicInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">활동 내용 입력</h1>
          <p className="text-gray-600">
            AI가 생기부를 작성할 수 있도록 활동 경험을 구체적으로 입력하세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 세특 입력 폼 */}
          {basicInfo.sectionType === 'subject' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                과목: {basicInfo.subject}
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 배경/동기
                </label>
                <textarea
                  value={subjectForm.background}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, background: e.target.value })
                  }
                  placeholder="이 활동을 시작하게 된 계기나 동기를 작성하세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 과정 (구체적 행동)
                </label>
                <textarea
                  value={subjectForm.process}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, process: e.target.value })
                  }
                  placeholder="어떤 활동을 했는지, 어떻게 수행했는지 구체적으로 작성하세요."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  결과/성과
                </label>
                <textarea
                  value={subjectForm.result}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, result: e.target.value })
                  }
                  placeholder="활동을 통해 얻은 결과나 성과를 작성하세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  성장/배움
                </label>
                <textarea
                  value={subjectForm.growth}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, growth: e.target.value })
                  }
                  placeholder="이 활동을 통해 얻은 배움이나 성장을 작성하세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 자율활동 입력 폼 */}
          {basicInfo.sectionType === 'autonomy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">자율활동</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동명
                </label>
                <input
                  type="text"
                  value={autonomyForm.activityName}
                  onChange={(e) =>
                    setAutonomyForm({ ...autonomyForm, activityName: e.target.value })
                  }
                  placeholder="예: 학급 환경미화 프로젝트"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">역할</label>
                <input
                  type="text"
                  value={autonomyForm.role}
                  onChange={(e) =>
                    setAutonomyForm({ ...autonomyForm, role: e.target.value })
                  }
                  placeholder="예: 환경부장, 기획팀원"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 내용
                </label>
                <textarea
                  value={autonomyForm.content}
                  onChange={(e) =>
                    setAutonomyForm({ ...autonomyForm, content: e.target.value })
                  }
                  placeholder="구체적으로 무엇을 했는지 작성하세요."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  영향/성과
                </label>
                <textarea
                  value={autonomyForm.impact}
                  onChange={(e) =>
                    setAutonomyForm({ ...autonomyForm, impact: e.target.value })
                  }
                  placeholder="이 활동이 학급이나 학교에 미친 영향, 개인의 성장 등"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 동아리활동 입력 폼 */}
          {basicInfo.sectionType === 'club' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">동아리활동</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  동아리명
                </label>
                <input
                  type="text"
                  value={clubForm.clubName}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, clubName: e.target.value })
                  }
                  placeholder="예: 과학탐구동아리 '사이언스랩'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">역할</label>
                <input
                  type="text"
                  value={clubForm.role}
                  onChange={(e) => setClubForm({ ...clubForm, role: e.target.value })}
                  placeholder="예: 동아리 부장, 실험팀장"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 내용
                </label>
                <textarea
                  value={clubForm.activities}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, activities: e.target.value })
                  }
                  placeholder="동아리에서 수행한 활동을 구체적으로 작성하세요."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">성과</label>
                <textarea
                  value={clubForm.achievements}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, achievements: e.target.value })
                  }
                  placeholder="동아리 활동을 통해 얻은 성과나 배움"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 진로활동 입력 폼 */}
          {basicInfo.sectionType === 'career' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">진로활동</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 유형
                </label>
                <input
                  type="text"
                  value={careerForm.activityType}
                  onChange={(e) =>
                    setCareerForm({ ...careerForm, activityType: e.target.value })
                  }
                  placeholder="예: 진로 특강, 직업 체험, 대학 연구실 방문"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 내용
                </label>
                <textarea
                  value={careerForm.content}
                  onChange={(e) =>
                    setCareerForm({ ...careerForm, content: e.target.value })
                  }
                  placeholder="진로 활동에서 무엇을 했는지 구체적으로 작성하세요."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  깨달음/진로 영향
                </label>
                <textarea
                  value={careerForm.insights}
                  onChange={(e) =>
                    setCareerForm({ ...careerForm, insights: e.target.value })
                  }
                  placeholder="이 활동이 진로 선택에 어떤 영향을 미쳤는지 작성하세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 행동특성 입력 폼 */}
          {basicInfo.sectionType === 'behavior' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">행동특성 및 종합의견</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">강점</label>
                <textarea
                  value={behaviorForm.strengths}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, strengths: e.target.value })
                  }
                  placeholder="학생의 주요 강점을 작성하세요."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  협업/관계
                </label>
                <textarea
                  value={behaviorForm.collaboration}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, collaboration: e.target.value })
                  }
                  placeholder="친구들과의 협력, 관계 형성 능력 등"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  성장 과정
                </label>
                <textarea
                  value={behaviorForm.growth}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, growth: e.target.value })
                  }
                  placeholder="한 학기 동안의 성장 과정"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  인성/태도
                </label>
                <textarea
                  value={behaviorForm.character}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, character: e.target.value })
                  }
                  placeholder="학생의 인성, 태도, 가치관 등"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 강조 키워드 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              강조 키워드 (선택사항)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              생기부에 꼭 포함하고 싶은 역량 키워드를 추가하세요 (예: 비판적 사고력, 협업 능력)
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="키워드 입력 후 Enter 또는 추가 버튼"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {emphasisKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 경고 메시지 */}
          {warnings.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">입력 내용 개선 제안</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                계속 진행하거나 내용을 수정할 수 있습니다.
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
            >
              초안 생성 →
            </button>
          </div>
        </div>

        {/* 진행 표시 */}
        <div className="mt-8 flex justify-center items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default Page2ActivityInput;
