import OpenAI from 'openai';
import {
  BasicInfo,
  ActivityDetails,
  SubjectActivity,
  AutonomyActivity,
  ClubActivity,
  CareerActivity,
  BehaviorActivity,
  SectionType,
  DraftResult,
} from '../types/schoolActivity';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const REACT_APP_OPENAI_MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini';

// 퓨샷 샘플 데이터 (항목별 5개씩)
const FEW_SHOT_SAMPLES: Record<SectionType, string[]> = {
  service: [
    `지역 아동센터에서 6개월간 주 1회 교육 봉사를 진행하며 초등학생 5명을 대상으로 기초 수학 학습을 지도함. 학생별 학습 수준 차이가 크다는 점을 인식하고, 개인별 맞춤형 학습 자료를 제작하여 체계적으로 지도함. 특히 분수 개념을 어려워하는 학생에게 실생활 예시를 활용한 교구를 직접 제작하여 이해를 도왔고, 해당 학생이 학교 시험에서 80점 이상을 받는 성과를 거둠. 봉사 활동을 통해 교육의 본질은 단순한 지식 전달이 아닌 학습자 맞춤형 접근임을 깨달았으며, 교육자로서의 책임감과 보람을 느낌. 이 경험은 교육 봉사의 사회적 가치를 체감하는 계기가 되었음.`,
    `요양원에서 4개월간 매주 토요일 어르신들과의 소통 봉사 활동을 진행함. 초기에는 세대 차이로 인한 소통의 어려움을 겪었으나, 어르신들의 과거 이야기를 경청하고 공감하며 점차 신뢰 관계를 형성함. 특히 치매를 앓고 계신 어르신께 옛날 노래를 들려드리고 함께 부르며, 회상 치료의 효과를 체감함. 이 경험을 통해 노인 복지와 세대 간 소통의 중요성을 인식하게 되었으며, 사회 복지 분야에 대한 관심이 높아짐. 봉사 활동은 단순한 도움 제공이 아닌 상호 이해와 존중의 과정임을 깨달음.`,
    `환경 보호 캠페인 봉사 동아리에서 6개월간 활동하며, 지역 하천 정화 활동과 플라스틱 사용 줄이기 캠페인을 주도함. 매달 1회 하천 주변 쓰레기를 수거하고, 수질 오염도를 측정하여 데이터를 기록함. 이를 바탕으로 지역 주민 대상 환경 보호 포스터를 제작하여 배포하고, 일회용 플라스틱 사용 줄이기 서명 운동을 진행하여 200명 이상의 서명을 받음. 이 활동을 통해 환경 문제는 개인의 실천에서 시작됨을 깊이 이해하게 되었으며, 지속 가능한 미래를 위한 책임 의식을 함양함.`,
    `다문화 가정 아동 대상 한국어 교육 봉사를 5개월간 진행하며, 주 2회 기초 한국어와 학교 과제 보조 학습을 지원함. 언어적 어려움뿐 아니라 문화 적응의 어려움을 겪는 아동들의 상황을 이해하고, 한국 문화와 모국 문화를 모두 존중하는 태도로 접근함. 특히 한글 자음과 모음을 게임 방식으로 가르쳐 흥미를 유발하였고, 3개월 만에 기초 문장 작성이 가능해지는 성과를 거둠. 이 경험을 통해 다문화 사회의 현실을 체감하고, 언어 교육의 사회적 역할과 포용의 가치를 배움.`,
    `유기동물 보호소에서 6개월간 봉사 활동을 하며, 유기견 산책, 배식, 청소 등의 실무를 담당함. 단순 노동이 아닌, 동물의 행동 패턴을 관찰하고 스트레스를 줄이기 위한 환경 개선 방안을 고민함. 특히 사람을 경계하는 유기견에게 인내심을 가지고 접근하여 신뢰를 쌓았고, 해당 견이 입양되는 모습을 보며 큰 보람을 느낌. 이 경험을 통해 동물 복지의 중요성과 생명 존중의 가치를 깊이 깨닫게 되었으며, 반려동물과 인간의 공존에 대한 사회적 책임 의식을 함양함.`,
  ],
  subject: [
    `수학 수업 중 '확률과 통계' 단원에서 조건부 확률의 실생활 적용 사례를 탐구하며 깊은 관심을 보임. 특히 베이지안 정리를 의료 진단의 정확도 개선에 적용하는 방법을 독자적으로 조사하여, 가상의 질병 진단 시나리오를 설정하고 민감도와 특이도를 변화시키며 사후 확률이 어떻게 변하는지 수치적으로 분석함. 이 과정에서 Python을 활용해 시뮬레이션 코드를 작성하고, 시각화 자료를 제작하여 동료 학생들 앞에서 발표함으로써 추상적인 수학 개념을 구체적인 문제 해결에 연결하는 능력을 입증함. 또한 탐구 결과를 바탕으로 "확률론적 사고의 의료 분야 적용 가능성"이라는 주제로 보고서를 작성하여 교내 수학 탐구 대회에 제출, 우수상을 수상하며 논리적 사고력과 창의적 문제 해결 능력을 인정받음.`,
    `영어 수업에서 셰익스피어의 『햄릿』을 읽고 단순한 줄거리 이해를 넘어, 작품 속 복수와 정의의 개념을 현대 사회의 법과 윤리 관점에서 재해석하는 비평문을 작성함. 특히 햄릿의 고뇌와 지연된 행동을 심리학적 관점에서 분석하고, 이를 현대의 의사결정 이론과 연결하여 "도덕적 딜레마 상황에서의 인간 행동 패턴"이라는 주제로 3,000단어 분량의 에세이를 완성함. 이 과정에서 관련 학술 논문 10편 이상을 영문으로 읽고 인용하며, 비판적 독해 능력과 학술적 글쓰기 역량을 크게 신장시킴. 완성된 에세이는 교사의 추천으로 교내 영어 학술지에 게재되었으며, 문학 작품을 단순히 감상하는 것을 넘어 학제간 융합적 사고를 통해 깊이 있는 탐구를 수행하는 자세를 보여줌.`,
    `물리 시간에 '역학적 에너지 보존' 개념을 배운 후, 실생활에서 에너지 손실이 발생하는 원인에 대한 의문을 가지고 자발적으로 심화 탐구를 진행함. 롤러코스터 모형을 직접 제작하고, 출발 높이와 마찰력, 공기 저항을 변화시키며 에너지 전환 효율을 측정하는 실험을 설계함. Arduino 센서를 활용해 속도와 위치 데이터를 실시간으로 수집하고, Excel을 이용해 에너지 손실률을 정량적으로 분석한 결과, 마찰력이 전체 에너지 손실의 약 60%를 차지한다는 결론을 도출함. 이 탐구 과정을 정리하여 과학 탐구 보고서로 작성, 교내 과학전람회에 출품하여 금상을 수상함. 단순 암기식 학습을 넘어 실험 설계, 데이터 수집, 분석, 결론 도출의 전 과정을 주도적으로 수행하며 과학적 탐구 역량과 문제 해결 능력을 입증함.`,
    `한국사 수업에서 고려시대 대몽항쟁을 학습한 후, 당시 민중의 저항 의식이 어떻게 형성되었는지에 대한 궁금증을 가지고 추가 탐구를 진행함. 국립중앙도서관 디지털 아카이브를 활용해 1차 사료인 『고려사』와 『동국이상국집』의 원문을 직접 읽고, 당시 지배층과 피지배층의 관점 차이를 비교 분석함. 특히 삼별초의 항쟁을 중심으로 민중 저항의 역사적 의미를 재조명하고, 이를 현대 민주주의 발전 과정과 연결하여 "저항권의 역사적 전개와 현대적 의의"라는 주제로 15페이지 분량의 심화 보고서를 작성함. 이 과정에서 역사적 사실에 대한 다면적 해석 능력과 비판적 사고력을 함양하였으며, 역사를 단순 암기가 아닌 현재와 연결된 살아있는 학문으로 인식하는 태도를 보여줌.`,
    `생명과학 수업에서 유전자 발현 조절 메커니즘을 학습한 후, CRISPR 유전자 가위 기술의 원리와 윤리적 쟁점에 깊은 관심을 가지고 독자적인 탐구를 수행함. Nature, Science 등 해외 저널의 최신 논문 20편 이상을 읽으며 CRISPR-Cas9 시스템의 작동 원리를 상세히 분석하고, 유전자 치료의 가능성과 함께 배아 유전자 편집의 윤리적 문제를 다각도로 검토함. 특히 중국의 CCR5 유전자 편집 사례를 중심으로 과학 기술의 발전이 사회에 미치는 영향을 철학적, 법적, 의학적 관점에서 종합적으로 분석하여 "유전자 편집 기술의 명암: 과학과 윤리의 경계"라는 주제로 소논문을 작성함. 이 논문은 교내 과학 학술제에서 최우수상을 수상하였으며, 첨단 과학 기술에 대한 깊이 있는 이해와 함께 사회적 책임 의식을 겸비한 미래 과학자로서의 자질을 보여줌.`,
  ],
  autonomy: [
    `학급 환경미화부장으로서 단순한 청소 관리를 넘어 학급 공간을 학생들의 창의성과 소속감을 높이는 공간으로 재구성하는 프로젝트를 주도함. 학급 구성원들의 의견을 수렴하기 위해 설문조사를 실시하고, 그 결과를 바탕으로 '북카페형 휴식 공간' 조성 계획을 수립함. 예산 확보를 위해 학교 측에 제안서를 제출하고, 학생회 및 교사와 협의하여 재활용 가구와 기부받은 책을 활용하는 방안을 마련함. 직접 페인트 작업과 가구 배치를 진행하였으며, 완성된 공간은 학급 구성원들의 큰 호응을 얻어 점심시간과 자습시간에 학생들이 자주 이용하는 명소로 자리잡음. 이 활동을 통해 리더십, 기획력, 실행력을 고루 발휘하였으며, 공동체의 필요를 파악하고 이를 실질적인 변화로 이끌어내는 능력을 보여줌.`,
    `학급 내 소통 부족 문제를 인식하고, '학급 소통 활성화 프로젝트'를 자발적으로 기획하여 실행함. 매주 금요일 종례 시간에 '칭찬 릴레이' 활동을 도입하여 학급 구성원들이 서로의 장점을 발견하고 표현하는 문화를 조성함. 또한 익명으로 고민을 나눌 수 있는 '학급 고민 상자'를 만들어 학급 회의에서 함께 해결 방안을 논의하는 시스템을 구축함. 초기에는 참여가 저조했으나, 지속적인 독려와 솔선수범으로 학급 분위기가 점차 개선되었고, 학기 말 설문조사에서 90% 이상의 학생들이 학급 만족도가 높아졌다고 응답함. 이 과정에서 공감 능력, 끈기, 그리고 공동체를 변화시키는 실천력을 입증함.`,
    `학교 축제 기획위원으로 활동하며 '환경 보호'를 주제로 한 부스를 제안하고 실행함. 플라스틱 사용 줄이기 캠페인의 일환으로 '텀블러 디자인 공모전'과 '재활용 아트 전시회'를 기획하여, 학생들의 자발적 참여를 유도함. 기획 단계에서부터 예산 편성, 홍보 자료 제작, 참가자 모집, 당일 운영까지 전 과정을 체계적으로 관리하였으며, 총 200명 이상의 학생이 참여하는 성공적인 행사로 마무리함. 행사 후 수거한 재활용품으로 제작한 작품들을 교내에 전시하여 환경 보호 메시지를 지속적으로 전달함. 이 활동을 통해 기획력, 조직력, 환경 의식을 동시에 함양하였으며, 실천을 통해 사회적 가치를 확산시키는 리더십을 발휘함.`,
    `학급 임원으로서 학급 내 갈등 조정 역할을 자임하며, 학생들 간의 의견 충돌을 중재하고 합의점을 도출하는 데 주도적인 역할을 수행함. 특히 체육대회 종목 선정 과정에서 학생들 간 의견이 첨예하게 대립하자, 민주적 토론 절차를 제안하여 각 의견의 장단점을 객관적으로 분석하고, 투표를 통해 공정하게 결정하도록 유도함. 이 과정에서 감정적 대립이 아닌 논리적 설득과 타협의 중요성을 강조하였으며, 결과적으로 모든 학생이 수용할 수 있는 결론을 도출함. 이러한 경험을 통해 갈등 해결 능력, 민주적 의사결정 역량, 그리고 공동체 내에서의 조정자 역할을 성공적으로 수행하는 자질을 보여줌.`,
    `학급 도서부장으로서 학급 문고의 활용도가 낮다는 문제를 인식하고, '한 달에 한 권, 함께 읽는 독서 모임'을 기획하여 운영함. 학급 구성원들의 관심사를 조사하여 매월 다양한 장르의 책을 선정하고, 점심시간을 활용해 독서 토론회를 진행함. 초기에는 참여 인원이 5명에 불과했으나, 흥미로운 주제 선정과 자유로운 토론 분위기 조성으로 학기 말에는 20명 이상이 참여하는 활발한 모임으로 성장함. 이 활동은 학급 내 독서 문화를 확산시키는 데 기여하였으며, 자신의 아이디어를 지속적으로 발전시키고 공동체 문화를 변화시키는 실행력과 리더십을 입증함.`,
  ],
  club: [
    `과학탐구동아리 '사이언스 랩'에서 1년간 활동하며, 팀원들과 함께 '미세먼지 저감 장치' 개발 프로젝트를 주도함. 프로젝트 기획 단계에서 문헌 조사를 통해 기존 공기청정기의 한계를 분석하고, 식물의 공기정화 능력과 기계적 필터링을 결합한 하이브리드 시스템을 제안함. 아두이노를 활용해 미세먼지 농도를 실시간으로 측정하는 센서 시스템을 구축하고, 다양한 식물 종을 실험하여 최적의 조합을 도출함. 6개월간의 실험 끝에 기존 대비 30% 향상된 정화 효율을 달성하였고, 이 결과를 정리하여 지역 청소년 과학 경진대회에 출품, 동상을 수상함. 팀 프로젝트에서 기획자이자 실험 설계자로서의 역할을 수행하며 협업 능력, 과학적 탐구 역량, 문제 해결 능력을 고루 발휘함.`,
    `교내 영자신문 동아리 'Global Voice'의 편집장으로서 월 1회 발간되는 영문 신문의 기획, 취재, 편집 전 과정을 총괄함. 단순한 학교 소식 전달을 넘어, 사회 이슈를 다루는 Opinion 섹션을 신설하고, 학생들이 직접 영어로 사설을 작성하여 비판적 사고력과 영어 글쓰기 능력을 향상시키도록 유도함. 특히 '기후 변화와 청소년 행동주의'를 주제로 한 특집 기사를 직접 작성하여 Greta Thunberg의 활동을 분석하고, 우리 학교에서 실천할 수 있는 환경 캠페인을 제안함. 이 기사는 학생들 사이에서 큰 호응을 얻었고, 실제로 교내 '플라스틱 프리 챌린지'로 이어짐. 저널리즘에 대한 열정과 함께 사회 문제에 대한 관심, 리더십, 실행력을 입증함.`,
    `로봇공학 동아리 'Robo Tech'에서 팀장을 맡아 'FLL(First Lego League) 로봇 대회' 준비를 주도함. 대회 미션 분석부터 로봇 설계, 프로그래밍, 프레젠테이션 준비까지 전 과정을 체계적으로 계획하고 팀원들과 역할을 분담함. 특히 로봇의 자율주행 알고리즘 개발에 집중하여, Python과 EV3 소프트웨어를 활용해 장애물 회피 및 목표 지점 도달의 정확도를 95% 이상으로 향상시킴. 대회 당일 예상치 못한 기술적 문제가 발생했으나, 신속한 디버깅과 팀원들과의 긴밀한 협력으로 이를 해결하여 지역 예선에서 2위를 기록함. 이 경험을 통해 기술적 문제 해결 능력뿐만 아니라, 위기 상황에서의 침착함과 팀워크의 중요성을 체득함.`,
    `토론 동아리 '디베이트 클럽'에서 2년간 활동하며, 총 15회의 교내외 토론 대회에 참가하여 논리적 사고력과 설득 능력을 꾸준히 연마함. 특히 '인공지능의 윤리적 사용'을 주제로 한 전국 고등학생 토론대회에서 찬성 측 입론자로 참가하여, AI 기술의 긍정적 영향을 구체적 사례와 통계 자료를 통해 논리정연하게 제시함. 준비 과정에서 관련 논문 30편 이상을 분석하고, 예상 반박 논리에 대한 대응 전략을 세밀하게 수립함. 대회에서 심사위원들로부터 "논리의 정합성과 근거 제시가 탁월하다"는 평가를 받으며 우수상을 수상함. 이를 통해 비판적 사고, 자료 분석 능력, 설득적 커뮤니케이션 역량을 고도화함.`,
    `봉사 동아리 '나눔의 손길'에서 기획부원으로 활동하며, 지역 아동센터와 연계한 '재능 기부 프로그램'을 제안하고 실행함. 동아리 부원들의 재능을 조사하여 미술, 음악, 코딩 등 5개 분야의 수업을 개설하고, 매주 토요일 오전 2시간씩 초등학생들을 대상으로 교육 봉사를 진행함. 본인은 코딩 교육을 담당하여 Scratch를 활용한 게임 제작 수업을 진행하였고, 아이들의 눈높이에 맞춘 설명과 격려로 수업 만족도 조사에서 95%의 긍정 응답을 받음. 6개월간 총 60시간의 봉사를 수행하며 교육 재능 기부의 의미를 체득하고, 사회적 약자에 대한 공감 능력과 책임 의식을 함양함.`,
  ],
  career: [
    `학교에서 주관한 '의료 인공지능 진로 특강'에 참석하여 AI 기술이 의료 진단과 치료에 어떻게 활용되는지에 대한 강의를 듣고 깊은 감명을 받음. 특강 이후 이 분야에 대한 관심이 높아져, 스스로 'AI 기반 의료 영상 분석'을 주제로 추가 조사를 진행함. 해외 논문과 기사를 통해 구글의 DeepMind가 개발한 안과 질환 진단 AI, IBM Watson의 암 진단 시스템 등을 분석하고, 이러한 기술이 의료 접근성을 향상시키는 데 기여할 수 있다는 점에 주목함. 이를 바탕으로 "AI와 의학의 융합: 미래 의료의 방향"이라는 주제로 진로 탐색 보고서를 작성하였고, 의료 인공지능 전문가라는 구체적인 진로 목표를 설정함. 이 과정에서 학제간 융합 사고와 자기주도적 진로 탐색 역량을 키움.`,
    `대학 연구실 체험 프로그램에 지원하여 환경공학과 연구실에서 1주일간 인턴 활동을 수행함. 수질 오염 측정 실험에 참여하여 분광광도계를 이용한 COD 측정, pH 분석 등의 실험 과정을 직접 체험하고, 연구 데이터를 정리하는 업무를 담당함. 연구실 대학원생과의 면담을 통해 환경공학자가 되기 위한 학업 경로와 필요 역량을 구체적으로 파악하였고, 실제 연구 현장에서 이론이 어떻게 적용되는지 체감함. 특히 실험 과정에서 발생하는 예상치 못한 변수들을 해결하는 과정을 관찰하며, 과학 연구의 엄밀성과 끈기의 중요성을 깨달음. 이 경험은 환경 분야 진로에 대한 확신을 더욱 굳히는 계기가 되었으며, 진로 선택의 구체성을 높임.`,
    `직업 체험 주간에 지역 스타트업 기업 'Tech Innovators'에서 3일간 소프트웨어 개발자 직무를 체험함. 실제 개발팀 회의에 참관하여 애자일 방법론에 기반한 스프린트 계획 수립 과정을 관찰하고, 간단한 웹페이지 UI 개선 작업을 멘토 개발자의 지도 하에 수행함. HTML, CSS, JavaScript를 활용해 버튼 디자인과 레이아웃을 수정하는 작업을 완료하였고, 이를 통해 실무에서의 코딩이 단순히 기능 구현을 넘어 사용자 경험(UX)을 고려한 설계임을 체감함. 멘토와의 심층 면담을 통해 개발자에게 요구되는 문제 해결 능력, 협업 능력, 지속적 학습 태도의 중요성을 인식하였고, 소프트웨어 엔지니어로서의 진로 목표를 구체화함.`,
    `'글로벌 리더 아카데미' 진로 캠프에 참가하여 국제기구 활동가를 꿈으로 삼게 됨. 2박 3일간 진행된 캠프에서 UN 난민기구(UNHCR) 출신 강사의 특강을 듣고, 국제 난민 문제와 인도적 지원 활동에 대한 깊은 관심을 갖게 됨. 모의 국제회의 활동에서 한국 대표로 참여하여 난민 지원 정책을 영어로 발표하고, 타국 대표들과 협상하며 합의안을 도출하는 과정을 체험함. 이 경험을 통해 국제 사회 문제에 대한 폭넓은 이해와 다문화 소통 능력의 중요성을 깨달았으며, 향후 국제 관계학과 진학을 목표로 설정함. 진로 탐색 보고서에 이 경험을 상세히 기록하며 국제기구 활동가가 되기 위한 구체적인 로드맵을 작성함.`,
    `학교 진로 멘토링 프로그램을 통해 현직 데이터 사이언티스트와 1:1 멘토링을 3개월간 진행함. 멘토로부터 데이터 분석의 실무 프로세스, 사용 도구(Python, SQL, Tableau), 그리고 업계 트렌드에 대한 구체적인 조언을 받음. 멘토의 추천으로 'Kaggle' 플랫폼에서 초보자용 데이터 분석 프로젝트에 도전하여, 타이타닉 생존자 예측 모델을 구축하는 과정을 완료함. 비록 순위는 낮았으나, 실제 데이터를 다루며 전처리, 모델링, 평가의 전 과정을 체험하고, 데이터 사이언티스트라는 직업에 대한 구체적인 이해를 얻음. 이 경험을 통해 진로 목표를 명확히 하고, 대학에서 통계학 및 컴퓨터공학을 복수전공하겠다는 구체적인 학업 계획을 수립함.`,
  ],
  behavior: [
    `학급 내에서 항상 긍정적인 태도로 구성원들과 소통하며, 어려움을 겪는 친구들에게 먼저 다가가 도움을 제공하는 이타적인 모습을 보임. 특히 수학 과목에서 어려움을 겪는 친구에게 자발적으로 방과 후 보충 설명을 제공하여, 해당 학생이 중간고사에서 이전 대비 20점 향상된 성적을 받는 데 기여함. 또한 학급 행사 준비 과정에서 의견 충돌이 발생했을 때, 양측의 입장을 경청하고 합리적인 절충안을 제시하여 갈등을 원만히 해결하는 조정자 역할을 수행함. 책임감이 강하고, 맡은 바 임무를 끝까지 완수하려는 자세가 뚜렷하며, 공동체 의식과 배려심이 돋보이는 학생임.`,
    `학급 임원으로서 솔선수범하는 태도로 학급 구성원들에게 긍정적인 영향을 미침. 청소 당번을 빠뜨리지 않고 성실히 수행할 뿐 아니라, 다른 학생들이 놓친 부분까지 자발적으로 챙기는 모습을 보임. 수업 시간에는 집중력 있게 참여하며, 모둠 활동에서 적극적으로 의견을 제시하고 팀원들의 의견을 존중하며 조율하는 협력적 태도를 보임. 또한 학교 규칙을 준수하는 것은 물론, 후배들에게 모범이 되는 행동을 지속적으로 실천함. 성실성, 책임감, 리더십을 고루 갖춘 학생으로, 주변 사람들과의 관계에서도 신뢰를 쌓아가는 성숙한 인성을 지님.`,
    `새로운 환경과 사람들에게 적응하는 능력이 뛰어나며, 학급 내 다양한 성향의 친구들과 원만한 관계를 유지함. 특히 전학 온 학생이 학급에 적응하는 데 어려움을 겪자, 먼저 다가가 학교 생활 전반에 대한 안내를 제공하고, 친구들에게 소개하여 빠르게 적응할 수 있도록 도움. 이러한 배려심과 포용력은 학급 분위기를 화목하게 만드는 데 크게 기여함. 또한 학급 회의에서 소극적인 친구들의 의견도 경청하고 반영하려는 민주적 태도를 보이며, 갈등 상황에서는 감정적으로 대응하지 않고 이성적으로 해결책을 모색하는 성숙함을 지님. 공감 능력과 사회성이 뛰어난 학생임.`,
    `자기 주도적 학습 태도가 확립되어 있으며, 목표를 설정하고 이를 달성하기 위해 꾸준히 노력하는 끈기 있는 모습을 보임. 학기 초 자신의 약점이었던 영어 듣기 능력을 향상시키기 위해 매일 30분씩 CNN 뉴스를 시청하며 받아쓰기 연습을 하는 등 구체적인 학습 전략을 수립하고 실행함. 그 결과 학기 말 영어 듣기 평가에서 만점을 기록하는 성과를 거둠. 또한 실패나 좌절 상황에서도 쉽게 포기하지 않고, 원인을 분석하여 개선 방안을 찾는 회복탄력성이 높음. 성실하고 책임감 있는 태도로 학업과 학급 활동에 임하며, 자기 성장을 위해 지속적으로 노력하는 자세가 돋보임.`,
    `학급 내외에서 정직하고 원칙을 지키는 태도로 신뢰를 받음. 시험 중 부정행위 유혹에도 흔들리지 않고, 공정한 경쟁을 중시하는 윤리 의식을 지님. 학급 회의에서도 자신의 이익보다 학급 전체의 이익을 우선하는 공동체 의식이 뚜렷하며, 불합리한 상황에 대해서는 용기 있게 문제를 제기하고 개선을 요구하는 비판적 사고력을 보임. 또한 환경 보호에 대한 관심이 높아, 개인 텀블러 사용을 실천하고 분리수거를 철저히 하는 등 일상에서 작은 실천을 지속함. 도덕적 판단력과 사회적 책임 의식을 겸비한 학생으로, 바른 인성을 지닌 모범적인 태도를 보임.`,
  ],
};

