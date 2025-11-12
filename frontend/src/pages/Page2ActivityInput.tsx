import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import AIGuidelinesPanel from '../components/AIGuidelinesPanel';
import ActivitySuggestions from '../components/ActivitySuggestions';
import RealTimeQualityChecker from '../components/RealTimeQualityChecker';
import {
  SubjectActivity,
  AutonomyActivity,
  ClubActivity,
  CareerActivity,
  BehaviorActivity,
  SingleActivity,
} from '../types/schoolActivity';
import {
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  LightBulbIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Page2ActivityInputEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActivityDetails, setCurrentStep, clearDraft } = useSchoolActivity();

  const { basicInfo, studentInfo } = state;

  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedActivityForQuality, setSelectedActivityForQuality] = useState<string | null>(null);

  // 학생용 폼 상태들
  const [subjectForm, setSubjectForm] = useState<SubjectActivity>({
    subject: basicInfo?.subject || '',
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  const [autonomyForm, setAutonomyForm] = useState<AutonomyActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  const [clubForm, setClubForm] = useState<ClubActivity>({
    clubName: '',
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  const [careerForm, setCareerForm] = useState<CareerActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 700,
  });

  const [behaviorForm, setBehaviorForm] = useState<BehaviorActivity>({
    activities: [{ id: '1', period: '', role: '', content: '', learnings: '', keywords: [] }],
    overallEmphasis: '',
    overallKeywords: [],
    maxCharacters: 500,
  });

  useEffect(() => {
    if (!basicInfo) {
      navigate('/info');
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

    const hasContent = activityData.activities.some((activity: SingleActivity) =>
      activity.content && activity.content.trim().length > 0
    );

    if (!hasContent) {
      alert('최소 1개 활동의 내용을 입력해주세요.');
      return;
    }

    clearDraft();
    setActivityDetails(activityData);
    setCurrentStep('draft');
    navigate('/draft');
  };

  const handlePrev = () => {
    navigate('/info');
  };

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
        setSubjectForm({ ...subjectForm, activities: [...subjectForm.activities, newActivity] });
        break;
      case 'autonomy':
        setAutonomyForm({ ...autonomyForm, activities: [...autonomyForm.activities, newActivity] });
        break;
      case 'club':
        setClubForm({ ...clubForm, activities: [...clubForm.activities, newActivity] });
        break;
      case 'career':
        setCareerForm({ ...careerForm, activities: [...careerForm.activities, newActivity] });
        break;
      case 'behavior':
        setBehaviorForm({ ...behaviorForm, activities: [...behaviorForm.activities, newActivity] });
        break;
    }
  };

  const removeActivity = (formType: string, activityId: string) => {
    switch (formType) {
      case 'subject':
        if (subjectForm.activities.length > 1) {
          setSubjectForm({ ...subjectForm, activities: subjectForm.activities.filter(a => a.id !== activityId) });
        }
        break;
      case 'autonomy':
        if (autonomyForm.activities.length > 1) {
          setAutonomyForm({ ...autonomyForm, activities: autonomyForm.activities.filter(a => a.id !== activityId) });
        }
        break;
      case 'club':
        if (clubForm.activities.length > 1) {
          setClubForm({ ...clubForm, activities: clubForm.activities.filter(a => a.id !== activityId) });
        }
        break;
      case 'career':
        if (careerForm.activities.length > 1) {
          setCareerForm({ ...careerForm, activities: careerForm.activities.filter(a => a.id !== activityId) });
        }
        break;
      case 'behavior':
        if (behaviorForm.activities.length > 1) {
          setBehaviorForm({ ...behaviorForm, activities: behaviorForm.activities.filter(a => a.id !== activityId) });
        }
        break;
    }
  };

  const updateActivityField = (
    formType: string,
    activityId: string,
    field: keyof SingleActivity,
    value: string | string[]
  ) => {
    const updateFn = (activities: SingleActivity[]) =>
      activities.map(a => (a.id === activityId ? { ...a, [field]: value } : a));

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

  const getCurrentForm = () => {
    switch (basicInfo?.sectionType) {
      case 'subject':
        return { formType: 'subject', activities: subjectForm.activities, maxChars: 500 };
      case 'autonomy':
        return { formType: 'autonomy', activities: autonomyForm.activities, maxChars: 500 };
      case 'club':
        return { formType: 'club', activities: clubForm.activities, maxChars: 500 };
      case 'career':
        return { formType: 'career', activities: careerForm.activities, maxChars: 700 };
      case 'behavior':
        return { formType: 'behavior', activities: behaviorForm.activities, maxChars: 500 };
      default:
        return null;
    }
  };

  const currentForm = getCurrentForm();
  if (!currentForm) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex flex-col">
      <Header />

      <div className="py-12 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full mb-4">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-semibold">AI 기반 생기부 작성</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">활동 내용 입력</h1>
            <p className="text-lg text-gray-600">
              한 학기 동안의 여러 활동을 세부적으로 입력하면 AI가 통합하여 생기부를 작성합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 입력 폼 (2컬럼 차지) */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {basicInfo?.sectionType === 'subject' && `교과 세특 - ${basicInfo.subject}`}
                  {basicInfo?.sectionType === 'autonomy' && '자율활동'}
                  {basicInfo?.sectionType === 'club' && '동아리활동'}
                  {basicInfo?.sectionType === 'career' && '진로활동'}
                  {basicInfo?.sectionType === 'behavior' && '행동특성 및 종합의견'}
                </h2>

                {/* 동아리명 (동아리활동인 경우) */}
                {basicInfo?.sectionType === 'club' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      동아리명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={clubForm.clubName}
                      onChange={(e) => setClubForm({ ...clubForm, clubName: e.target.value })}
                      placeholder="예: 과학탐구동아리 '사이언스랩'"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                )}

                {/* 활동 목록 */}
                <div className="space-y-6">
                  {currentForm.activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          활동 {index + 1}
                        </h3>
                        {currentForm.activities.length > 1 && (
                          <button
                            onClick={() => removeActivity(currentForm.formType, activity.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* 활동 내용 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            활동 내용 <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={activity.content}
                            onChange={(e) => updateActivityField(currentForm.formType, activity.id, 'content', e.target.value)}
                            placeholder="구체적으로 무엇을 했는지 작성하세요 (배경, 동기, 과정, 결과 등)&#10;&#10;예시: 경제 수업 시간에 GDP 개념을 배우며 실제 한국의 경제 성장률에 관심을 가지게 됨. 한국은행 경제통계시스템에서 최근 10년간 GDP 데이터를 수집하여 Excel로 분석함..."
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">{activity.content.length}자</p>
                            <button
                              onClick={() => setSelectedActivityForQuality(
                                selectedActivityForQuality === activity.id ? null : activity.id
                              )}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              {selectedActivityForQuality === activity.id ? '품질 체크 숨기기' : '품질 체크 보기'}
                              {selectedActivityForQuality === activity.id ? '▲' : '▼'}
                            </button>
                          </div>

                          {/* 실시간 품질 체크 */}
                          {selectedActivityForQuality === activity.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4"
                            >
                              <RealTimeQualityChecker
                                text={activity.content}
                                maxLength={currentForm.maxChars}
                                sectionType={basicInfo?.sectionType}
                              />
                            </motion.div>
                          )}
                        </div>

                        {/* 깨달은 바 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            깨달은 바 / 배운 점
                          </label>
                          <textarea
                            value={activity.learnings || ''}
                            onChange={(e) => updateActivityField(currentForm.formType, activity.id, 'learnings', e.target.value)}
                            placeholder="이 활동을 통해 배우거나 깨달은 점을 작성하세요"
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 활동 추가 버튼 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addActivity(currentForm.formType)}
                  className="w-full mt-6 py-4 border-2 border-dashed border-green-300 text-green-700 rounded-2xl hover:bg-green-50 font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-6 h-6" />
                  활동 추가하기
                </motion.button>

                {/* 하단 네비게이션 */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    ← 이전 단계
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-teal-700 shadow-lg transition-all flex items-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    AI 생성 시작 →
                  </button>
                </div>
              </motion.div>

              {/* 진행 표시 */}
              <div className="mt-8 flex justify-center items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              </div>
            </div>

            {/* 오른쪽: 가이드라인 & 활동 추천 (1컬럼 차지) */}
            <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
              {/* 가이드라인 토글 버튼 */}
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">작성 가이드</span>
                </div>
                {showGuidelines ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showGuidelines && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AIGuidelinesPanel sectionType={basicInfo?.sectionType} />
                </motion.div>
              )}

              {/* 활동 추천 */}
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">활동 아이디어</span>
                </div>
                {showSuggestions ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ActivitySuggestions
                    sectionType={basicInfo?.sectionType || 'general'}
                    track={studentInfo?.track}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page2ActivityInputEnhanced;
