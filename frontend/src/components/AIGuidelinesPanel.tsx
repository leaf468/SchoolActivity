import React from 'react';
import { motion } from 'framer-motion';
import {
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface AIGuidelinesPanelProps {
  sectionType?: string;
}

const AIGuidelinesPanel: React.FC<AIGuidelinesPanelProps> = ({ sectionType = 'general' }) => {
  const guidelines = {
    general: {
      title: '효과적인 생기부 작성 가이드',
      dos: [
        '구체적인 활동 내용과 과정을 상세히 기록',
        '수치나 데이터로 정량적 성과 표현',
        '활동을 통한 성장과 변화 과정 서술',
        '진로와 연결된 의미 있는 활동 강조',
        '팀 활동에서의 역할과 기여도 명시'
      ],
      donts: [
        '단순 참여 사실만 나열',
        '과장되거나 검증 불가능한 내용',
        '추상적이고 모호한 표현',
        '타인의 성과를 본인 것처럼 서술',
        '활동과 무관한 개인 감상'
      ],
      tips: [
        '💡 A-M-A-R 구조 활용: 활동(Action) → 동기(Motivation) → 심화활동(Advanced) → 깨달음(Realization)',
        '📊 서울대 합격생 데이터 분석 결과를 반영한 AI 알고리즘',
        '✍️ 교사의 자연스러운 문체를 학습하여 AI 탐지 회피',
        '🎯 계열별 맞춤 키워드와 표현 자동 추천'
      ]
    },
    subject: {
      title: '교과세특 작성 가이드',
      dos: [
        '수업 중 질문하거나 발표한 내용 구체적으로 기록',
        '교과서 외 추가 탐구 활동과 자료 명시',
        '개념 이해도와 응용 능력을 보여주는 사례',
        '교과 내용과 진로의 연결고리 강조',
        '토론/발표/실험 등 수업 참여도 표현'
      ],
      donts: [
        '단순히 "열심히 했다"는 추상적 표현',
        '교과서 내용을 그대로 요약',
        '성적이나 등수 언급',
        '수업과 무관한 외부 활동',
        '다른 과목 내용 혼재'
      ],
      tips: [
        '💡 구체적 탐구 주제: "경제 시간에 ○○ 개념에 의문을 품고..."',
        '📚 참고 자료 명시: "△△ 논문을 읽고 비교 분석..."',
        '🔬 실험/프로젝트: "□□를 직접 설계하여 검증..."',
        '🎯 진로 연계: "이를 통해 ◇◇ 분야에 대한 관심이..."'
      ]
    },
    autonomy: {
      title: '자율활동 작성 가이드',
      dos: [
        '학급/학생회에서 맡은 역할과 구체적 활동',
        '행사 기획 과정에서의 창의적 아이디어',
        '문제 해결 과정과 리더십 발휘 사례',
        '학급 공동체 발전을 위한 기여',
        '동료들과의 협력과 소통 과정'
      ],
      donts: [
        '단순 참여 여부만 나열',
        '개인 성과만 강조',
        '형식적인 역할 수행 서술',
        '구체적 근거 없는 리더십 주장',
        '다른 학생 비하하는 내용'
      ],
      tips: [
        '💡 리더십: "학급 회장으로서 ○○ 문제를 해결하기 위해..."',
        '🎨 창의성: "기존 방식과 달리 △△한 아이디어를 제안..."',
        '🤝 협력: "반 친구들과 의견을 조율하여..."',
        '📈 성과: "결과적으로 학급 분위기가 ◇◇하게 변화..."'
      ]
    },
    club: {
      title: '동아리활동 작성 가이드',
      dos: [
        '동아리 내 구체적 프로젝트나 연구 활동',
        '정기적 활동 참여와 전문성 향상 과정',
        '동아리 운영 개선이나 발전 기여 사례',
        '외부 대회/발표회 준비 과정과 결과',
        '후배 지도나 지식 공유 활동'
      ],
      donts: [
        '동아리 소개만 나열',
        '참여 횟수나 시간만 강조',
        '동아리 전체 활동을 본인 활동처럼 서술',
        '단순 취미 활동 수준',
        '진로와 무관한 일회성 활동'
      ],
      tips: [
        '💡 전문성: "○○ 기법을 습득하여 작품 수준이..."',
        '🔬 탐구: "△△ 주제로 3개월간 연구하여..."',
        '🏆 성과: "□□ 대회에서 ◇◇상을 수상..."',
        '👨‍🏫 공유: "후배들에게 멘토링하며..."'
      ]
    },
    career: {
      title: '진로활동 작성 가이드',
      dos: [
        '진로 탐색 동기와 구체적 탐색 과정',
        '직업 체험/멘토링에서 배운 실질적 내용',
        '희망 진로 분야의 심화 탐구 활동',
        '진로 관련 독서와 실천 계획',
        '진로 변화 과정과 그 이유'
      ],
      donts: [
        '막연한 진로 희망만 서술',
        '일회성 체험 활동 나열',
        '진로와 무관한 흥미 활동',
        '부모님 직업 체험만 강조',
        '구체적 근거 없는 적성 주장'
      ],
      tips: [
        '💡 탐색: "○○ 직업의 실제 업무를 알기 위해..."',
        '📚 독서: "△△ 책을 읽고 진로에 대한 생각이..."',
        '🎯 실천: "□□ 역량을 키우기 위해 ◇◇를..."',
        '🔄 성장: "처음과 달리 이제는 ▽▽한 측면도..."'
      ]
    }
  };

  const currentGuideline = guidelines[sectionType as keyof typeof guidelines] || guidelines.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{currentGuideline.title}</h3>
      </div>

      {/* DO's */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-gray-900">✅ 이렇게 작성하세요</h4>
        </div>
        <ul className="space-y-2">
          {currentGuideline.dos.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="text-green-500 mt-0.5">•</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* DON'Ts */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-gray-900">❌ 이런 표현은 피하세요</h4>
        </div>
        <ul className="space-y-2">
          {currentGuideline.donts.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.25 }}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="text-red-500 mt-0.5">•</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <LightBulbIcon className="w-5 h-5 text-yellow-600" />
          <h4 className="font-semibold text-gray-900">💡 AI 작성 팁</h4>
        </div>
        <ul className="space-y-2">
          {currentGuideline.tips.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.5 }}
              className="text-sm text-gray-700 leading-relaxed"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* AI 품질 보장 배지 */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <SparklesIcon className="w-4 h-4 text-indigo-500" />
            <span>AI 탐지 회피율 94%</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span>서울대 합격생 데이터 학습</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIGuidelinesPanel;
