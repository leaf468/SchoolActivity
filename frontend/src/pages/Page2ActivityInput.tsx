import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { motion } from 'framer-motion';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import AIGuidelinesPanel from '../components/AIGuidelinesPanel';
import ActivitySuggestions from '../components/ActivitySuggestions';
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
} from '@heroicons/react/24/outline';

// 교과 세특용 구조화된 폼
interface SubjectStructuredForm {
  learnedConcept: string;      // 학습한 주제/개념
  researchActivity: string;     // 탐구 활동
  application: string;          // 활용/적용
  presentation: string;         // 발표/보고서
  achievement: string;          // 성과/배운점
  freeForm: string;             // 자유 작성란
}

// 자율활동용 구조화된 폼
interface AutonomyStructuredForm {
  activityName: string;         // 활동명
  period: string;               // 활동 기간
  role: string;                 // 역할
  content: string;              // 활동 내용
  achievement: string;          // 성과/기여
  freeForm: string;             // 자유 작성란
}

// 동아리활동용 구조화된 폼
interface ClubStructuredForm {
  clubName: string;             // 동아리명
  hours: string;                // 활동 시간
  topic: string;                // 주제/프로젝트
  content: string;              // 활동 내용
  role: string;                 // 역할/기여
  achievement: string;          // 성과
  freeForm: string;             // 자유 작성란
}

// 진로활동용 구조화된 폼
interface CareerStructuredForm {
  activityName: string;         // 활동명/프로그램
  researchTopic: string;        // 탐구 주제
  content: string;              // 활동 내용
  learning: string;             // 배운 점
  freeForm: string;             // 자유 작성란
}

// 행동특성용 구조화된 폼
interface BehaviorStructuredForm {
  personality: string;
  classRole: string;
  characteristics: string;
  memorableActivity: string;
  relationships: string;
  attitude: string;
  freeForm: string;
}

