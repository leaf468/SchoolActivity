/**
 * Few-Shot Learning Examples Database for 생기부 Generation
 *
 * This file contains real examples from successful college admissions
 * organized by track (계열), grade (학년), and section (섹션)
 *
 * ⚠️ IMPORTANT: These examples are for STYLE LEARNING ONLY
 * - DO NOT copy/paste the content directly
 * - DO NOT use specific activity names, book titles, or topics from examples
 * - ONLY learn the writing patterns, sentence structures, and linguistic style
 */

import { FewShotExample } from '../types/schoolActivity';

// ========================================
// 1학년 예시 (Real admission records)
// ========================================

const grade1Examples: FewShotExample[] = [
  // 자율활동
  {
    id: 'real-1-autonomy-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'autonomy',
    styleDescription: '[스타일 학습용] 자율활동 - 긴 복문 구조, 구체적 행위 동사 사용',
    exampleText: `기아, 음식쓰레기, 기후변화 등의 문제점을 인식하고 실천적 노력의 힘을 알 수 있게 하자는 취지의 교내 잔반 줄이기 캠페인에서 리더를 맡아 매일 학생들이 식판을 올바르게 스캔할 수 있도록 돕고, 잔반을 줄임으로써 얻을 수 있는 이점들을 홍보함으로써 실제로 잔반량을 줄이는 데 일조함(2020.12.09.-2021.01.15.).`
  },
  {
    id: 'real-1-autonomy-002',
    track: '공학계열',
    grade: 1,
    sectionType: 'autonomy',
    styleDescription: '[스타일 학습용] 자율활동 - 수학 개념 실생활 연계',
    exampleText: `수학적 개념과 원리 등을 실생활 사례와 연계하여 다양한 방식으로 재미있게 설명하는 교육청 주관의 '수학말하기'(2021.09.09.-09.15.)에 학교 대표로 참여함. 이 활동에서 '피보나치 수열, 황금비율과 마케팅'을 주제로 피보나치 수열을 활용한 기업의 로고, 제품 배열과 황금비를 활용한 제품의 비율 등을 탐구한 영상을 제작함으로써 수학 문화 대중화 기반 조성에 기여함.`
  },
  // 동아리활동
  {
    id: 'real-1-club-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'club',
    styleDescription: '[스타일 학습용] 동아리 - 경제 개념 탐구',
    exampleText: `(경제경영(EBS))(26시간) '붉은 여왕의 효과'라는 경제 용어에 대해 조사하면서 노력해도 성적이 크게 오르지 않는 이유에 개념을 대입하여 분석해보기도 하고 공연 기획사 탐방 등을 통해 회사 설립 과정과 운영 방법에 대한 질의응답 시간 등을 체험하면서 자신의 부족한 부분을 발전시켜 나가고 싶은 의지를 표현함.`
  },
  {
    id: 'real-1-club-002',
    track: '공학계열',
    grade: 1,
    sectionType: 'club',
    styleDescription: '[스타일 학습용] 동아리 - 아두이노 프로젝트',
    exampleText: `(플라텍(기계공학부))(28시간) 아두이노와 스피커를 이용하여 '봄이 좋냐'를 연주하였으며, 복잡한 박자를 잘 구현하여 후렴 부분을 끝까지 잘 연주함. 동아리 부스 준비에서 코딩 파트를 맡아 LED 체인을 분해해 정리하고, 초음파 센서를 사용해 일정 범위에서 움직임이 감지되면 움직이는 무선조종 자동차와 진동 센서를 사용해 충격을 감지하는 장치를 제작해 성공적인 축제 진행에 기여함.`
  },
  // 진로활동
  {
    id: 'real-1-career-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'career',
    styleDescription: '[스타일 학습용] 진로활동 - 재정관리 탐구',
    exampleText: `청소년 경제 소비 교육(2020.06.25.)을 통해 재정관리에 대해 탐구함. 본인이 경영인이라고 가정한 상태에서의 회사 재정 플랜을 구축해보았으며, 거기서 도출된 피드백을 바탕으로 재정관리 및 경영에 대해 더 깊은 지식을 가지게 됨.`
  },
  {
    id: 'real-1-career-002',
    track: '인문사회계열',
    grade: 1,
    sectionType: 'career',
    styleDescription: '[스타일 학습용] 진로활동 - 독서 후 진로 탐색',
    exampleText: `독서와 생활 시간에 '한국 경제, 경로를 재탐색합니다(김태일)'를 읽으며 희망 직업 분야를 탐색한 후, 관련된 발표를 통해 꿈에 대한 열정을 드러냄. 한국 경제의 문제점을 친구들에게 논리적으로 발표하였으며, 경제 기자로서 필요한 경제 지식을 습득하여 사고의 폭을 넓힘.`
  },
  // 세특(국어)
  {
    id: 'real-1-subject-korean-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'subject',
    subject: '국어',
    styleDescription: '[스타일 학습용] 세특(국어) - 독서 포트폴리오',
    exampleText: `한 학기 한 권 읽기 활동으로 법률 분야의 도서인 '검사내전'을 읽음. 자신의 경험을 토대로 새로운 가치관을 이끌어내는 적극적인 독서를 수행하고 이를 바탕으로 풍부한 내용의 독서 포트폴리오를 작성함. 독서 내용을 바탕으로 법이 가진 한계와 그 한계를 개선하기 위한 방향이라는 주제로 독후 발표를 진행하여 친구들에게 긍정적인 평가를 받음.`
  },
  // 세특(수학)
  {
    id: 'real-1-subject-math-001',
    track: '인문사회계열',
    grade: 1,
    sectionType: 'subject',
    subject: '수학',
    styleDescription: '[스타일 학습용] 세특(수학) - 집합 새로운 모형 제시',
    exampleText: `집합과 명제 단원에서 부분집합, 합집합, 교집합을 배우면서 가위, 바위, 보와 같이 서로 맞물리는 관계에 있는 경우를 표현할 수 있는 새로운 집합의 모형을 제시하기도 하였고 수열부분에서 피보나치 수열의 일반항을 구하는 두 가지 방법을 학급에서 급우들에게 발표하는 등 새로운 시도들이 참신했음.`
  },
  // 세특(통합사회)
  {
    id: 'real-1-subject-society-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'subject',
    subject: '통합사회',
    styleDescription: '[스타일 학습용] 세특(통합사회) - 경제적 불평등',
    exampleText: `'경제적 불평등'을 주제로 '사회불평등 알림 신문'을 만들어 발표함으로써 친구들의 큰 호응을 얻음. 해결 방안으로 누진세율의 적용과 사회적 취약계층에 대한 사회복지제도의 확대를 통찰력있게 제시하는 모습이 훌륭함.`
  },
  // 세특(외국어)
  {
    id: 'real-1-subject-german-001',
    track: '상경계열',
    grade: 1,
    sectionType: 'subject',
    subject: '독일어',
    styleDescription: '[스타일 학습용] 세특(독일어) - 독일 경제 탐구',
    exampleText: `독일 경제 경영에 대해 관심이 있어 독일 경제 분야 중 부동산에 대해서 조사하는 시간을 가짐. 독일의 부동산의 가격과 앞으로의 전망을 보면서 현재 독일이 겪고 있는 부동산 문제가 임대료 상승이고 이를 규제하기 위해 집값 인상을 제한하는 정책을 펼쳤다는 것을 알게 됨. 하지만 과거에 한국도 임대료 인상을 규제하는 시도를 해 보았지만 실패를 했다는 사실을 알게 된 후 그 실패의 이유에 대해 더 자세히 조사를 하겠다는 의지를 내비침.`
  }
];

