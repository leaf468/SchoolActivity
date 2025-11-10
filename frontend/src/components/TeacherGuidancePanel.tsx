import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface TeacherGuidancePanelProps {
  sectionType?: string;
}

const TeacherGuidancePanel: React.FC<TeacherGuidancePanelProps> = ({ sectionType = 'general' }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const guidance = {
    general: {
      title: '생기부 작성 시 주의사항',
      sections: [
        {
          id: 'legal',
          icon: ExclamationTriangleIcon,
          title: '법적 준수사항',
          color: 'red',
          items: [
            '허위사실 기재 금지: 실제 없었던 활동이나 과장된 내용 절대 금지',
            '개인정보 보호: 학생의 민감한 개인정보(질병, 가정사 등) 기재 금지',
            '차별적 표현 금지: 외모, 가정환경 등 차별적 요소 언급 금지',
            '타인 비방 금지: 다른 학생과의 비교나 비하 표현 사용 금지',
            '수상 실적은 학교장의 참가 허가를 받은 교내외 대회 실적만 기재'
          ]
        },
        {
          id: 'observation',
          icon: AcademicCapIcon,
          title: '학생 관찰 및 기록 팁',
          color: 'blue',
          items: [
            '일상적 관찰 기록: 수업 중 질문, 발표, 과제 수행 태도를 수시로 메모',
            '구체적 에피소드: "탐구심이 많다" 대신 "○○ 현상에 의문을 품고 3주간 탐구함"',
            '변화와 성장: 학기 초와 후의 변화, 어려움 극복 과정 기록',
            '팀 활동에서의 역할: 개별 기여도와 협력 과정을 구체적으로 관찰',
            '진로 연계성: 활동이 학생의 진로 탐색과 어떻게 연결되는지 파악'
          ]
        },
        {
          id: 'writing',
          icon: LightBulbIcon,
          title: '효과적인 작성 기법',
          color: 'yellow',
          items: [
            '행동 동사 사용: "노력함", "참여함" 대신 "분석함", "설계함", "탐구함"',
            '정량적 표현: "많은", "열심히" 대신 "3개월간", "10회", "5종의 자료"',
            '과정 중심 서술: 결과뿐 아니라 고민, 시행착오, 개선 과정 기록',
            'A-M-A-R 구조: 활동→동기→심화→깨달음 순서로 스토리텔링',
            '학생 고유성: 다른 학생과 차별화되는 특성이나 관점 강조'
          ]
        },
        {
          id: 'ai',
          icon: CheckBadgeIcon,
          title: 'AI 활용 가이드',
          color: 'green',
          items: [
            '보조 도구로 활용: AI는 초안 작성 도구일 뿐, 최종 검토는 교사가 필수',
            '사실 확인: AI 생성 내용이 실제 학생 활동과 일치하는지 반드시 확인',
            '개인화: AI 초안을 학생 개별 특성에 맞게 수정 및 보완',
            '윤리적 사용: 과장되거나 허위 내용 생성 시 반드시 수정',
            '다양성 확보: 같은 반 학생들의 생기부가 비슷하지 않도록 개별화'
          ]
        }
      ]
    },
    subject: {
      title: '교과세특 작성 가이드 (선생님용)',
      sections: [
        {
          id: 'curriculum',
          icon: AcademicCapIcon,
          title: '교육과정 연계',
          color: 'blue',
          items: [
            '성취기준 반영: 해당 학기 교육과정 성취기준을 반영한 내용 작성',
            '교과 역량: 교과별 핵심 역량(지식이해, 과정기능, 가치태도) 중심 서술',
            '깊이 있는 학습: 단순 암기가 아닌 이해, 적용, 분석 수준의 학습 기록',
            '교과서 외 확장: 교과서 범위를 넘어선 심화 탐구 활동 장려 및 기록',
            '융합적 사고: 타 교과나 실생활과의 연계성 발견 과정 기록'
          ]
        },
        {
          id: 'examples',
          icon: LightBulbIcon,
          title: '우수 사례 패턴',
          color: 'yellow',
          items: [
            '질문 기반: "수업 중 ○○ 개념에 의문을 품고 △△를 추가로 조사함"',
            '프로젝트형: "□□를 주제로 3주간 연구하여 ◇◇ 결과를 도출함"',
            '비교 분석: "A와 B를 비교하며 차이점과 공통점을 분석함"',
            '실험/실습: "가설을 세우고 실험을 설계하여 검증 과정을 수행함"',
            '발표/토론: "○○ 주제로 발표하며 급우들의 질문에 논리적으로 답변함"'
          ]
        }
      ]
    },
    club: {
      title: '동아리활동 작성 가이드 (선생님용)',
      sections: [
        {
          id: 'leadership',
          icon: AcademicCapIcon,
          title: '역할별 기록 포인트',
          color: 'blue',
          items: [
            '동아리장: 기획력, 리더십, 갈등 조정, 동아리 발전 기여',
            '부원: 전문성 향상, 프로젝트 기여, 자발적 참여, 후배 멘토링',
            '신입생: 학습 의지, 빠른 적응, 성장 과정, 창의적 아이디어',
            '팀 프로젝트: 개인의 구체적 역할과 기여도 명확히 기록',
            '지속성: 단순 참여가 아닌 1년간의 성장 과정 서술'
          ]
        }
      ]
    }
  };

  const currentGuidance = guidance[sectionType as keyof typeof guidance] || guidance.general;

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-500 to-red-600 text-red-700 bg-red-50 border-red-200',
      blue: 'from-blue-500 to-blue-600 text-blue-700 bg-blue-50 border-blue-200',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-700 bg-yellow-50 border-yellow-200',
      green: 'from-green-500 to-green-600 text-green-700 bg-green-50 border-green-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <AcademicCapIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{currentGuidance.title}</h3>
          <p className="text-sm text-gray-600">선생님을 위한 작성 가이드</p>
        </div>
      </div>

      <div className="space-y-3">
        {currentGuidance.sections.map((section, index) => {
          const IconComponent = section.icon;
          const colorParts = getColorClasses(section.color).split(' ');
          const gradientColor = colorParts[0];
          const textColor = colorParts[1];
          const bgColor = colorParts[2];
          const borderColor = colorParts[3];

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-xl overflow-hidden ${borderColor}`}
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className={`w-full p-4 ${bgColor} hover:opacity-80 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${gradientColor} rounded-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h4 className={`font-semibold ${textColor}`}>{section.title}</h4>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 ${textColor} transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white"
                  >
                    <ul className="p-4 space-y-3">
                      {section.items.map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <span className={`${textColor} font-bold mt-0.5`}>•</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <div className="flex items-start gap-3">
          <CheckBadgeIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-900 mb-1">
              AI 활용 시 필수 확인사항
            </p>
            <p className="text-xs text-gray-700">
              AI가 생성한 내용은 반드시 교사가 최종 검토하여 사실 여부를 확인하고,
              학생 개개인의 특성에 맞게 수정해주세요. 모든 법적 책임은 작성 교사에게 있습니다.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherGuidancePanel;
