/**
 * 학생용 다음 학기 활동 추천 페이지
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { ActivityRecommendationService } from '../services/activityRecommendationService';
import { ActivityRecommendation, SECTION_NAMES } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const StudentActivityRecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentInfo, allRecords } = useSchoolActivity();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<ActivityRecommendation | null>(null);
  const [error, setError] = useState<string>('');

  // 폼 상태
  const [targetGrade, setTargetGrade] = useState<1 | 2 | 3>(
    (studentInfo?.grade as 1 | 2 | 3) || 1
  );
  const [targetSemester, setTargetSemester] = useState<'1' | '2'>('1');

  // 추천 생성
  const handleGenerateRecommendation = async () => {
    if (!studentInfo) {
      setError('학생 정보가 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ActivityRecommendationService.generateRecommendations(
        studentInfo,
        allRecords,
        targetGrade,
        targetSemester
      );

      if (result) {
        setRecommendation(result);
      } else {
        setError('추천을 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('추천 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 난이도 표시
  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return '★'.repeat(count) + '☆'.repeat(3 - count);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">다음 학기 활동 추천</h1>
          <p className="text-gray-600">
            합격자 데이터를 기반으로 다음 학기에 수행하면 좋을 활동들을 추천해드립니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 추천 설정 폼 */}
        {!recommendation && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">추천 받을 학기 선택</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">학년</label>
                <select
                  value={targetGrade}
                  onChange={e => setTargetGrade(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">학기</label>
                <select
                  value={targetSemester}
                  onChange={e => setTargetSemester(e.target.value as '1' | '2')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1학기</option>
                  <option value="2">2학기</option>
                </select>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleGenerateRecommendation}
                disabled={loading || !studentInfo}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '추천 생성 중...' : '활동 추천 받기'}
              </button>
            </div>
          </div>
        )}

        {/* 추천 결과 */}
        {recommendation && (
          <div className="space-y-6">
            {/* 추천 이유 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">추천 이유</h2>
              <p className="text-blue-800">{recommendation.rationale}</p>
            </div>

            {/* 추천 활동 목록 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                추천 활동 ({recommendation.recommendations.length}개)
              </h2>
              <div className="space-y-4">
                {recommendation.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                              rec.priority
                            )}`}
                          >
                            {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {SECTION_NAMES[rec.sectionType as keyof typeof SECTION_NAMES]}
                            {rec.subject && ` - ${rec.subject}`}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{rec.activityTitle}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 text-lg">{getDifficultyStars(rec.difficulty)}</div>
                        <div className="text-xs text-gray-500">난이도</div>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-700 mb-3">{rec.activityDescription}</p>

                    {/* 기대 효과 */}
                    <div className="bg-green-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-green-900 mb-1">기대 효과</p>
                      <p className="text-sm text-green-800">{rec.expectedOutcome}</p>
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                      <span>
                        {rec.estimatedTimeWeeks && `예상 소요: ${rec.estimatedTimeWeeks}주`}
                      </span>
                      <span>참고 합격자: {rec.relatedAdmissions.length}명</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRecommendation(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                다른 학기 추천 받기
              </button>
              <button
                onClick={() => navigate('/input')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                활동 입력하러 가기
              </button>
            </div>
          </div>
        )}
      </main>

      <CommonFooter />
    </div>
  );
};

export default StudentActivityRecommendationPage;