// ========================================
// 2학년 예시 (Real admission records)
// ========================================

const grade2Examples: FewShotExample[] = [
  // 자율활동
  {
    id: 'real-2-autonomy-001',
    track: '공학계열',
    grade: 2,
    sectionType: 'autonomy',
    styleDescription: '[스타일 학습용] 자율활동 - 수학 영상 제작',
    exampleText: `수학적 개념과 원리 등을 실생활 사례와 연계하여 다양한 방식으로 재미있게 설명하는 교육청 주관의 '2021 수다한마당 수학말하기'(2021.09.09.-09.15.)에 학교 대표로 참여함. 이 활동에서 '피보나치 수열, 황금비율과 마케팅'을 주제로 피보나치 수열을 활용한 기업의 로고, 제품 배열과 황금비를 활용한 제품의 비율 등을 탐구한 영상을 제작함으로써 수학 문화 대중화 기반 조성에 기여함.`
  },
  // 동아리활동
  {
    id: 'real-2-club-001',
    track: '공학계열',
    grade: 2,
    sectionType: 'club',
    styleDescription: '[스타일 학습용] 동아리 - 아두이노 스피커 연주',
    exampleText: `(플라텍(기계공학부))(28시간) 아두이노와 스피커를 이용하여 '봄이 좋냐'를 연주하였으며, 복잡한 박자를 잘 구현하여 후렴 부분을 끝까지 잘 연주함. 동아리 부스 준비에서 코딩 파트를 맡아 LED 체인을 분해해 정리하고, 초음파 센서를 사용해 일정 범위에서 움직임이 감지되면 움직이는 무선조종 자동차와 진동 센서를 사용해 충격을 감지하는 장치를 제작해 성공적인 축제 진행에 기여함.`
  },
  // 진로활동
  {
    id: 'real-2-career-001',
    track: '인문사회계열',
    grade: 2,
    sectionType: 'career',
    styleDescription: '[스타일 학습용] 진로활동 - 독서 후 발표',
    exampleText: `독서와 생활(2018.03.09.-2018.07.13.) 시간에 '한국 경제, 경로를 재탐색합니다(김태일)'를 읽으며 희망 직업 분야를 탐색한 후, 관련된 발표를 통해 꿈에 대한 열정을 드러냄. 한국 경제의 문제점을 친구들에게 논리적으로 발표하였으며, 경제 기자로서 필요한 경제 지식을 습득하여 사고의 폭을 넓힘.`
  },
  // 세특(문학)
  {
    id: 'real-2-subject-literature-001',
    track: '상경계열',
    grade: 2,
    sectionType: 'subject',
    subject: '문학',
    styleDescription: '[스타일 학습용] 세특(문학) - 성장소설 연계 독서',
    exampleText: `문학작품 감상의 방법을 정확히 이해하여 작품의 전체적 맥락을 읽어내고 주제 의식을 탐색하는 능력이 뛰어남. 아울러 문학 작품을 통해 세상을 바라보는 시각을 길러나가는 열정이 돋보임. 그 구체적인 활동으로, 성장소설인 '19세(이순원)'를 학습하고서 '변하는 것과 변하지 않는 것(강민호)'을 탐독함. 자신의 진로와 연계하여 작가의 경험과 철학을 통해 경영 마케팅의 본질과 올바른 경영인의 마인드를 이해하고자 접한 독서 활동을 통해 지속 가능한 경영을 위해 기업이 추구해야 할 근본적인 목적은 이익 창출이 아닌 가치창출임을 자각함.`
  },
  // 세특(수학II)
  {
    id: 'real-2-subject-math2-001',
    track: '상경계열',
    grade: 2,
    sectionType: 'subject',
    subject: '수학II',
    styleDescription: '[스타일 학습용] 세특(수학II) - 미분과 한계비용',
    exampleText: `함수의 극한, 미분 단원에서 '한계비용과 이윤을 극대화 하는 방법'을 주제로 발표계획서를 작성하고 수업시간에 발표함. 미분은 현상의 순간적인 변화를 측정하기 위한 도구로, 경제학에서 한계비용은 미분이 활용된 것으로, 총수익에서 총비용을 뺀 값이 최대가 되려면 특정한 재화나 서비스 생산량에서의 각 함수를 지나는 점에서의 순간변화율이 같아야 하며, 이것은 한계비용과 한계수익이 같을 때 이익이 최대가 되는 것을 설명함.`
  },
  // 세특(영어)
  {
    id: 'real-2-subject-english-001',
    track: '상경계열',
    grade: 2,
    sectionType: 'subject',
    subject: '심화 영어 독해',
    styleDescription: '[스타일 학습용] 세특(영어) - 마케팅 에세이',
    exampleText: `영어 독해력과 분석력이 뛰어나 모든 과제에서 우수한 성과를 내는 학생으로 영어가 서툰 친구를 위해 멘토를 자청해 급우들의 질문에 친절하게 답하는 모습을 보임. 수업시간에 다룬 영어지문 '감정적 요소를 활용하는 설득의 방법'을 읽고 '효율적인 마케팅을 위해 감정적인 요소를 적용시킬 수 있을까'에 대한 호기심을 바탕으로 관련도서를 탐구함. '마케팅에서 감정의 힘'을 주제로 서론, 본론, 결론의 형식을 갖추어 영어 에세이를 작성함.`
  },
  // 세특(법과정치)
  {
    id: 'real-2-subject-politics-001',
    track: '인문사회계열',
    grade: 2,
    sectionType: 'subject',
    subject: '법과정치',
    styleDescription: '[스타일 학습용] 세특(법과정치) - 실제 정치 질문',
    exampleText: `현실 정치에 대한 남다른 관심과 감각을 바탕으로 수업에 임하며 학습 내용을 단순히 이해하고 질문하는 다른 학생들과는 달리 깊이 있고 실제적 질문을 자주해 교사의 칭찬을 받음. 가령 국회 운영과 입법 과정 같은 일반 지식을 배우면 수업 후 '국회선진화법'을 찾아보고 교사를 찾아와 질문하는 경우가 대표적임. 때문에 교사와 평소 정치 현실과 사회 상황에 대한 이야기를 자주 나눔.`
  },
  // 세특(화학)
  {
    id: 'real-2-subject-chemistry-001',
    track: '자연과학계열',
    grade: 2,
    sectionType: 'subject',
    subject: '화학I',
    styleDescription: '[스타일 학습용] 세특(화학) - 수소수 비판적 고찰',
    exampleText: `화학에 관심과 흥미가 많아 수업 시간 중 높은 집중도를 보여줌. 특히 사회적 쟁점이었던 수소수의 정의 및 효과, 수소수 제조 방법의 과학적 타당성을 원자, 분자, 이온, 화학결합의 원리, 산화환원반응 등의 화학 개념을 잘 활용하여 조목조목 비판하는 보고서를 작성하고 급우들 앞에서 조리있게 발표하는 등 수업 시간에 배운 화학 지식을 체화시키고 과학적인 증거와 이론을 토대로 생활 속의 문제를 비판적으로 고찰하는 태도가 매우 돋보였음.`
  },
  // 세특(정보)
  {
    id: 'real-2-subject-info-001',
    track: '상경계열',
    grade: 2,
    sectionType: 'subject',
    subject: '정보',
    styleDescription: '[스타일 학습용] 세특(정보) - 메타버스 탐색',
    exampleText: `정보 과학 기술의 윤리적 활용에 대해 이해하고 건전한 정보 활용에 대한 윤리적 소양을 갖추어 정보화 사회를 이끌어갈 수 있는 자질을 지님. 사이버 공간에서의 잊힐 권리에 대한 토론에서 정보 주권과 2차 피해 발생 가능성 등의 구체적 근거를 들어 법제화에 찬성함. 메타버스의 개념과 적용 분야에 대해 탐색하고 메타버스의 확대가 우리의 삶에 어떠한 영향을 미칠지 탐색함.`
  }
];

