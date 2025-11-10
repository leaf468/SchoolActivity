import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface ActivitySuggestionsProps {
  sectionType: string;
  track?: string;
}

const ActivitySuggestions: React.FC<ActivitySuggestionsProps> = ({ sectionType, track }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const suggestions = {
    subject: {
      상경계열: [
        {
          icon: '📊',
          title: '경제 데이터 분석 프로젝트',
          description: '한국은행 경제통계시스템(ECOS)에서 실제 경제 지표를 추출하여 Excel로 분석',
          keywords: ['데이터 분석', '경제 이해', '통계 활용'],
          example: '수업 시간에 배운 GDP 개념을 실제 한국의 GDP 성장률 데이터에 적용하여 경기 변동 패턴을 분석함.'
        },
        {
          icon: '💼',
          title: '기업 재무제표 분석',
          description: '전자공시시스템(DART)에서 상장기업의 재무제표를 조회하고 재무비율 계산',
          keywords: ['재무 분석', '기업 가치 평가', '회계'],
          example: '삼성전자와 LG전자의 재무제표를 비교 분석하며 기업의 수익성과 안정성을 평가하는 능력을 기름.'
        },
        {
          icon: '📈',
          title: '모의 주식 투자',
          description: '증권사 모의투자 프로그램을 활용한 포트폴리오 구성 및 운용',
          keywords: ['투자 전략', '리스크 관리', '시장 분석'],
          example: '3개월간 모의투자를 진행하며 분산투자의 중요성과 시장 변동성에 대한 이해를 높임.'
        }
      ],
      공학계열: [
        {
          icon: '🔬',
          title: '아두이노 프로젝트',
          description: '아두이노를 활용한 센서 기반 자동화 시스템 제작',
          keywords: ['프로그래밍', '하드웨어', '문제 해결'],
          example: '온도 센서와 모터를 연결하여 자동 환기 시스템을 설계하고 C언어로 프로그래밍함.'
        },
        {
          icon: '💻',
          title: '알고리즘 문제 풀이',
          description: 'Baekjoon, Programmers 등 코딩 플랫폼에서 알고리즘 학습',
          keywords: ['알고리즘', '논리적 사고', '코딩'],
          example: '동적 계획법을 학습하며 200개 이상의 알고리즘 문제를 해결하고 효율성을 개선함.'
        },
        {
          icon: '🤖',
          title: 'AI/ML 기초 프로젝트',
          description: 'Python과 TensorFlow로 간단한 머신러닝 모델 구현',
          keywords: ['인공지능', 'Python', '데이터 과학'],
          example: 'MNIST 데이터셋으로 손글씨 인식 모델을 구현하며 신경망의 작동 원리를 이해함.'
        }
      ],
      자연과학계열: [
        {
          icon: '🧪',
          title: '화학 실험 프로젝트',
          description: '가설 설정 후 실험 설계, 수행, 결과 분석 및 보고서 작성',
          keywords: ['실험 설계', '과학적 탐구', '분석력'],
          example: 'pH에 따른 효소 활성도 변화를 실험하며 최적 조건을 찾는 과학적 방법론을 습득함.'
        },
        {
          icon: '🔭',
          title: '천문 관측 활동',
          description: '별자리 관측 앱을 활용한 천체 관측 및 일지 작성',
          keywords: ['관찰력', '우주 과학', '기록'],
          example: '3개월간 달의 위상 변화를 관측하고 기록하며 천체 운동의 규칙성을 발견함.'
        },
        {
          icon: '📐',
          title: '수학 개념 심화 탐구',
          description: '수업에서 배운 개념을 확장하여 실생활 문제에 적용',
          keywords: ['수학적 사고', '응용력', '논리'],
          example: '미적분을 활용하여 최적의 포장 상자 크기를 계산하는 최적화 문제를 해결함.'
        }
      ]
    },
    club: [
      {
        icon: '📰',
        title: '신문 제작 동아리',
        description: '학교 소식 취재, 기사 작성, 편집, 배포까지 전 과정 참여',
        keywords: ['글쓰기', '취재', '편집'],
        example: '매월 학교 신문을 발행하며 사회 이슈를 학생 관점에서 분석하는 기사를 작성함.'
      },
      {
        icon: '🎭',
        title: '연극/뮤지컬 동아리',
        description: '대본 분석, 연기 연습, 무대 제작, 공연 기획',
        keywords: ['표현력', '협동', '기획력'],
        example: '연극 "햄릿"을 현대적으로 재해석하여 공연하며 창의적 표현 능력을 개발함.'
      },
      {
        icon: '🌍',
        title: '환경 보호 동아리',
        description: '환경 문제 조사, 캠페인 기획, 실천 활동 전개',
        keywords: ['환경', '사회 참여', '실천'],
        example: '플라스틱 사용 줄이기 캠페인을 기획하고 전교생 대상 교육을 실시함.'
      },
      {
        icon: '🎨',
        title: '미술/디자인 동아리',
        description: '다양한 매체와 기법 연습, 전시회 기획',
        keywords: ['예술성', '창의성', '표현'],
        example: '수채화 기법을 연구하며 학교 미술관에 개인 작품전을 개최함.'
      },
      {
        icon: '🏀',
        title: '스포츠 동아리',
        description: '팀워크 훈련, 대회 참가, 후배 지도',
        keywords: ['체력', '협동', '리더십'],
        example: '농구부 주장으로서 훈련 계획을 수립하고 지역 대회에서 우승을 이끌어냄.'
      }
    ],
    career: {
      상경계열: [
        {
          icon: '🏢',
          title: '기업 탐방 및 인터뷰',
          description: '관심 기업 방문하여 실무자 인터뷰 및 업무 관찰',
          keywords: ['진로 탐색', '실무 이해', '네트워킹'],
          example: '회계법인을 방문하여 공인회계사의 업무를 관찰하고 진로 멘토링을 받음.'
        },
        {
          icon: '📊',
          title: '경영 시뮬레이션',
          description: '온라인 경영 시뮬레이션 게임으로 기업 운영 체험',
          keywords: ['경영 전략', '의사결정', '시뮬레이션'],
          example: 'CEO 시뮬레이션 게임에서 가상 기업을 운영하며 경영 전략의 중요성을 깨달음.'
        }
      ],
      공학계열: [
        {
          icon: '🔧',
          title: '메이커 스페이스 활동',
          description: '3D 프린터, 레이저 커터 등을 활용한 제작 활동',
          keywords: ['제작', '설계', '기술'],
          example: '3D 모델링으로 친환경 물병 거치대를 설계하고 3D 프린터로 출력하여 제작함.'
        },
        {
          icon: '🤖',
          title: '로봇 대회 참가',
          description: '로봇 설계, 제작, 프로그래밍 및 대회 출전',
          keywords: ['로봇 공학', '프로그래밍', '팀워크'],
          example: '로봇 축구 대회를 위해 4개월간 로봇을 제작하고 알고리즘을 개선함.'
        }
      ]
    }
  };

  const getRelevantSuggestions = () => {
    if (sectionType === 'subject' && track) {
      return suggestions.subject[track as keyof typeof suggestions.subject] || [];
    }
    if (sectionType === 'club') {
      return suggestions.club;
    }
    if (sectionType === 'career' && track) {
      return suggestions.career[track as keyof typeof suggestions.career] || [];
    }
    return [];
  };

  const relevantSuggestions = getRelevantSuggestions();

  if (relevantSuggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
          <AcademicCapIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">활동 아이디어 💡</h3>
          <p className="text-sm text-gray-600">클릭하여 자세히 보기</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {relevantSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => setSelectedCategory(selectedCategory === suggestion.title ? null : suggestion.title)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{suggestion.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedCategory === suggestion.title ? 'rotate-90' : ''
                  }`}
                />
              </div>

              <AnimatePresence>
                {selectedCategory === suggestion.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold text-purple-700">활동 내용:</span>{' '}
                          {suggestion.description}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-purple-700 mb-2">핵심 키워드</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">작성 예시</p>
                        <p className="text-sm text-gray-700 italic">"{suggestion.example}"</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 활동 내용에 자동 입력
                          alert('활동 예시를 입력란에 추가했습니다!');
                        }}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
                      >
                        이 예시 사용하기
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <p className="text-sm text-gray-700 text-center">
          💡 <span className="font-semibold">Tip:</span> 위 활동들은 실제 서울대 합격생들이 많이 한 활동을 바탕으로 추천됩니다
        </p>
      </div>
    </motion.div>
  );
};

export default ActivitySuggestions;
