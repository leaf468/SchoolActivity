/**
 * 교사용 합격자 비교 분석 대시보드
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../contexts/TeacherContext';
import { ComparisonService } from '../services/comparisonService';
import { ComparisonResult, StudentInfo, GeneratedRecord } from '../types/schoolActivity';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';

interface StudentComparisonData {
  studentId: string;
  studentName: string;
  comparisonResult: ComparisonResult | null;
  loading: boolean;
  error: string | null;
}

const TeacherComparisonDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { basicInfo, students, generatedRecords } = useTeacher();
  const [comparisons, setComparisons] = useState<StudentComparisonData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // 학생별 비교 데이터 초기화
  useEffect(() => {
    if (students.length > 0) {
      const initialComparisons = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        comparisonResult: null,
        loading: false,
        error: null,
      }));
      setComparisons(initialComparisons);
    }
  }, [students]);

  // 개별 학생 비교 분석
  const handleCompareStudent = async (studentId: string) => {
    const studentData = students.find(s => s.id === studentId);
    const studentRecords = generatedRecords.filter(r => r.studentId === studentId);

    if (!studentData || studentRecords.length === 0) {
      alert('해당 학생의 생기부 데이터가 없습니다.');
      return;
    }

    setComparisons(prev =>
      prev.map(c =>
        c.studentId === studentId
          ? { ...c, loading: true, error: null }
          : c
      )
    );

    try {
      const studentInfo: StudentInfo = {
        name: studentData.name,
        grade: basicInfo?.grade || 1,
        desiredMajor: studentData.desiredMajor || '',
        track: studentData.track || '인문사회계열',
      };

      const records: GeneratedRecord[] = studentRecords.map(r => r.generatedRecord);
      const result = await ComparisonService.compareWithAdmissions(studentInfo, records);

      setComparisons(prev =>
        prev.map(c =>
          c.studentId === studentId
            ? { ...c, comparisonResult: result, loading: false }
            : c
        )
      );
    } catch (error) {
      setComparisons(prev =>
        prev.map(c =>
          c.studentId === studentId
            ? { ...c, loading: false, error: '비교 분석 실패' }
            : c
        )
      );
    }
  };

  // 전체 학생 일괄 비교
  const handleBatchCompare = async () => {
    setBatchLoading(true);

    for (const student of students) {
      await handleCompareStudent(student.id);
    }

    setBatchLoading(false);
  };

  // 평균 점수 계산
  const getAverageScore = () => {
    const scores = comparisons
      .filter(c => c.comparisonResult?.competitivenessScore)
      .map(c => c.comparisonResult!.competitivenessScore);

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">합격자 비교 분석 대시보드</h1>
          <p className="text-gray-600">
            학생들의 생기부를 합격자 데이터와 비교하여 전체적인 경쟁력을 파악합니다.
          </p>
        </div>

        {/* 기본 정보 카드 */}
        {basicInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold mb-2">수업 정보</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{basicInfo.grade}학년 {basicInfo.semester}학기</span>
                  <span>•</span>
                  <span>{basicInfo.sectionType === 'subject' ? `${basicInfo.subject} 교과세특` : basicInfo.sectionType}</span>
                  <span>•</span>
                  <span>{students.length}명</span>
                </div>
              </div>
              <button
                onClick={handleBatchCompare}
                disabled={batchLoading || students.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {batchLoading ? '분석 중...' : '전체 학생 일괄 분석'}
              </button>
            </div>
          </div>
        )}

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">전체 학생 수</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}명</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">분석 완료</p>
            <p className="text-2xl font-bold text-green-600">
              {comparisons.filter(c => c.comparisonResult).length}명
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">평균 경쟁력</p>
            <p className="text-2xl font-bold text-blue-600">{getAverageScore()}점</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">우수 학생</p>
            <p className="text-2xl font-bold text-purple-600">
              {comparisons.filter(c => (c.comparisonResult?.competitivenessScore || 0) >= 80).length}명
            </p>
          </div>
        </div>

        {/* 학생별 분석 결과 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">학생별 분석 결과</h2>
          </div>
          <div className="divide-y">
            {comparisons.map(comparison => (
              <div key={comparison.studentId} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {comparison.studentName.substring(0, 1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{comparison.studentName}</h3>
                      <p className="text-sm text-gray-500">
                        {students.find(s => s.id === comparison.studentId)?.desiredMajor || '미지정'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {comparison.comparisonResult && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {comparison.comparisonResult.competitivenessScore}점
                        </p>
                        <p className="text-xs text-gray-500">경쟁력 점수</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (comparison.comparisonResult) {
                          setSelectedStudent(
                            selectedStudent === comparison.studentId ? null : comparison.studentId
                          );
                        } else {
                          handleCompareStudent(comparison.studentId);
                        }
                      }}
                      disabled={comparison.loading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      {comparison.loading
                        ? '분석 중...'
                        : comparison.comparisonResult
                        ? selectedStudent === comparison.studentId
                          ? '닫기'
                          : '상세보기'
                        : '분석하기'}
                    </button>
                  </div>
                </div>

                {/* 상세 결과 */}
                {selectedStudent === comparison.studentId && comparison.comparisonResult && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">전체 평가</h4>
                      <p className="text-sm text-gray-600">
                        {comparison.comparisonResult.overallAssessment}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">강점</h4>
                        <ul className="text-sm space-y-1">
                          {comparison.comparisonResult.strengths.slice(0, 3).map((strength, idx) => (
                            <li key={idx} className="text-gray-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2">개선점</h4>
                        <ul className="text-sm space-y-1">
                          {comparison.comparisonResult.weaknesses.slice(0, 3).map((weakness, idx) => (
                            <li key={idx} className="text-gray-600">• {weakness.area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {comparison.error && (
                  <div className="mt-2 text-sm text-red-600">{comparison.error}</div>
                )}
              </div>
            ))}

            {comparisons.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                분석할 학생이 없습니다. 먼저 학생을 추가해주세요.
              </div>
            )}
          </div>
        </div>
      </main>

      <CommonFooter />
    </div>
  );
};

export default TeacherComparisonDashboard;