const Page2ActivityInput: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActivityDetails, setCurrentStep, clearDraft } = useSchoolActivity();
  const { basicInfo, studentInfo } = state;

  // 교과 세특용 구조화된 상태
  const [subjectStructured, setSubjectStructured] = useState<SubjectStructuredForm>({
    learnedConcept: '',
    researchActivity: '',
    application: '',
    presentation: '',
    achievement: '',
    freeForm: '',
  });

  // 자율활동용 구조화된 상태
  const [autonomyStructured, setAutonomyStructured] = useState<AutonomyStructuredForm>({
    activityName: '',
    period: '',
    role: '',
    content: '',
    achievement: '',
    freeForm: '',
  });

  // 동아리활동용 구조화된 상태
  const [clubStructured, setClubStructured] = useState<ClubStructuredForm>({
    clubName: '',
    hours: '',
    topic: '',
    content: '',
    role: '',
    achievement: '',
    freeForm: '',
  });

  // 진로활동용 구조화된 상태
  const [careerStructured, setCareerStructured] = useState<CareerStructuredForm>({
    activityName: '',
    researchTopic: '',
    content: '',
    learning: '',
    freeForm: '',
  });

  // 행동특성용 구조화된 상태
  const [behaviorStructured, setBehaviorStructured] = useState<BehaviorStructuredForm>({
    personality: '',
    classRole: '',
    characteristics: '',
    memorableActivity: '',
    relationships: '',
    attitude: '',
    freeForm: '',
  });

  // 기존 폼 상태들
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
        // 구조화된 입력을 기존 형식으로 변환
        const subjectCombined = [
          subjectStructured.learnedConcept && `[학습한 주제/개념] ${subjectStructured.learnedConcept}`,
          subjectStructured.researchActivity && `[탐구 활동] ${subjectStructured.researchActivity}`,
          subjectStructured.application && `[활용/적용] ${subjectStructured.application}`,
          subjectStructured.presentation && `[발표/보고서] ${subjectStructured.presentation}`,
          subjectStructured.achievement && `[성과/배운점] ${subjectStructured.achievement}`,
          subjectStructured.freeForm,
        ].filter(Boolean).join('\n\n');

        activityData = {
          ...subjectForm,
          activities: [{
            id: '1',
            period: '',
            role: '',
            content: subjectCombined,
            learnings: '',
            keywords: [],
          }],
        };
        break;

      case 'autonomy':
        const autonomyCombined = [
          autonomyStructured.activityName && `[활동명] ${autonomyStructured.activityName}`,
          autonomyStructured.period && `[활동 기간] ${autonomyStructured.period}`,
          autonomyStructured.role && `[역할] ${autonomyStructured.role}`,
          autonomyStructured.content && `[활동 내용] ${autonomyStructured.content}`,
          autonomyStructured.achievement && `[성과/기여] ${autonomyStructured.achievement}`,
          autonomyStructured.freeForm,
        ].filter(Boolean).join('\n\n');

        activityData = {
          ...autonomyForm,
          activities: [{
            id: '1',
            period: '',
            role: '',
            content: autonomyCombined,
            learnings: '',
            keywords: [],
          }],
        };
        break;

      case 'club':
        const clubCombined = [
          clubStructured.clubName && `[동아리명] ${clubStructured.clubName}`,
          clubStructured.hours && `[활동 시간] ${clubStructured.hours}`,
          clubStructured.topic && `[주제/프로젝트] ${clubStructured.topic}`,
          clubStructured.content && `[활동 내용] ${clubStructured.content}`,
          clubStructured.role && `[역할/기여] ${clubStructured.role}`,
          clubStructured.achievement && `[성과] ${clubStructured.achievement}`,
          clubStructured.freeForm,
        ].filter(Boolean).join('\n\n');

        activityData = {
          ...clubForm,
          clubName: clubStructured.clubName,
          activities: [{
            id: '1',
            period: '',
            role: '',
            content: clubCombined,
            learnings: '',
            keywords: [],
          }],
        };
        break;

      case 'career':
        const careerCombined = [
          careerStructured.activityName && `[활동명/프로그램] ${careerStructured.activityName}`,
          careerStructured.researchTopic && `[탐구 주제] ${careerStructured.researchTopic}`,
          careerStructured.content && `[활동 내용] ${careerStructured.content}`,
          careerStructured.learning && `[배운 점] ${careerStructured.learning}`,
          careerStructured.freeForm,
        ].filter(Boolean).join('\n\n');

        activityData = {
          ...careerForm,
          activities: [{
            id: '1',
            period: '',
            role: '',
            content: careerCombined,
            learnings: '',
            keywords: [],
          }],
        };
        break;

      case 'behavior':
        const behaviorCombined = [
          behaviorStructured.personality && `[성격] ${behaviorStructured.personality}`,
          behaviorStructured.classRole && `[학급에서의 역할] ${behaviorStructured.classRole}`,
          behaviorStructured.characteristics && `[특성] ${behaviorStructured.characteristics}`,
          behaviorStructured.memorableActivity && `[기억에 남는 활동] ${behaviorStructured.memorableActivity}`,
          behaviorStructured.relationships && `[교우관계] ${behaviorStructured.relationships}`,
          behaviorStructured.attitude && `[학습태도] ${behaviorStructured.attitude}`,
          behaviorStructured.freeForm,
        ].filter(Boolean).join('\n\n');

        activityData = {
          ...behaviorForm,
          activities: [{
            id: '1',
            period: '',
            role: '',
            content: behaviorCombined,
            learnings: '',
            keywords: [],
          }],
        };
        break;

      default:
        alert('항목 선택 오류');
        return;
    }

    const hasContent = activityData.activities.some((activity: SingleActivity) =>
      activity.content && activity.content.trim().length > 0
    );

    if (!hasContent) {
      alert('최소 1개 필드를 입력해주세요.');
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

  // 교과 세특 구조화된 입력 폼
  const renderSubjectStructuredForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          학습한 주제/개념 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.learnedConcept}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, learnedConcept: e.target.value })}
          placeholder="예: 함수의 극한, 미분 단원에서 '한계비용과 이윤을 극대화 하는 방법'"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          탐구 활동 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.researchActivity}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, researchActivity: e.target.value })}
          placeholder="예: 추가로 조사하거나 탐구한 내용, 관련 도서 독서 등"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활용/적용 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.application}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, application: e.target.value })}
          placeholder="예: 실생활 연계, 문제 해결에 적용한 사례"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          발표/보고서 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.presentation}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, presentation: e.target.value })}
          placeholder="예: 발표 내용, 보고서 작성 내용"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          성과/배운점 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.achievement}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, achievement: e.target.value })}
          placeholder="예: 얻은 지식, 향상된 역량"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          또는 자유롭게 작성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={subjectStructured.freeForm}
          onChange={(e) => setSubjectStructured({ ...subjectStructured, freeForm: e.target.value })}
          placeholder="위 항목 대신 자유롭게 작성하셔도 됩니다."
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>
    </div>
  );

  // 자율활동 구조화된 입력 폼
  const renderAutonomyStructuredForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동명 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={autonomyStructured.activityName}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, activityName: e.target.value })}
          placeholder="예: 교내 잔반 줄이기 캠페인"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동 기간 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={autonomyStructured.period}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, period: e.target.value })}
          placeholder="예: 2020.12.09.-2021.01.15."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          역할 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={autonomyStructured.role}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, role: e.target.value })}
          placeholder="예: 리더, 홍보부장, 참여자"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동 내용 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={autonomyStructured.content}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, content: e.target.value })}
          placeholder="예: 매일 학생들이 식판을 올바르게 스캔할 수 있도록 돕고, 잔반을 줄임으로써 얻을 수 있는 이점들을 홍보함"
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          성과/기여 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={autonomyStructured.achievement}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, achievement: e.target.value })}
          placeholder="예: 실제로 잔반량을 줄이는 데 일조함"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          또는 자유롭게 작성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={autonomyStructured.freeForm}
          onChange={(e) => setAutonomyStructured({ ...autonomyStructured, freeForm: e.target.value })}
          placeholder="위 항목 대신 자유롭게 작성하셔도 됩니다."
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>
    </div>
  );

  // 동아리활동 구조화된 입력 폼
  const renderClubStructuredForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          동아리명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={clubStructured.clubName}
          onChange={(e) => setClubStructured({ ...clubStructured, clubName: e.target.value })}
          placeholder="예: 경제경영마케팅동아리"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동 시간 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={clubStructured.hours}
          onChange={(e) => setClubStructured({ ...clubStructured, hours: e.target.value })}
          placeholder="예: 30시간"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          주제/프로젝트 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={clubStructured.topic}
          onChange={(e) => setClubStructured({ ...clubStructured, topic: e.target.value })}
          placeholder="예: 코로나 시대 기업들의 전자 상거래 전략"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동 내용 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={clubStructured.content}
          onChange={(e) => setClubStructured({ ...clubStructured, content: e.target.value })}
          placeholder="예: 전자 상거래로 인한 문제들을 방지하기 위한 법에 대해 살펴보고, 전세계 기업들의 사례를 조사함"
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          역할/기여 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={clubStructured.role}
          onChange={(e) => setClubStructured({ ...clubStructured, role: e.target.value })}
          placeholder="예: 자료조사 및 토론활동에서 주도적인 역할을 수행"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          성과 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={clubStructured.achievement}
          onChange={(e) => setClubStructured({ ...clubStructured, achievement: e.target.value })}
          placeholder="예: 시장의 흐름과 기업들이 소비자의 행동에 능동적으로 대처할 필요성에 대해 이해함"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          또는 자유롭게 작성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={clubStructured.freeForm}
          onChange={(e) => setClubStructured({ ...clubStructured, freeForm: e.target.value })}
          placeholder="위 항목 대신 자유롭게 작성하셔도 됩니다."
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>
    </div>
  );

  // 진로활동 구조화된 입력 폼
  const renderCareerStructuredForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동명/프로그램 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={careerStructured.activityName}
          onChange={(e) => setCareerStructured({ ...careerStructured, activityName: e.target.value })}
          placeholder="예: 진학 컨설팅 및 전공 분야 심화탐구 프로그램"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          탐구 주제 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={careerStructured.researchTopic}
          onChange={(e) => setCareerStructured({ ...careerStructured, researchTopic: e.target.value })}
          placeholder="예: 메타버스와 NFT"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          활동 내용 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={careerStructured.content}
          onChange={(e) => setCareerStructured({ ...careerStructured, content: e.target.value })}
          placeholder="예: 메타버스와 NFT의 원리와 연관성에 대해 조사하고 탐구 보고서를 작성함"
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          배운 점 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={careerStructured.learning}
          onChange={(e) => setCareerStructured({ ...careerStructured, learning: e.target.value })}
          placeholder="예: 진로 인식의 변화, 얻은 지식"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          또는 자유롭게 작성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={careerStructured.freeForm}
          onChange={(e) => setCareerStructured({ ...careerStructured, freeForm: e.target.value })}
          placeholder="위 항목 대신 자유롭게 작성하셔도 됩니다."
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>
    </div>
  );

  // 행동특성 구조화된 입력 폼
  const renderBehaviorStructuredForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          학생의 성격 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={behaviorStructured.personality}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, personality: e.target.value })}
          placeholder="예: 밝고 긍정적이며, 책임감이 강함"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          학급에서의 역할 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={behaviorStructured.classRole}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, classRole: e.target.value })}
          placeholder="예: 반장, 학급 환경미화 담당"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          학생의 특성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={behaviorStructured.characteristics}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, characteristics: e.target.value })}
          placeholder="예: 수업 시간에 적극적으로 질문하며, 모둠 활동에서 리더십을 발휘함"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          기억나는 활동 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={behaviorStructured.memorableActivity}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, memorableActivity: e.target.value })}
          placeholder="예: 학급 봉사활동에서 솔선수범하여 다른 학생들에게 모범이 됨"
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          교우관계 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={behaviorStructured.relationships}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, relationships: e.target.value })}
          placeholder="예: 친구들과 원만한 관계를 유지하며 배려심이 많음"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          학습태도 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={behaviorStructured.attitude}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, attitude: e.target.value })}
          placeholder="예: 성실하게 과제를 수행하며 자기주도적 학습 태도를 보임"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          또는 자유롭게 작성 <span className="text-gray-400 text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={behaviorStructured.freeForm}
          onChange={(e) => setBehaviorStructured({ ...behaviorStructured, freeForm: e.target.value })}
          placeholder="위 항목 대신 자유롭게 작성하셔도 됩니다."
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex flex-col">
      <CommonHeader />

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
              각 항목을 채워주시면 AI가 자연스럽게 통합하여 생기부를 작성합니다
            </p>
          </motion.div>

          {/* 작성 가이드 - 맨 위로 이동 */}
          <div className="mb-8">
            <AIGuidelinesPanel sectionType={basicInfo?.sectionType} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 입력 폼 (2컬럼) */}
            <div className="lg:col-span-2">
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

                {/* 섹션별 구조화된 폼 렌더링 */}
                {basicInfo?.sectionType === 'subject' && renderSubjectStructuredForm()}
                {basicInfo?.sectionType === 'autonomy' && renderAutonomyStructuredForm()}
                {basicInfo?.sectionType === 'club' && renderClubStructuredForm()}
                {basicInfo?.sectionType === 'career' && renderCareerStructuredForm()}
                {basicInfo?.sectionType === 'behavior' && renderBehaviorStructuredForm()}

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

            {/* 오른쪽: AI 추천 (1컬럼) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ActivitySuggestions
                  sectionType={basicInfo?.sectionType || 'general'}
                  track={studentInfo?.track}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default Page2ActivityInput;