class SchoolRecordService {
  /**
   * GenerateDraft - 가장 핵심적인 LLM 호출 기능
   * 퓨샷 샘플과 사용자 입력을 결합하여 교사 관점의 생기부 초안 생성
   */
  async generateDraft(
    basicInfo: BasicInfo,
    activityDetails: ActivityDetails,
    emphasisKeywords: string[]
  ): Promise<DraftResult> {
    console.log('[SchoolRecordService] generateDraft 호출됨:', {
      basicInfo,
      activityDetails,
      emphasisKeywords
    });

    const { sectionType, grade, semester, subject } = basicInfo;

    // 해당 항목의 퓨샷 샘플 로드
    const fewShotSamples = FEW_SHOT_SAMPLES[sectionType];

    // 활동 세부사항을 텍스트로 변환
    const activityText = this.formatActivityDetails(sectionType, activityDetails);

    console.log('[SchoolRecordService] 포맷된 활동 텍스트:', activityText);

    const systemPrompt = `당신은 고등학교 교사입니다. 학생의 여러 활동을 관찰한 내용을 바탕으로 생활기록부 [${this.getSectionName(sectionType)}]을 작성합니다.

**GPT Killer 회피를 위한 필수 작성 원칙**:

1. **문장 구조 다양화 (가장 중요)**:
   - 짧은 문장(10-20자)과 긴 문장(50-80자)을 불규칙하게 섞어 사용
   - 문장 호흡을 의도적으로 불규칙하게 배치
   - 동일한 구조의 문장 연속 사용 금지

2. **종결어미 변화 (AI 탐지 핵심 회피)**:
   - "~함", "~였음", "~됨", "~바탕으로", "~며", "~고", "~되어", "~보임" 등을 무작위로 섞어 사용
   - 절대 금지: "~를 통해", "~함양함", "~입증함", "~드러냄", "~보여줌" (GPT 특유 표현)
   - 같은 종결어미 2회 연속 사용 금지

3. **어휘 선택의 자연스러움**:
   - 추상적 역량 단어 최소화: "역량", "능력", "자질", "소양" 등 직접 언급 금지
   - 구체적 행동 동사 사용: "조사함", "분석함", "발표함", "작성함", "참여함"
   - 동일 의미 반복 시 동의어로 자연스럽게 변형

4. **서사 구조의 비정형성**:
   - 서론-본론-결론 구조 절대 금지
   - 활동을 시간순이 아닌 중요도나 인과관계로 배치
   - 문단 중간에 갑작스러운 전환 허용 (실제 교사 작성 방식)

5. **구체성과 정량화**:
   - 모든 활동에 구체적 기간 명시 (예: 2020.08.31.-2020.12.24.)
   - 숫자와 데이터 활용 (예: 17시간, 200명, 80점 이상)
   - 고유명사 사용 (책 제목, 프로그램명, 기관명)

6. **자연스러운 연결**:
   - 활동 간 연결을 명시적 연결어 없이 암시적으로 처리
   - "또한", "그리고", "따라서" 등 논리적 연결어 최소화
   - 문맥으로 자연스럽게 흐름 형성

7. **글자 수 준수**:
   - 교과/자율/동아리: 500자 이내
   - 진로: 700자 이내
   - 행특: 500자 이내

**CRITICAL: 아래 예시들의 문체를 정확히 분석하고 모방하세요. 내용은 다르되, 문장 구조, 어휘 선택, 종결어미 패턴을 그대로 따라야 합니다.**

--- 예시 1 ---
${fewShotSamples[0]}

--- 예시 2 ---
${fewShotSamples[1]}

--- 예시 3 ---
${fewShotSamples[2]}

--- 예시 4 ---
${fewShotSamples[3]}

--- 예시 5 ---
${fewShotSamples[4]}
---

**위 예시들의 공통점을 파악하고, 동일한 스타일로 작성해야 합니다.**
`;

    const userPrompt = `
**학생 정보**:
- 학년/학기: ${grade}학년 ${semester}학기
${subject ? `- 과목: ${subject}` : ''}

**활동 정보**:
${activityText}

${emphasisKeywords.length > 0 ? `**강조 키워드** (자연스럽게 포함, 직접 언급 금지): ${emphasisKeywords.join(', ')}` : ''}

**작성 지침 (반드시 준수)**:
1. 위 5개 예시의 **종결어미 패턴**을 그대로 모방하세요 ("~함", "~였으며", "~됨", "~보임" 등)
2. 짧은 문장과 긴 문장을 불규칙하게 섞으세요
3. "~를 통해", "~함양함", "~드러냄" 등 GPT 특유 표현 절대 사용 금지
4. 구체적 날짜, 숫자, 고유명사를 반드시 포함하세요
5. 추상적 역량 단어 대신 구체적 행동을 서술하세요

**위 예시들의 문체를 정확히 분석하고, 동일한 스타일로 작성하세요. 내용만 다르게 하되, 문장 구조와 어휘 선택 패턴은 예시와 동일해야 합니다.**
`;

    try {
      const response = await openai.chat.completions.create({
        model: REACT_APP_OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const draftText = response.choices[0].message.content || '';

      // 품질 점수 계산 (별도 호출)
      const qualityScore = await this.calculateQualityScore(draftText, fewShotSamples);

      // 추천 키워드 생성 (별도 호출)
      const recommendedKeywords = await this.recommendKeywords(activityDetails);

      return {
        draftText,
        qualityScore,
        recommendedKeywords,
        fewShotSamples,
      };
    } catch (error) {
      console.error('Draft generation error:', error);
      throw new Error('초안 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * DraftStyleCheck - 생성된 초안의 품질 점수 계산 (0-100)
   */
  async calculateQualityScore(draftText: string, fewShotSamples: string[]): Promise<number> {
    const systemPrompt = `당신은 생활기록부 작성 품질을 평가하는 전문가입니다.
아래 5개의 우수 샘플과 비교하여, 생성된 초안이 다음 기준을 얼마나 잘 따랐는지 0-100점으로 평가하세요.

**평가 기준**:
1. 교사 관찰 시점의 3인칭 서술 준수 (20점)
2. 구체성 (추상적 표현이 아닌 구체적 사실 서술) (20점)
3. 전문적이고 격식 있는 문체 (20점)
4. 논리적 흐름 (배경-과정-결과-성장) (20점)
5. 샘플과의 문체 유사성 (20점)

**우수 샘플**:
${fewShotSamples.map((sample, i) => `${i + 1}. ${sample}`).join('\n\n')}

평가할 초안:
"${draftText}"

**JSON 형식으로만 답변하세요**:
{
  "score": 85,
  "feedback": "간단한 피드백"
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: REACT_APP_OPENAI_MODEL,
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: 300,
        temperature: 0.3,
      });

      const result = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(result);
      return parsed.score || 75;
    } catch (error) {
      console.error('Quality score calculation error:', error);
      return 75; // 기본 점수
    }
  }

  /**
   * RecommendKeywords - 활동 내용 기반 추천 키워드 생성
   */
  async recommendKeywords(activityDetails: ActivityDetails): Promise<string[]> {
    const activityText = JSON.stringify(activityDetails);
    const systemPrompt = `학생의 활동 내용을 분석하여, 생기부에 추가로 강조하면 좋을 역량 키워드 3-5개를 추천하세요.
예: 비판적 사고력, 협업 능력, 자기주도적 학습, 창의적 문제 해결, 리더십 등

활동 내용:
${activityText}

**JSON 배열 형식으로만 답변하세요**:
["키워드1", "키워드2", "키워드3"]
`;

    try {
      const response = await openai.chat.completions.create({
        model: REACT_APP_OPENAI_MODEL,
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: 200,
        temperature: 0.5,
      });

      const result = response.choices[0].message.content || '[]';
      const cleaned = result.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Keyword recommendation error:', error);
      return [];
    }
  }

  /**
   * RegenerateDraft - 사용자 피드백 반영한 재생성
   */
  async regenerateDraft(
    basicInfo: BasicInfo,
    activityDetails: ActivityDetails,
    emphasisKeywords: string[],
    originalDraft: string,
    userFeedback: string
  ): Promise<DraftResult> {
    const { sectionType } = basicInfo;
    const fewShotSamples = FEW_SHOT_SAMPLES[sectionType];
    const activityText = this.formatActivityDetails(sectionType, activityDetails);

    const systemPrompt = `당신은 고등학교 교사입니다. 기존에 작성한 생활기록부 초안을 사용자 피드백에 따라 수정합니다.

**원본 초안**:
"${originalDraft}"

**사용자 피드백**:
"${userFeedback}"

위 피드백을 반영하여 초안을 수정하되, 여전히 아래 우수 샘플의 문체와 구조를 유지하세요.

**우수 샘플**:
${fewShotSamples.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}
`;

    const userPrompt = `
**활동 정보**:
${activityText}

**강조 키워드**: ${emphasisKeywords.join(', ')}

사용자 피드백을 반영하여 수정된 초안을 작성하세요.
`;

    try {
      const response = await openai.chat.completions.create({
        model: REACT_APP_OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const draftText = response.choices[0].message.content || '';
      const qualityScore = await this.calculateQualityScore(draftText, fewShotSamples);

      return {
        draftText,
        qualityScore,
        fewShotSamples,
      };
    } catch (error) {
      console.error('Regenerate draft error:', error);
      throw new Error('재작성 중 오류가 발생했습니다.');
    }
  }

  /**
   * AnalyzeInputForClarity - 입력 내용의 명확성 검증
   */
  analyzeInputForClarity(activityDetails: ActivityDetails): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const text = JSON.stringify(activityDetails);

    // 간단한 규칙 기반 검증
    if (text.length < 50) {
      warnings.push('입력 내용이 너무 짧습니다. 더 구체적으로 작성해주세요.');
    }

    const vagueWords = ['열심히', '노력', '잘', '많이'];
    const hasVague = vagueWords.some((word) => text.includes(word));
    if (hasVague) {
      warnings.push('추상적 표현보다 구체적인 사실을 서술해주세요.');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }

  /**
   * FinalComplianceCheck - 최종 텍스트 규정 검증
   */
  finalComplianceCheck(finalText: string): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // 금지 키워드 검사
    const forbiddenKeywords = [
      '수상',
      '상장',
      '1등',
      '금상',
      '은상',
      '동상',
      '대상',
      '최우수상',
      '우수상',
      '자율동아리',
    ];

    forbiddenKeywords.forEach((keyword) => {
      if (finalText.includes(keyword)) {
        violations.push(`"${keyword}"는 생기부에 기재할 수 없습니다.`);
      }
    });

    // 부적절한 표현 검사
    if (finalText.includes('최고') || finalText.includes('최상')) {
      violations.push('과도한 수식어는 지양해야 합니다.');
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  // ===== Helper Functions =====

  private formatActivityDetails(sectionType: SectionType, details: ActivityDetails): string {
    switch (sectionType) {
      case 'subject':
        const subj = details as SubjectActivity;
        const subjActivities = subj.activities
          .map((activity, index) => {
            let text = `\n[활동 ${index + 1}]`;
            if (activity.period) text += `\n- 기간: ${activity.period}`;
            text += `\n- 내용: ${activity.content}`;
            return text;
          })
          .join('\n');
        return `과목: ${subj.subject}
최종 글자수: ${subj.maxCharacters}자로 통합 필요
${subjActivities}

**AI 작성 지침**: 위 ${subj.activities.length}개 활동을 ${subj.maxCharacters}자 이내로 통합하여 하나의 자연스러운 문단으로 작성할 것.`;

      case 'autonomy':
        const auto = details as AutonomyActivity;
        const autoActivities = auto.activities
          .map((activity, index) => {
            let text = `\n[활동 ${index + 1}]`;
            if (activity.period) text += `\n- 기간: ${activity.period}`;
            text += `\n- 내용: ${activity.content}`;
            return text;
          })
          .join('\n');
        return `최종 글자수: ${auto.maxCharacters}자로 통합 필요
${autoActivities}

**AI 작성 지침**: 위 ${auto.activities.length}개 활동을 ${auto.maxCharacters}자 이내로 통합하여 하나의 자연스러운 문단으로 작성할 것.`;

      case 'club':
        const club = details as ClubActivity;
        const clubActivities = club.activities
          .map((activity, index) => {
            let text = `\n[활동 ${index + 1}]`;
            if (activity.period) text += `\n- 기간: ${activity.period}`;
            text += `\n- 내용: ${activity.content}`;
            return text;
          })
          .join('\n');
        return `동아리명: ${club.clubName}
최종 글자수: ${club.maxCharacters}자로 통합 필요
${clubActivities}

**AI 작성 지침**: 위 ${club.activities.length}개 활동을 ${club.maxCharacters}자 이내로 통합하여 하나의 자연스러운 문단으로 작성할 것.`;

      case 'career':
        const career = details as CareerActivity;
        const careerActivities = career.activities
          .map((activity, index) => {
            let text = `\n[활동 ${index + 1}]`;
            if (activity.period) text += `\n- 기간: ${activity.period}`;
            text += `\n- 내용: ${activity.content}`;
            return text;
          })
          .join('\n');
        return `최종 글자수: ${career.maxCharacters}자로 통합 필요
${careerActivities}

**AI 작성 지침**: 위 ${career.activities.length}개 활동을 ${career.maxCharacters}자 이내로 통합하여 하나의 자연스러운 문단으로 작성할 것.`;

      case 'behavior':
        const behav = details as BehaviorActivity;
        const behavActivities = behav.activities
          .map((activity, index) => {
            let text = `\n[관찰 사항 ${index + 1}]`;
            if (activity.period) text += `\n- 시기: ${activity.period}`;
            text += `\n- 내용: ${activity.content}`;
            return text;
          })
          .join('\n');
        return `최종 글자수: ${behav.maxCharacters}자로 통합 필요
${behavActivities}

**AI 작성 지침**: 위 ${behav.activities.length}개 관찰 내용을 ${behav.maxCharacters}자 이내로 통합하여 하나의 자연스러운 문단으로 작성할 것.`;

      default:
        return JSON.stringify(details);
    }
  }

  private getSectionName(sectionType: SectionType): string {
    const nameMap: Record<SectionType, string> = {
      subject: '과목 세부능력 및 특기사항',
      autonomy: '자율활동',
      club: '동아리활동',
      service: '봉사활동',
      career: '진로활동',
      behavior: '행동특성 및 종합의견',
    };
    return nameMap[sectionType];
  }

  /**
   * LoadFewShotSamples - 퓨샷 샘플 로드
   */
  loadFewShotSamples(sectionType: SectionType): string[] {
    return FEW_SHOT_SAMPLES[sectionType];
  }
}

export const schoolRecordService = new SchoolRecordService();