// ========================================
// 3학년 예시 (Real admission records)
// ========================================

const grade3Examples: FewShotExample[] = [
  // 자율활동
  {
    id: 'real-3-autonomy-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'autonomy',
    styleDescription: '[스타일 학습용] 자율활동 - 영어 토론',
    exampleText: `글로벌리더십프로그램(2022.03.14.-2022.08.14.)에서 플라스틱 물병 사용을 주제로 영어로 토론함. 플라스틱 사용을 반대하는 입장으로 경제적 손해의 측면을 중심으로 논리적인 주장을 펼침. 이후 환경에 대한 대중의 인식이 산업에 많은 영향을 끼친다는 것을 알게 되어 경영을 할 때에는 현재의 트렌드와 대중의 심리를 분석하는 것이 선행되어야 할 일이라고 말함.`
  },
  // 동아리활동
  {
    id: 'real-3-club-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'club',
    styleDescription: '[스타일 학습용] 동아리 - 경제 이슈 토론',
    exampleText: `(TESAT(경제·경영심화연구동아리))(31시간) 우리사회가 저출산과 고령화로 인해 인구절벽 문제에 직면하면서 세대 간 갈등의 문제가 되는 연금문제에 관심을 갖고 '국민연금 고갈 위기와 그 이유'를 주제로 이슈토론을 함. 선진국가에서 대부분 연금개시연령을 상향하는 추세로 전환하면서 연금 재정안정화 및 지속성을 유지하고자 효과적인 대안을 제시하고 있는 해외 연금제도 개편 사례를 제시하였으며, 우리나라의 연금문제 및 제도 개선을 위해 국민연금규모와 국민연금구조를 분석함.`
  },
  // 진로활동
  {
    id: 'real-3-career-001',
    track: '공학계열',
    grade: 3,
    sectionType: 'career',
    styleDescription: '[스타일 학습용] 진로활동 - 앱 제작 프로젝트',
    exampleText: `학교생활을 통해 배우고 알게 된 것을 교내의 사회적 참여 활동으로 직접 실천해 보는 지행일치 프로젝트(2019.05.07.-2020.02.06.)에 참여해, 평소 자신의 내신등급 계산을 어려워하는 주변 친구들의 불편함을 해소하고자 내신 등급 계산기 애플리케이션을 제작하는 활동을 계획 및 실행 후 과정과 결과를 정리한 활동보고서를 작성함.`
  },
  // 세특(언어와 매체)
  {
    id: 'real-3-subject-language-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'subject',
    subject: '언어와 매체',
    styleDescription: '[스타일 학습용] 세특(언어와 매체) - 취향의 경제',
    exampleText: `평소 경제 분야에 대한 관심이 많은 학생으로, 경제 관련 독서 지문 학습에서 두각을 드러냄. 독서 지문을 통해 재화나 서비스의 가격을 결정하는 요인을 학습한 후, 명품, 대체불가토큰 등 그 자체로는 수익을 창출할 수 없는 것들이 경제적으로 높은 가치를 가지는 이유에 대해 의문을 가지고 한 학기 한권 읽기 활동에서 '취향의 경제(유승호)'를 읽음.`
  },
  // 세특(확률과 통계)
  {
    id: 'real-3-subject-stats-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'subject',
    subject: '확률과 통계',
    styleDescription: '[스타일 학습용] 세특(확률과 통계) - 빈부격차 분석',
    exampleText: `국민 대차대조표를 통해 우리나라 가계 총자산은 지속적인 증가를 보이지만, 지니계수의 지속적인 증가를 근거로 대부분의 총자산 증가량이 상위 계층에 분포되어 있다고 예상함. 가계동향조사 결과를 분석하여 빈부격차의 정도를 정확히 파악함. 나아가 정부가 빈부격차 완화 정책을 시행할 때의 변화를 예측하여 수치해석역량과 논리적인 근거를 바탕으로 추론하는 융합적 사고력이 돋보임.`
  },
  // 세특(아카데믹 영어)
  {
    id: 'real-3-subject-english-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'subject',
    subject: '아카데믹 영어',
    styleDescription: '[스타일 학습용] 세특(영어) - 마케팅 영문 보고서',
    exampleText: `또래 수준 이상의 영어 독해 실력과 작문 실력으로 고교 수준 이상의 학문적 자료를 이해하고 이를 보고서로 작성하는 능력이 탁월함. 효과적이지 않은 마케팅 방법을 소재로 다른 지문을 학습한 후 매출에 큰 효과가 있는 마케팅 방법에 대한 호기심을 바탕으로 Jex Groom의 'Ripple'을 선정하여 부드러운 권유 방법을 통하여 소비자의 구매 동기를 자극하는 방법이라는 마케팅 분야의 세부 정보를 이해하고 이를 영문으로 작성함.`
  },
  // 세특(사회문제 탐구)
  {
    id: 'real-3-subject-society-001',
    track: '상경계열',
    grade: 3,
    sectionType: 'subject',
    subject: '사회문제 탐구',
    styleDescription: '[스타일 학습용] 세특(사회문제 탐구) - 세계화 토론',
    exampleText: `현대 사회의 변화 및 문제에 대해 학습한 이후, '세계화와 정보화는 대한민국에게 선물인가?'라는 논제로 토론을 함. 찬성의 입장에서 정치적, 경제적, 사회적, 문화적 측면으로 세계화와 정보화의 긍정적 영향에 대해 다각적인 분석을 한 후 토론을 진행함. 특히 경제적 측면에서 구체적인 사례를 통해 주장하여 학생들의 호응을 이끌어냄.`
  }
];

