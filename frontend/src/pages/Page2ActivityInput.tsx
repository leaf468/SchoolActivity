import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import Header from '../components/Header';
import {
  SubjectActivity,
  AutonomyActivity,
  ClubActivity,
  CareerActivity,
  BehaviorActivity,
  SingleActivity,
} from '../types/schoolActivity';

const Page2ActivityInput: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActivityDetails, setCurrentStep, clearDraft } = useSchoolActivity();

  const { basicInfo } = state;

  // 키워드 선택지 (섹션별)
  const keywordSuggestions = {
    subject: [
      '심층 탐구', '창의적 사고', '비판적 분석', '문제 해결', '자기주도 학습',
      '협력 학습', '실험 설계', '데이터 분석', '논리적 추론', '개념 확장',
      '융합적 사고', '탐구 역량', '학술적 관심', '지식 응용', '독창적 접근'
    ],
    autonomy: [
      '리더십', '협력', '책임감', '공동체 의식', '자율성',
      '기획력', '실행력', '소통 능력', '갈등 조정', '팀워크',
      '주도성', '문제 인식', '창의적 해결', '공감 능력', '봉사정신'
    ],
    club: [
      '전문성', '열정', '지속성', '협업', '역할 수행',
      '창작 활동', '기술 습득', '프로젝트 관리', '멘토링', '지식 공유',
      '도전정신', '예술적 감각', '기술적 숙련', '발표력', '조직 운영'
    ],
    career: [
      '진로 탐색', '직업 이해', '전공 적합성', '미래 설계', '목표 설정',
      '현장 체험', '전문가 멘토링', '실무 경험', '진로 역량', '학문적 흥미',
      '직업 윤리', '산업 이해', '진로 확신', '자기 성찰', '장기 계획'
    ],
    behavior: [
      '성실성', '배려', '존중', '긍정적 태도', '인성',
      '정직', '책임감', '친화력', '공감', '예의',
      '성장 마인드', '끈기', '겸손', '나눔', '포용력'
    ]
  };

  // 세특 (Subject) 입력 필드
  const [subjectForm, setSubjectForm] = useState<SubjectActivity>({
    subject: basicInfo?.subject || '',
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  // 자율활동 입력 필드
  const [autonomyForm, setAutonomyForm] = useState<AutonomyActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  // 동아리활동 입력 필드
  const [clubForm, setClubForm] = useState<ClubActivity>({
    clubName: '',
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  // 진로활동 입력 필드
  const [careerForm, setCareerForm] = useState<CareerActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 700,
  });

  // 행동특성 입력 필드
  const [behaviorForm, setBehaviorForm] = useState<BehaviorActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  // 활동별 키워드 입력 상태
  const [activityKeywordInputs, setActivityKeywordInputs] = useState<Record<string, string>>({});

  // 전체 키워드 입력 상태
  const [overallKeywordInput, setOverallKeywordInput] = useState('');

  useEffect(() => {
    if (!basicInfo) {
      navigate('/page1');
    }
  }, [basicInfo, navigate]);

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

    // 입력 검증
    const hasContent = activityData.activities.some((activity: SingleActivity) =>
      activity.content && activity.content.trim().length > 0
    );

    if (!hasContent) {
      alert('최소 1개 활동의 내용을 입력해주세요.');
      return;
    }

    console.log('[Page2] 다음 버튼 클릭 - 전송할 데이터:', {
      sectionType: basicInfo?.sectionType,
      activityData,
      emphasisKeywords: state.emphasisKeywords
    });

    // 기존 draft 초기화 (새로운 활동 내용으로 재생성하기 위해)
    clearDraft();
    setActivityDetails(activityData);
    setCurrentStep('draft');
    navigate('/page3');
  };

  const handlePrev = () => {
    navigate('/page1');
  };

  // 활동 추가
  const addActivity = (formType: string) => {
    const newActivity: SingleActivity = {
      id: Date.now().toString(),
      period: '',
      role: '',
      content: '',
      learnings: '',
      keywords: [],
    };

    switch (formType) {
      case 'subject':
        setSubjectForm({
          ...subjectForm,
          activities: [...subjectForm.activities, newActivity],
        });
        break;
      case 'autonomy':
        setAutonomyForm({
          ...autonomyForm,
          activities: [...autonomyForm.activities, newActivity],
        });
        break;
      case 'club':
        setClubForm({
          ...clubForm,
          activities: [...clubForm.activities, newActivity],
        });
        break;
      case 'career':
        setCareerForm({
          ...careerForm,
          activities: [...careerForm.activities, newActivity],
        });
        break;
      case 'behavior':
        setBehaviorForm({
          ...behaviorForm,
          activities: [...behaviorForm.activities, newActivity],
        });
        break;
    }
  };

  // 활동 삭제
  const removeActivity = (formType: string, activityId: string) => {
    switch (formType) {
      case 'subject':
        if (subjectForm.activities.length > 1) {
          setSubjectForm({
            ...subjectForm,
            activities: subjectForm.activities.filter((a) => a.id !== activityId),
          });
        }
        break;
      case 'autonomy':
        if (autonomyForm.activities.length > 1) {
          setAutonomyForm({
            ...autonomyForm,
            activities: autonomyForm.activities.filter((a) => a.id !== activityId),
          });
        }
        break;
      case 'club':
        if (clubForm.activities.length > 1) {
          setClubForm({
            ...clubForm,
            activities: clubForm.activities.filter((a) => a.id !== activityId),
          });
        }
        break;
      case 'career':
        if (careerForm.activities.length > 1) {
          setCareerForm({
            ...careerForm,
            activities: careerForm.activities.filter((a) => a.id !== activityId),
          });
        }
        break;
      case 'behavior':
        if (behaviorForm.activities.length > 1) {
          setBehaviorForm({
            ...behaviorForm,
            activities: behaviorForm.activities.filter((a) => a.id !== activityId),
          });
        }
        break;
    }
  };

  // 활동 필드 업데이트
  const updateActivityField = (
    formType: string,
    activityId: string,
    field: keyof SingleActivity,
    value: string | string[]
  ) => {
    const updateFn = (activities: SingleActivity[]) =>
      activities.map((a) => (a.id === activityId ? { ...a, [field]: value } : a));

    switch (formType) {
      case 'subject':
        setSubjectForm({
          ...subjectForm,
          activities: updateFn(subjectForm.activities),
        });
        break;
      case 'autonomy':
        setAutonomyForm({
          ...autonomyForm,
          activities: updateFn(autonomyForm.activities),
        });
        break;
      case 'club':
        setClubForm({
          ...clubForm,
          activities: updateFn(clubForm.activities),
        });
        break;
      case 'career':
        setCareerForm({
          ...careerForm,
          activities: updateFn(careerForm.activities),
        });
        break;
      case 'behavior':
        setBehaviorForm({
          ...behaviorForm,
          activities: updateFn(behaviorForm.activities),
        });
        break;
    }
  };

  // 활동별 키워드 추가/제거 (토글)
  const addActivityKeyword = (formType: string, activityId: string, keyword: string) => {
    if (!keyword.trim()) return;

    const updateFn = (activities: SingleActivity[]) =>
      activities.map((a) => {
        if (a.id === activityId) {
          const currentKeywords = a.keywords || [];
          // 이미 선택된 키워드면 제거, 아니면 추가
          const isSelected = currentKeywords.includes(keyword.trim());
          return {
            ...a,
            keywords: isSelected
              ? currentKeywords.filter(k => k !== keyword.trim())
              : [...currentKeywords, keyword.trim()]
          };
        }
        return a;
      });

    switch (formType) {
      case 'subject':
        setSubjectForm({ ...subjectForm, activities: updateFn(subjectForm.activities) });
        break;
      case 'autonomy':
        setAutonomyForm({ ...autonomyForm, activities: updateFn(autonomyForm.activities) });
        break;
      case 'club':
        setClubForm({ ...clubForm, activities: updateFn(clubForm.activities) });
        break;
      case 'career':
        setCareerForm({ ...careerForm, activities: updateFn(careerForm.activities) });
        break;
      case 'behavior':
        setBehaviorForm({ ...behaviorForm, activities: updateFn(behaviorForm.activities) });
        break;
    }
  };

  // 활동별 키워드 제거
  const removeActivityKeyword = (formType: string, activityId: string, keyword: string) => {
    const updateFn = (activities: SingleActivity[]) =>
      activities.map((a) =>
        a.id === activityId
          ? { ...a, keywords: (a.keywords || []).filter((k) => k !== keyword) }
          : a
      );

    switch (formType) {
      case 'subject':
        setSubjectForm({ ...subjectForm, activities: updateFn(subjectForm.activities) });
        break;
      case 'autonomy':
        setAutonomyForm({ ...autonomyForm, activities: updateFn(autonomyForm.activities) });
        break;
      case 'club':
        setClubForm({ ...clubForm, activities: updateFn(clubForm.activities) });
        break;
      case 'career':
        setCareerForm({ ...careerForm, activities: updateFn(careerForm.activities) });
        break;
      case 'behavior':
        setBehaviorForm({ ...behaviorForm, activities: updateFn(behaviorForm.activities) });
        break;
    }
  };

  // 전체 키워드 추가/제거 (토글)
  const addOverallKeyword = (formType: string, keyword: string) => {
    if (!keyword.trim()) return;

    switch (formType) {
      case 'subject': {
        const currentKeywords = subjectForm.overallKeywords || [];
        const isSelected = currentKeywords.includes(keyword.trim());
        setSubjectForm({
          ...subjectForm,
          overallKeywords: isSelected
            ? currentKeywords.filter(k => k !== keyword.trim())
            : [...currentKeywords, keyword.trim()],
        });
        break;
      }
      case 'autonomy': {
        const currentKeywords = autonomyForm.overallKeywords || [];
        const isSelected = currentKeywords.includes(keyword.trim());
        setAutonomyForm({
          ...autonomyForm,
          overallKeywords: isSelected
            ? currentKeywords.filter(k => k !== keyword.trim())
            : [...currentKeywords, keyword.trim()],
        });
        break;
      }
      case 'club': {
        const currentKeywords = clubForm.overallKeywords || [];
        const isSelected = currentKeywords.includes(keyword.trim());
        setClubForm({
          ...clubForm,
          overallKeywords: isSelected
            ? currentKeywords.filter(k => k !== keyword.trim())
            : [...currentKeywords, keyword.trim()],
        });
        break;
      }
      case 'career': {
        const currentKeywords = careerForm.overallKeywords || [];
        const isSelected = currentKeywords.includes(keyword.trim());
        setCareerForm({
          ...careerForm,
          overallKeywords: isSelected
            ? currentKeywords.filter(k => k !== keyword.trim())
            : [...currentKeywords, keyword.trim()],
        });
        break;
      }
      case 'behavior': {
        const currentKeywords = behaviorForm.overallKeywords || [];
        const isSelected = currentKeywords.includes(keyword.trim());
        setBehaviorForm({
          ...behaviorForm,
          overallKeywords: isSelected
            ? currentKeywords.filter(k => k !== keyword.trim())
            : [...currentKeywords, keyword.trim()],
        });
        break;
      }
    }
  };

  // 전체 키워드 제거
  const removeOverallKeyword = (formType: string, keyword: string) => {
    switch (formType) {
      case 'subject':
        setSubjectForm({
          ...subjectForm,
          overallKeywords: (subjectForm.overallKeywords || []).filter((k) => k !== keyword),
        });
        break;
      case 'autonomy':
        setAutonomyForm({
          ...autonomyForm,
          overallKeywords: (autonomyForm.overallKeywords || []).filter((k) => k !== keyword),
        });
        break;
      case 'club':
        setClubForm({
          ...clubForm,
          overallKeywords: (clubForm.overallKeywords || []).filter((k) => k !== keyword),
        });
        break;
      case 'career':
        setCareerForm({
          ...careerForm,
          overallKeywords: (careerForm.overallKeywords || []).filter((k) => k !== keyword),
        });
        break;
      case 'behavior':
        setBehaviorForm({
          ...behaviorForm,
          overallKeywords: (behaviorForm.overallKeywords || []).filter((k) => k !== keyword),
        });
        break;
    }
  };

  // 활동 입력 UI 렌더링
  const renderActivityInputs = (
    formType: string,
    activities: SingleActivity[],
    maxChars: number
  ) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              📌 한 학기 동안의 활동 2-3개를 모두 입력해주세요
            </p>
            <p className="text-xs text-gray-600 mt-1">
              각 활동마다 기간, 역할, 내용, 깨달은 바, 강조 키워드를 입력하세요
            </p>
          </div>
          <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full">
            최종 {maxChars}자로 통합
          </span>
        </div>

        {activities.map((activity, index) => (
          <div key={activity.id} className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">활동 {index + 1}</h3>
              {activities.length > 1 && (
                <button
                  onClick={() => removeActivity(formType, activity.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  삭제 ×
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* 활동 기간 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 기간 <span className="text-gray-400">(선택)</span>
                </label>
                <input
                  type="text"
                  value={activity.period || ''}
                  onChange={(e) =>
                    updateActivityField(formType, activity.id, 'period', e.target.value)
                  }
                  placeholder="예: 2024.03~2024.06, 1학기, 3개월간"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* 맡은 역할 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  맡은 역할 <span className="text-gray-400">(선택)</span>
                </label>
                <input
                  type="text"
                  value={activity.role || ''}
                  onChange={(e) =>
                    updateActivityField(formType, activity.id, 'role', e.target.value)
                  }
                  placeholder="예: 팀장, 발표자, 기획자, 멘토"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* 활동 내용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  활동 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={activity.content}
                  onChange={(e) =>
                    updateActivityField(formType, activity.id, 'content', e.target.value)
                  }
                  placeholder="구체적으로 무엇을 했는지 작성하세요 (배경, 동기, 과정, 결과 등)"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">{activity.content.length}자</p>
              </div>

              {/* 깨달은 바 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  깨달은 바 / 배운 점 <span className="text-gray-400">(선택)</span>
                </label>
                <textarea
                  value={activity.learnings || ''}
                  onChange={(e) =>
                    updateActivityField(formType, activity.id, 'learnings', e.target.value)
                  }
                  placeholder="이 활동을 통해 배우거나 깨달은 점을 작성하세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* 활동별 강조 키워드 */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이 활동에서 강조하고 싶은 키워드
                </label>

                {/* 추천 키워드 */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">💡 추천 키워드 (클릭하여 선택/해제):</p>
                  <div className="flex flex-wrap gap-2">
                    {keywordSuggestions[basicInfo?.sectionType as keyof typeof keywordSuggestions]?.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addActivityKeyword(formType, activity.id, suggestion)}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          activity.keywords?.includes(suggestion)
                            ? 'bg-yellow-500 text-white border-yellow-600'
                            : 'bg-white text-gray-700 border-yellow-300 hover:bg-yellow-100 cursor-pointer'
                        }`}
                      >
                        {activity.keywords?.includes(suggestion) ? '✓ ' : ''}{suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 직접 입력 */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={activityKeywordInputs[activity.id] || ''}
                    onChange={(e) =>
                      setActivityKeywordInputs({
                        ...activityKeywordInputs,
                        [activity.id]: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addActivityKeyword(
                          formType,
                          activity.id,
                          activityKeywordInputs[activity.id] || ''
                        );
                        setActivityKeywordInputs({ ...activityKeywordInputs, [activity.id]: '' });
                      }
                    }}
                    placeholder="직접 입력 (Enter로 추가)"
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addActivityKeyword(
                        formType,
                        activity.id,
                        activityKeywordInputs[activity.id] || ''
                      );
                      setActivityKeywordInputs({ ...activityKeywordInputs, [activity.id]: '' });
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                  >
                    추가
                  </button>
                </div>

                {/* 선택된 키워드 */}
                {activity.keywords && activity.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">✅ 선택된 키워드:</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm flex items-center gap-2"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeActivityKeyword(formType, activity.id, keyword)}
                            className="text-white hover:text-yellow-200 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => addActivity(formType)}
          className="w-full py-4 border-2 border-dashed border-green-300 text-green-700 rounded-xl hover:bg-green-50 font-semibold text-lg transition-colors"
        >
          + 활동 추가하기
        </button>
      </div>
    );
  };

  // 전체 강조사항 UI
  const renderOverallEmphasis = (
    formType: string,
    emphasis: string | undefined,
    keywords: string[] | undefined
  ) => {
    return (
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🎯 전체적으로 강조하고 싶은 점
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              전체 강조 내용 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              value={emphasis || ''}
              onChange={(e) => {
                const value = e.target.value;
                switch (formType) {
                  case 'subject':
                    setSubjectForm({ ...subjectForm, overallEmphasis: value });
                    break;
                  case 'autonomy':
                    setAutonomyForm({ ...autonomyForm, overallEmphasis: value });
                    break;
                  case 'club':
                    setClubForm({ ...clubForm, overallEmphasis: value });
                    break;
                  case 'career':
                    setCareerForm({ ...careerForm, overallEmphasis: value });
                    break;
                  case 'behavior':
                    setBehaviorForm({ ...behaviorForm, overallEmphasis: value });
                    break;
                }
              }}
              placeholder="위 활동들을 통해 전체적으로 어떤 점을 강조하고 싶은지 작성하세요"
              rows={3}
              className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              전체 강조 키워드
            </label>

            {/* 추천 키워드 */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">💡 추천 키워드 (클릭하여 선택/해제):</p>
              <div className="flex flex-wrap gap-2">
                {keywordSuggestions[basicInfo?.sectionType as keyof typeof keywordSuggestions]?.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addOverallKeyword(formType, suggestion)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      keywords?.includes(suggestion)
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-gray-700 border-indigo-300 hover:bg-indigo-100 cursor-pointer'
                    }`}
                  >
                    {keywords?.includes(suggestion) ? '✓ ' : ''}{suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 입력 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={overallKeywordInput}
                onChange={(e) => setOverallKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addOverallKeyword(formType, overallKeywordInput);
                    setOverallKeywordInput('');
                  }
                }}
                placeholder="직접 입력 (Enter로 추가)"
                className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  addOverallKeyword(formType, overallKeywordInput);
                  setOverallKeywordInput('');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                추가
              </button>
            </div>

            {/* 선택된 키워드 */}
            {keywords && keywords.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">✅ 선택된 키워드:</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeOverallKeyword(formType, keyword)}
                        className="text-white hover:text-indigo-200 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!basicInfo) return null;

  const getCurrentForm = () => {
    switch (basicInfo.sectionType) {
      case 'subject':
        return { formType: 'subject', activities: subjectForm.activities, maxChars: 500, emphasis: subjectForm.overallEmphasis, keywords: subjectForm.overallKeywords };
      case 'autonomy':
        return { formType: 'autonomy', activities: autonomyForm.activities, maxChars: 500, emphasis: autonomyForm.overallEmphasis, keywords: autonomyForm.overallKeywords };
      case 'club':
        return { formType: 'club', activities: clubForm.activities, maxChars: 500, emphasis: clubForm.overallEmphasis, keywords: clubForm.overallKeywords };
      case 'career':
        return { formType: 'career', activities: careerForm.activities, maxChars: 700, emphasis: careerForm.overallEmphasis, keywords: careerForm.overallKeywords };
      case 'behavior':
        return { formType: 'behavior', activities: behaviorForm.activities, maxChars: 500, emphasis: behaviorForm.overallEmphasis, keywords: behaviorForm.overallKeywords };
      default:
        return null;
    }
  };

  const currentForm = getCurrentForm();
  if (!currentForm) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">활동 내용 입력</h1>
            <p className="text-gray-600">
              한 학기 동안의 여러 활동을 세부적으로 입력하면 AI가 통합하여 생기부를 작성합니다
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 섹션 타이틀 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {basicInfo.sectionType === 'subject' && `교과 세특 - ${basicInfo.subject}`}
                {basicInfo.sectionType === 'autonomy' && '자율활동'}
                {basicInfo.sectionType === 'club' && '동아리활동'}
                {basicInfo.sectionType === 'career' && '진로활동'}
                {basicInfo.sectionType === 'behavior' && '행동특성 및 종합의견'}
              </h2>
            </div>

            {/* 동아리명 (동아리활동인 경우) */}
            {basicInfo.sectionType === 'club' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  동아리명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clubForm.clubName}
                  onChange={(e) => setClubForm({ ...clubForm, clubName: e.target.value })}
                  placeholder="예: 과학탐구동아리 '사이언스랩'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 활동 입력 섹션 */}
            {renderActivityInputs(currentForm.formType, currentForm.activities, currentForm.maxChars)}

            {/* 전체 강조사항 */}
            {renderOverallEmphasis(currentForm.formType, currentForm.emphasis, currentForm.keywords)}

            {/* 하단 네비게이션 */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                ← 이전 단계
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-teal-700 shadow-lg transition-all"
              >
                초안 생성 →
              </button>
            </div>
          </div>

          {/* 진행 표시 */}
          <div className="mt-8 flex justify-center items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page2ActivityInput;
