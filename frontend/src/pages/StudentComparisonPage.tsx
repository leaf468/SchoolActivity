/**
 * 학생용 합격자 생기부 비교 페이지
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolActivity } from '../contexts/SchoolActivityContext';
import { ComparisonService } from '../services/comparisonService';
import { ComparisonResult } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

const StudentComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentInfo, allRecords } = useSchoolActivity();
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string>('');

  // 비교 분석 실행
  const handleCompare = async () => {
    if (!studentInfo) {
      setError('학생 정보가 없습니다. 기본 정보를 먼저 입력해주세요.');
      return;
    }

    if (allRecords.length === 0) {
      setError('비교할 생기부가 없습니다. 활동을 먼저 작성해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ComparisonService.compareWithAdmissions(studentInfo, allRecords);
      if (result) {
        setComparisonResult(result);
      } else {
        setError('비교 결과를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('비교 중 오류가 발생했습니다.');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">합격자 생기부 비교 분석</h1>
          <p className="text-gray-600">
            내 생기부를 같은 계열 합격자들과 비교하여 강점과 개선점을 파악하세요.
          </p>
        </div>

        {/* 학생 정보 카드 */}
        {studentInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">내 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">이름:</span>
                <span className="ml-2 font-medium">{studentInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-500">학년:</span>
                <span className="ml-2 font-medium">{studentInfo.grade}학년</span>
              </div>
              <div>
                <span className="text-gray-500">희망 전공:</span>
                <span className="ml-2 font-medium">{studentInfo.desiredMajor}</span>
              </div>
              <div>
                <span className="text-gray-500">계열:</span>
                <span className="ml-2 font-medium">{studentInfo.track}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 text-sm">작성한 생기부:</span>
              <span className="ml-2 font-medium text-blue-600">{allRecords.length}개</span>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 비교 시작 버튼 */}
        {!comparisonResult && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">합격자 생기부와 비교해보세요</h3>
            <p className="text-gray-600 mb-6">
              AI가 같은 계열 합격자들의 생기부를 분석하여 나의 강점과 보완점을 알려드립니다.
            </p>
            <button
              onClick={handleCompare}
              disabled={loading || !studentInfo || allRecords.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '분석 중...' : '비교 분석 시작'}
            </button>
          </div>
        )}

        {/* 비교 결과 */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* 경쟁력 점수 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">전체 경쟁력 평가</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${comparisonResult.competitivenessScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {comparisonResult.competitivenessScore}점
                </div>
              </div>
              <p className="text-gray-700">{comparisonResult.overallAssessment}</p>
            </div>

            {/* 강점 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-500">✓</span> 나의 강점
              </h2>
              <ul className="space-y-2">
                {comparisonResult.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 개선점 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-500">!</span> 보완이 필요한 부분
              </h2>
              <div className="space-y-4">
                {comparisonResult.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="border-l-4 border-orange-400 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{weakness.area}</h3>
                    <p className="text-gray-700 text-sm mb-2">{weakness.description}</p>
                    <div className="bg-orange-50 rounded p-3">
                      <p className="text-sm text-gray-600 mb-1 font-medium">추천 활동:</p>
                      <ul className="text-sm space-y-1">
                        {weakness.suggestedActivities.map((activity, aIdx) => (
                          <li key={aIdx} className="text-gray-700">
                            • {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 유사한 합격자 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">유사한 합격자 프로필</h2>
              <div className="space-y-4">
                {comparisonResult.similarAdmissions.map((similar, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {similar.admissionRecord.university} {similar.admissionRecord.major}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {similar.admissionRecord.admissionType} ({similar.admissionRecord.admissionYear}년 합격)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{similar.similarityScore}%</div>
                        <div className="text-xs text-gray-500">유사도</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-600 mb-1">유사한 점:</p>
                        <ul className="space-y-1">
                          {similar.matchingPoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-gray-700">
                              • {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-orange-600 mb-1">다른 점:</p>
                        <ul className="space-y-1">
                          {similar.differencePoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-gray-700">
                              • {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 다시 분석 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setComparisonResult(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                다시 분석하기
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

export default StudentComparisonPage;