// ========================================
// 행동특성 및 종합의견 예시
// ========================================

const behaviorExamples: FewShotExample[] = [
  {
    id: 'real-behavior-1',
    track: '상경계열',
    grade: 1,
    sectionType: 'behavior',
    styleDescription: '[스타일 학습용] 행특 - 성실함과 봉사정신',
    exampleText: `끈기가 있어 한 번 맡은 일을 포기하지 않고 끝까지 최선을 다하는 편임. 또한 수업시간 집중력이 뛰어나 단 한 번도 딴 짓을 하지 않았으며 교우들의 질문에 하나하나 친절하게 잘 대답을 해 줌. 거짓말을 전혀 하지 않고 낙천적인 모습을 보이며 안양천에서의 학급봉사활동 시간에 시키지 않아도 솔선수범하여 열심히 쓰레기를 주워 타의 모범을 보임.`
  },
  {
    id: 'real-behavior-2',
    track: '공학계열',
    grade: 2,
    sectionType: 'behavior',
    styleDescription: '[스타일 학습용] 행특 - 꾸준함과 진로 탐색',
    exampleText: `조용하고 차분하며 매사 성실하고 일관된 자세로 꾸준히 노력하는 학생으로 모든 면에서 모범을 보여 급우들의 신망이 두터움. 학습 계획을 구체적으로 세워 지키고자 노력하며 고사 후에는 자신의 학습 방법에 대한 문제점과 해결방법을 생각해보고 개선하기 위해 노력하며, 컴퓨터 분야에 대한 진로의 방향과 목표가 분명하고 관련 도서를 찾아 읽으며 지식을 확장하고자 노력함. 컴퓨터 관련 동아리에 가입하여 적극적으로 활동하였으며, 기계와 컴퓨터에 관한 자율동아리를 조직하여 친구들과 공부하는 활동을 주도함.`
  },
  {
    id: 'real-behavior-3',
    track: '상경계열',
    grade: 3,
    sectionType: 'behavior',
    styleDescription: '[스타일 학습용] 행특 - 포용력과 수학적 사고',
    exampleText: `상대방의 다름과 차이를 인정하고 이를 포용하는 자세가 뛰어난 학생으로서 교사를 비롯한 모두와 좋은 관계를 형성하고 있음. 다수의 의견과 다른 생각을 가진 친구의 의견을 경청하고 그 차이를 이해하거나 설명해줌으로써 전체 공동체가 하나의 목표와 방향을 향해 가는데 크게 기여함. 수학적 사고 능력이 뛰어나고 어려운 문제를 시간이 얼마나 걸리든 스스로 답을 도출해 내는 과정에서 즐거움을 느낀다고 말하는 학생으로 다양한 시도를 통해 문제를 해결해가는 과정과 그 결과 도출되는 답안을 찾아내는 능력이 특출남.`
  }
];

// ========================================
// Export and Helper Functions
// ========================================

export const ALL_FEW_SHOT_EXAMPLES: FewShotExample[] = [
  ...grade1Examples,
  ...grade2Examples,
  ...grade3Examples,
  ...behaviorExamples
];

export function getRelevantExamples(
  track: string,
  grade: number,
  sectionType: string,
  topK: number = 3
): FewShotExample[] {
  let matches = ALL_FEW_SHOT_EXAMPLES.filter(ex => 
    ex.track === track && ex.grade === grade && ex.sectionType === sectionType
  );
  
  if (matches.length < topK) {
    const trackMatches = ALL_FEW_SHOT_EXAMPLES.filter(ex => ex.track === track);
    matches = [...matches, ...trackMatches.filter(ex => !matches.includes(ex))];
  }
  
  return matches.slice(0, topK);
}
