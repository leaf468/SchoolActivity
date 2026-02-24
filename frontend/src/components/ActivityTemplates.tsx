import React from 'react';
import { motion } from 'framer-motion';
import { SingleActivity } from '../types/schoolActivity';

interface ActivityTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  activities: Partial<SingleActivity>[];
  overallEmphasis?: string;
  overallKeywords?: string[];
}

const ACTIVITY_TEMPLATES: Record<string, ActivityTemplate[]> = {
  subject: [
    {
      id: 'subject-research',
      name: '심화 탐구 활동',
      category: '교과세특',
      icon: '🔬',
      activities: [
        {
          period: '',
          role: '탐구자',
          content: '수업 중 학습한 개념에 호기심을 갖고 심화 탐구를 진행함.',
          learnings: '이론의 실생활 적용 방안을 고민하며 학문적 깊이를 더함.',
          keywords: ['심화탐구', '자기주도학습'],
        },
      ],
      overallEmphasis: '지적 호기심과 자기주도적 학습 능력',
      overallKeywords: ['탐구력', '문제해결'],
    },
    {
      id: 'subject-presentation',
      name: '발표 및 토론 활동',
      category: '교과세특',
      icon: '🎤',
      activities: [
        {
          period: '',
          role: '발표자',
          content: '관련 주제에 대해 자료를 조사하고 발표를 진행함.',
          learnings: '다양한 관점을 이해하고 논리적 사고력을 향상시킴.',
          keywords: ['발표', '논리적사고'],
        },
      ],
      overallEmphasis: '적극적인 수업 참여와 의사소통 능력',
      overallKeywords: ['발표력', '소통'],
    },
    {
      id: 'subject-project',
      name: '프로젝트 학습',
      category: '교과세특',
      icon: '📊',
      activities: [
        {
          period: '',
          role: '프로젝트 팀원',
          content: '조별 프로젝트에서 자료 수집 및 분석을 담당함.',
          learnings: '협업을 통해 문제를 해결하고 결과물을 도출함.',
          keywords: ['프로젝트', '협업'],
        },
      ],
      overallEmphasis: '협업 능력과 문제 해결 역량',
      overallKeywords: ['협업', '결과물'],
    },
  ],
  autonomy: [
    {
      id: 'autonomy-campaign',
      name: '캠페인 활동',
      category: '자율활동',
      icon: '📢',
      activities: [
        {
          period: '',
          role: '캠페인 기획자',
          content: '학교 내 문제를 인식하고 개선 캠페인을 기획하여 운영함.',
          learnings: '공동체 의식을 함양하고 실천력을 기름.',
          keywords: ['캠페인', '공동체'],
        },
      ],
      overallEmphasis: '리더십과 사회적 책임감',
      overallKeywords: ['리더십', '실천력'],
    },
    {
      id: 'autonomy-student-council',
      name: '학생회 활동',
      category: '자율활동',
      icon: '🏛️',
      activities: [
        {
          period: '',
          role: '학생회 임원',
          content: '학생회 활동에 참여하여 학교 행사 기획 및 운영에 기여함.',
          learnings: '민주적 의사결정 과정을 경험하고 책임감을 기름.',
          keywords: ['학생회', '민주시민'],
        },
      ],
      overallEmphasis: '민주적 리더십과 책임감',
      overallKeywords: ['리더십', '민주시민'],
    },
    {
      id: 'autonomy-mentoring',
      name: '멘토링 활동',
      category: '자율활동',
      icon: '🤝',
      activities: [
        {
          period: '',
          role: '멘토',
          content: '학습 멘토링 프로그램에 참여하여 또래 학습을 지원함.',
          learnings: '가르치면서 배우는 경험을 통해 학습 내용을 정리함.',
          keywords: ['멘토링', '배려'],
        },
      ],
      overallEmphasis: '나눔 정신과 타인에 대한 배려',
      overallKeywords: ['나눔', '성장'],
    },
  ],
  club: [
    {
      id: 'club-academic',
      name: '학술 동아리',
      category: '동아리활동',
      icon: '📚',
      activities: [
        {
          period: '',
          role: '동아리 부원',
          content: '관심 분야의 학술 동아리에서 정기적인 탐구 활동을 수행함.',
          learnings: '심화 학습을 통해 진로에 대한 확신을 가짐.',
          keywords: ['학술탐구', '진로탐색'],
        },
      ],
      overallEmphasis: '전공 분야에 대한 깊은 관심',
      overallKeywords: ['전문성', '학습열정'],
    },
    {
      id: 'club-service',
      name: '봉사 동아리',
      category: '동아리활동',
      icon: '💝',
      activities: [
        {
          period: '',
          role: '봉사 동아리원',
          content: '봉사 동아리 활동을 통해 지역사회에 기여함.',
          learnings: '나눔의 가치를 배우고 사회적 책임감을 기름.',
          keywords: ['봉사', '나눔'],
        },
      ],
      overallEmphasis: '사회적 책임감과 공감 능력',
      overallKeywords: ['봉사정신', '공감'],
    },
    {
      id: 'club-creative',
      name: '창작/예술 동아리',
      category: '동아리활동',
      icon: '🎨',
      activities: [
        {
          period: '',
          role: '동아리 부원',
          content: '창작 활동을 통해 자신만의 작품을 완성함.',
          learnings: '창의적 표현력을 기르고 예술적 감수성을 함양함.',
          keywords: ['창작', '예술'],
        },
      ],
      overallEmphasis: '창의성과 예술적 감수성',
      overallKeywords: ['창의력', '표현력'],
    },
  ],
  career: [
    {
      id: 'career-research',
      name: '진로 탐색 활동',
      category: '진로활동',
      icon: '🎯',
      activities: [
        {
          period: '',
          role: '탐색자',
          content: '관심 분야의 직업과 학과에 대해 조사하고 탐색함.',
          learnings: '구체적인 진로 목표를 설정하고 준비 방향을 정함.',
          keywords: ['진로탐색', '자기이해'],
        },
      ],
      overallEmphasis: '명확한 진로 의식과 목표 설정',
      overallKeywords: ['진로의식', '목표설정'],
    },
    {
      id: 'career-experience',
      name: '직업 체험 활동',
      category: '진로활동',
      icon: '🏢',
      activities: [
        {
          period: '',
          role: '체험자',
          content: '직업 체험 프로그램에 참여하여 실제 업무를 경험함.',
          learnings: '이론과 실제의 차이를 이해하고 진로 적합성을 확인함.',
          keywords: ['직업체험', '현장경험'],
        },
      ],
      overallEmphasis: '실천적 진로 탐색과 적극적 자세',
      overallKeywords: ['실천력', '적극성'],
    },
    {
      id: 'career-portfolio',
      name: '진로 포트폴리오',
      category: '진로활동',
      icon: '📁',
      activities: [
        {
          period: '',
          role: '작성자',
          content: '진로 활동 내용을 정리하여 포트폴리오를 작성함.',
          learnings: '자신의 성장 과정을 객관적으로 정리하고 성찰함.',
          keywords: ['포트폴리오', '성찰'],
        },
      ],
      overallEmphasis: '체계적인 자기관리와 성찰 능력',
      overallKeywords: ['자기관리', '성장'],
    },
  ],
  behavior: [
    {
      id: 'behavior-leadership',
      name: '리더십 발휘',
      category: '행동특성',
      icon: '👑',
      activities: [
        {
          period: '',
          role: '리더',
          content: '학급 내에서 리더십을 발휘하여 활동을 이끎.',
          learnings: '구성원을 존중하며 협력하는 리더십을 배움.',
          keywords: ['리더십', '협력'],
        },
      ],
      overallEmphasis: '서번트 리더십과 협력적 자세',
      overallKeywords: ['리더십', '배려'],
    },
    {
      id: 'behavior-diligence',
      name: '성실성/책임감',
      category: '행동특성',
      icon: '⭐',
      activities: [
        {
          period: '',
          role: '',
          content: '맡은 역할에 책임감을 갖고 성실하게 수행함.',
          learnings: '꾸준함의 가치를 알고 자기 관리 능력을 기름.',
          keywords: ['성실성', '책임감'],
        },
      ],
      overallEmphasis: '성실함과 자기 관리 능력',
      overallKeywords: ['성실', '책임'],
    },
    {
      id: 'behavior-cooperation',
      name: '협동심/배려',
      category: '행동특성',
      icon: '🤝',
      activities: [
        {
          period: '',
          role: '',
          content: '모둠 활동에서 적극적으로 협력하며 타인을 배려함.',
          learnings: '함께하는 것의 가치를 알고 공동체 의식을 기름.',
          keywords: ['협동심', '배려'],
        },
      ],
      overallEmphasis: '협동심과 공동체 의식',
      overallKeywords: ['협동', '공동체'],
    },
  ],
};

interface ActivityTemplatesProps {
  sectionType: string;
  onSelectTemplate: (template: ActivityTemplate) => void;
  onClose: () => void;
}

const ActivityTemplates: React.FC<ActivityTemplatesProps> = ({
  sectionType,
  onSelectTemplate,
  onClose,
}) => {
  const templates = ACTIVITY_TEMPLATES[sectionType] || [];

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">빠른 템플릿 선택</h3>
              <p className="text-sm text-gray-500 mt-1">자주 사용되는 활동 유형을 선택하세요</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="grid gap-4">
            {templates.map((template, index) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="w-full p-5 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{template.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.activities[0]?.content?.slice(0, 50)}...
                    </p>
                    {template.overallKeywords && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {template.overallKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { ActivityTemplates, ACTIVITY_TEMPLATES };
export type { ActivityTemplate };
