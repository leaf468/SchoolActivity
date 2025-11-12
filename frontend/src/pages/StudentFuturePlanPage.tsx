/**
 * 학생용 미래 설계 페이지
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { FuturePlanningService } from '../services/futurePlanningService';
import { FuturePlan } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const StudentFuturePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentInfo, allRecords } = useSchoolActivity();
  const [loading, setLoading] = useState(false);
  const [futurePlan, setFuturePlan] = useState<FuturePlan | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'interview'>('roadmap');

  // 폼 상태
  const [dreamUniversity, setDreamUniversity] = useState('');
  const [dreamMajor, setDreamMajor] = useState('');
  const [dreamCareer, setDreamCareer] = useState('');

  // 미래 계획 생성
  const handleGeneratePlan = async () => {
    if (!studentInfo) {
      setError('학생 정보가 없습니다.');
      return;
    }

    if (!dreamUniversity || !dreamMajor || !dreamCareer) {
      setError('모든 목표를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await FuturePlanningService.generateFuturePlan(
        studentInfo,
        allRecords,
        dreamUniversity,
        dreamMajor,
        dreamCareer
      );

      if (result) {
        setFuturePlan(result);
      } else {
        setError('계획을 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('계획 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">미래 설계 로드맵</h1>
          <p className="text-gray-600">
            고등학교부터 대학, 졸업 후까지의 구체적인 진로 로드맵과 면접 대비를 준비하세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 목표 입력 폼 */}
        {!futurePlan && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">나의 목표 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 대학</label>
                <input
                  type="text"
                  value={dreamUniversity}
                  onChange={e => setDreamUniversity(e.target.value)}
                  placeholder="예: 서울대학교, 연세대학교"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 전공</label>
                <input
                  type="text"
                  value={dreamMajor}
                  onChange={e => setDreamMajor(e.target.value)}
                  placeholder="예: 경영학과, 컴퓨터공학과"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최종 진로</label>
                <input
                  type="text"
                  value={dreamCareer}
                  onChange={e => setDreamCareer(e.target.value)}
                  placeholder="예: 경영 컨설턴트, 소프트웨어 엔지니어"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleGeneratePlan}
                disabled={loading || !studentInfo || !dreamUniversity || !dreamMajor || !dreamCareer}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '로드맵 생성 중...' : '미래 로드맵 생성'}
              </button>
            </div>
          </div>
        )}

        {/* 미래 계획 결과 */}
        {futurePlan && (
          <div className="space-y-6">
            {/* 목표 요약 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">나의 목표</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">목표 대학</p>
                  <p className="text-xl font-semibold">{futurePlan.goals.dreamUniversity}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">목표 전공</p>
                  <p className="text-xl font-semibold">{futurePlan.goals.dreamMajor}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">최종 진로</p>
                  <p className="text-xl font-semibold">{futurePlan.goals.dreamCareer}</p>
                </div>
              </div>
            </div>

            {/* 탭 메뉴 */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex-1 px-6 py-3 font-medium transition ${
                    activeTab === 'roadmap'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  진로 로드맵
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`flex-1 px-6 py-3 font-medium transition ${
                    activeTab === 'interview'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  면접 대비
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'roadmap' ? (
                  <div className="space-y-8">
                    {/* 고등학교 로드맵 */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">고등학교 로드맵</h3>
                      <div className="space-y-4">
                        {Object.entries(futurePlan.roadmap.highSchool).map(([grade, stage]) => (
                          <div key={grade} className="border-l-4 border-blue-400 pl-4">
                            <h4 className="font-semibold text-lg text-gray-800 mb-2">{stage.period}</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">목표</p>
                                <ul className="space-y-1">
                                  {stage.goals.map((goal, idx) => (
                                    <li key={idx} className="text-gray-600">• {goal}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">주요 활동</p>
                                <ul className="space-y-1">
                                  {stage.activities.map((activity, idx) => (
                                    <li key={idx} className="text-gray-600">• {activity}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">마일스톤</p>
                                <ul className="space-y-1">
                                  {stage.milestones.map((milestone, idx) => (
                                    <li key={idx} className="text-gray-600">• {milestone}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">개발할 역량</p>
                                <ul className="space-y-1">
                                  {stage.skillsToDevelop.map((skill, idx) => (
                                    <li key={idx} className="text-gray-600">• {skill}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 대학교 로드맵 */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">대학교 로드맵</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(futurePlan.roadmap.university).map(([year, stage]) => (
                          <div key={year} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">{stage.period}</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">목표: </span>
                                <span className="text-gray-600">{stage.goals.join(', ')}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">활동: </span>
                                <span className="text-gray-600">{stage.activities.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 졸업 후 계획 */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">졸업 후 계획</h3>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="font-medium text-green-900 mb-1">단기 (졸업 직후~3년)</p>
                          <p className="text-green-800 text-sm">{futurePlan.roadmap.postGraduation.shortTerm}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="font-medium text-yellow-900 mb-1">중기 (3~7년)</p>
                          <p className="text-yellow-800 text-sm">{futurePlan.roadmap.postGraduation.midTerm}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="font-medium text-purple-900 mb-1">장기 (7년 이후)</p>
                          <p className="text-purple-800 text-sm">{futurePlan.roadmap.postGraduation.longTerm}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 일관된 서사 */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">나의 일관된 스토리</h3>
                      <p className="text-blue-800 mb-4">{futurePlan.interviewPrep.narrativeTheme}</p>
                      <div>
                        <p className="font-medium text-blue-900 mb-2">핵심 메시지</p>
                        <ul className="space-y-1">
                          {futurePlan.interviewPrep.keyMessages.map((msg, idx) => (
                            <li key={idx} className="text-blue-700 text-sm">• {msg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 예상 면접 질문 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">예상 면접 질문 및 답변</h3>
                      <div className="space-y-4">
                        {futurePlan.interviewPrep.expectedQuestions.map((qa, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                Q{idx + 1}
                              </span>
                              <p className="font-medium text-gray-900">{qa.question}</p>
                            </div>
                            <div className="ml-11 space-y-2">
                              <div className="bg-gray-50 rounded p-3">
                                <p className="text-gray-700 text-sm">{qa.suggestedAnswer}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">관련 생기부 활동:</p>
                                <div className="flex flex-wrap gap-1">
                                  {qa.relatedActivities.map((activity, aIdx) => (
                                    <span key={aIdx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setFuturePlan(null);
                  setDreamUniversity('');
                  setDreamMajor('');
                  setDreamCareer('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                다시 설정하기
              </button>
              <button
                onClick={() => navigate('/final')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                생기부 작성 계속하기
              </button>
            </div>
          </div>
        )}
      </main>

      <CommonFooter />
    </div>
  );
};

export default StudentFuturePlanPage;