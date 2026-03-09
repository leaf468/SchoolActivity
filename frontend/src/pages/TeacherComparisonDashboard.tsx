/**
 * 교사용 합격자 비교 분석 대시보드
 * - 엑셀 업로드로 합격자 데이터 관리
 * - 학생 성적과 합격자 비교 분석
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { AdmissionExcelParser } from '../services/admissionExcelParser';
import { AdmissionDataService } from '../services/admissionDataService';
import {
  ExtendedAdmissionRecord,
  ExcelParseResult,
  MajorTrack,
  AdmissionStatistics,
  AdmissionComparisonFilter,
} from '../types/schoolActivity';

// 탭 타입
type TabType = 'upload' | 'data' | 'analysis' | 'statistics';

const TeacherComparisonDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  // 합격자 데이터
  const [admissionRecords, setAdmissionRecords] = useState<ExtendedAdmissionRecord[]>(() => {
    const saved = localStorage.getItem('teacher_admission_records');
    return saved ? JSON.parse(saved) : [];
  });

  // 파싱 결과
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<AdmissionComparisonFilter>({});
  const [searchQuery, setSearchQuery] = useState('');

  // 선택된 레코드
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  // 비교 대상 학생 정보 입력
  const [studentGrade, setStudentGrade] = useState<number>(0);
  const [studentMockPercentile, setStudentMockPercentile] = useState<number>(0);

  // Supabase 저장 상태
  const [isSavingToSupabase, setIsSavingToSupabase] = useState(false);
  const [supabaseRecordCount, setSupabaseRecordCount] = useState<number | null>(null);

  // 데이터 저장
  useEffect(() => {
    localStorage.setItem('teacher_admission_records', JSON.stringify(admissionRecords));
  }, [admissionRecords]);

  // Supabase 레코드 수 조회
  useEffect(() => {
    const fetchCount = async () => {
      const count = await AdmissionDataService.getAdmissionCount();
      setSupabaseRecordCount(count);
    };
    fetchCount();
  }, []);

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const result = AdmissionExcelParser.parseText(text);
      setParseResult(result);

      if (result.success && result.data.length > 0) {
        // 기존 데이터에 추가
        setAdmissionRecords(prev => [...prev, ...result.data]);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      setParseResult({
        success: false,
        data: [],
        errors: [{ row: 0, column: '', message: '파일 처리 중 오류가 발생했습니다.' }],
        warnings: [],
        summary: { totalRows: 0, successRows: 0, failedRows: 0, duplicateRows: 0 },
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const template = AdmissionExcelParser.generateTemplate();
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '합격자데이터_템플릿.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 필터링된 데이터
  const filteredRecords = useMemo(() => {
    return admissionRecords.filter(record => {
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !record.university.toLowerCase().includes(query) &&
          !record.major.toLowerCase().includes(query) &&
          !record.highSchool?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 대학 필터
      if (filters.universities && filters.universities.length > 0) {
        if (!filters.universities.includes(record.university)) return false;
      }

      // 계열 필터
      if (filters.tracks && filters.tracks.length > 0) {
        if (!filters.tracks.includes(record.track)) return false;
      }

      // 연도 필터
      if (filters.years && filters.years.length > 0) {
        if (!filters.years.includes(record.admissionYear)) return false;
      }

      // 내신 범위 필터
      if (filters.gradeRange) {
        const grade = record.gradeRecord?.overall || 0;
        if (grade < filters.gradeRange.min || grade > filters.gradeRange.max) return false;
      }

      return true;
    });
  }, [admissionRecords, searchQuery, filters]);

  // 통계 계산
  const statistics = useMemo((): AdmissionStatistics => {
    const records = filteredRecords;

    // 대학별 통계
    const universityMap = new Map<string, { count: number; totalGrade: number }>();
    records.forEach(r => {
      const key = r.university;
      const current = universityMap.get(key) || { count: 0, totalGrade: 0 };
      universityMap.set(key, {
        count: current.count + 1,
        totalGrade: current.totalGrade + (r.gradeRecord?.overall || 0),
      });
    });

    // 계열별 통계
    const trackMap = new Map<MajorTrack, { count: number; totalGrade: number }>();
    records.forEach(r => {
      const current = trackMap.get(r.track) || { count: 0, totalGrade: 0 };
      trackMap.set(r.track, {
        count: current.count + 1,
        totalGrade: current.totalGrade + (r.gradeRecord?.overall || 0),
      });
    });

    // 전형별 통계
    const typeMap = new Map<string, { count: number; totalGrade: number }>();
    records.forEach(r => {
      const key = r.admissionType;
      const current = typeMap.get(key) || { count: 0, totalGrade: 0 };
      typeMap.set(key, {
        count: current.count + 1,
        totalGrade: current.totalGrade + (r.gradeRecord?.overall || 0),
      });
    });

    // 연도별 통계
    const yearMap = new Map<number, number>();
    records.forEach(r => {
      yearMap.set(r.admissionYear, (yearMap.get(r.admissionYear) || 0) + 1);
    });

    // 내신 분포
    const gradeRanges = ['1.0-1.5', '1.5-2.0', '2.0-2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0', '4.0+'];
    const gradeDistribution = gradeRanges.map(range => {
      const [min, max] = range.replace('+', '-9').split('-').map(Number);
      const count = records.filter(r => {
        const grade = r.gradeRecord?.overall || 0;
        return grade >= min && grade < max;
      }).length;
      return { range, count };
    });

    return {
      totalCount: records.length,
      byUniversity: Array.from(universityMap.entries())
        .map(([name, data]) => ({
          name,
          count: data.count,
          avgGrade: data.count > 0 ? data.totalGrade / data.count : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      byTrack: Array.from(trackMap.entries())
        .map(([track, data]) => ({
          track,
          count: data.count,
          avgGrade: data.count > 0 ? data.totalGrade / data.count : 0,
        })),
      byAdmissionType: Array.from(typeMap.entries())
        .map(([type, data]) => ({
          type,
          count: data.count,
          avgGrade: data.count > 0 ? data.totalGrade / data.count : 0,
        })),
      byYear: Array.from(yearMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => b.year - a.year),
      gradeDistribution,
    };
  }, [filteredRecords]);

  // 유니크 값 추출
  const uniqueUniversities = useMemo(() =>
    Array.from(new Set(admissionRecords.map(r => r.university))).sort(),
  [admissionRecords]);

  const uniqueYears = useMemo(() =>
    Array.from(new Set(admissionRecords.map(r => r.admissionYear))).sort((a, b) => b - a),
  [admissionRecords]);

  // 레코드 삭제
  const handleDeleteRecords = () => {
    if (selectedRecords.size === 0) return;
    if (!window.confirm(`${selectedRecords.size}개의 레코드를 삭제하시겠습니까?`)) return;

    setAdmissionRecords(prev => prev.filter(r => !selectedRecords.has(r.id)));
    setSelectedRecords(new Set());
  };

  // 전체 데이터 삭제
  const handleClearAll = () => {
    if (!window.confirm('모든 합격자 데이터를 삭제하시겠습니까?')) return;
    setAdmissionRecords([]);
    setSelectedRecords(new Set());
  };

  // Supabase에 데이터 저장
  const handleSaveToSupabase = async () => {
    if (admissionRecords.length === 0) {
      alert('저장할 데이터가 없습니다.');
      return;
    }

    if (!window.confirm(`${admissionRecords.length}개의 레코드를 데이터베이스에 저장하시겠습니까?`)) {
      return;
    }

    setIsSavingToSupabase(true);
    try {
      const result = await AdmissionDataService.bulkImportExtended(admissionRecords);
      if (result.success) {
        alert(`${result.imported}개의 레코드가 성공적으로 저장되었습니다.`);
        // 저장 후 카운트 업데이트
        const newCount = await AdmissionDataService.getAdmissionCount();
        setSupabaseRecordCount(newCount);
      } else {
        alert(`저장 실패: ${result.error}`);
      }
    } catch (error: any) {
      alert(`저장 중 오류 발생: ${error.message}`);
    } finally {
      setIsSavingToSupabase(false);
    }
  };

  // 학생과 비교 가능한 레코드 찾기
  const getMatchingRecords = () => {
    if (studentGrade <= 0) return [];

    return filteredRecords
      .filter(r => {
        const recordGrade = r.gradeRecord?.overall || 0;
        // 내신 ±0.5 범위 내의 합격자
        return Math.abs(recordGrade - studentGrade) <= 0.5;
      })
      .sort((a, b) => {
        const gradeA = a.gradeRecord?.overall || 0;
        const gradeB = b.gradeRecord?.overall || 0;
        return Math.abs(gradeA - studentGrade) - Math.abs(gradeB - studentGrade);
      });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">합격자 비교 분석</h1>
          <p className="text-gray-600">
            학교의 합격자 데이터를 업로드하고, 학생들의 성적과 비교 분석하세요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { id: 'upload', label: '데이터 업로드', icon: '📤' },
              { id: 'data', label: '데이터 관리', icon: '📋' },
              { id: 'analysis', label: '비교 분석', icon: '🔍' },
              { id: 'statistics', label: '통계', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {/* 업로드 탭 */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-emerald-800 mb-4">
                    합격자 데이터 업로드
                  </h2>
                  <p className="text-emerald-700 mb-4">
                    학교에서 관리하는 합격자 엑셀 데이터를 업로드하세요.
                    CSV 또는 TSV 형식을 지원합니다.
                  </p>

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                    >
                      📥 템플릿 다운로드
                    </button>
                  </div>

                  <div
                    className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-100 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-emerald-500', 'bg-emerald-100');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-100');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-100');
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(event);
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="animate-pulse">
                        <p className="text-emerald-600 text-lg">업로드 중...</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-5xl mb-4">📁</div>
                        <p className="text-emerald-700 text-lg font-medium mb-2">
                          파일을 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-emerald-600 text-sm">
                          지원 형식: CSV, TSV, TXT (Excel에서 내보내기 가능)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 파싱 결과 */}
                {parseResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 ${
                      parseResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <h3 className={`font-bold mb-4 ${parseResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {parseResult.success ? '✓ 업로드 성공' : '✗ 업로드 실패'}
                    </h3>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">전체 행</p>
                        <p className="text-xl font-bold">{parseResult.summary.totalRows}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">성공</p>
                        <p className="text-xl font-bold text-green-600">{parseResult.summary.successRows}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">실패</p>
                        <p className="text-xl font-bold text-red-600">{parseResult.summary.failedRows}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">중복</p>
                        <p className="text-xl font-bold text-yellow-600">{parseResult.summary.duplicateRows}</p>
                      </div>
                    </div>

                    {parseResult.errors.length > 0 && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="font-medium text-red-700 mb-2">오류 목록:</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {parseResult.errors.slice(0, 5).map((error, idx) => (
                            <li key={idx}>행 {error.row}: {error.message}</li>
                          ))}
                          {parseResult.errors.length > 5 && (
                            <li>... 외 {parseResult.errors.length - 5}개</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => setParseResult(null)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      닫기
                    </button>
                  </motion.div>
                )}

                {/* 업로드 가이드 */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4">📌 데이터 형식 가이드</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">필수 컬럼</h4>
                      <ul className="space-y-1">
                        <li>• 대학 (대학명, university)</li>
                        <li>• 학과 (전공, major)</li>
                        <li>• 졸업연도 (입학연도, year)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">권장 컬럼</h4>
                      <ul className="space-y-1">
                        <li>• 내신평균 (1.0~9.0)</li>
                        <li>• 전형 (학생부종합, 학생부교과 등)</li>
                        <li>• 합격여부 (합격, 불합격, 추합)</li>
                        <li>• 모의고사/수능 성적</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 데이터 관리 탭 */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* 검색 및 필터 */}
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="대학, 학과, 고등학교 검색..."
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <select
                    value={filters.tracks?.[0] || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      tracks: e.target.value ? [e.target.value as MajorTrack] : undefined
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">전체 계열</option>
                    <option value="상경계열">상경계열</option>
                    <option value="공학계열">공학계열</option>
                    <option value="인문사회계열">인문사회계열</option>
                    <option value="자연과학계열">자연과학계열</option>
                    <option value="의생명계열">의생명계열</option>
                  </select>
                  <select
                    value={filters.years?.[0] || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      years: e.target.value ? [parseInt(e.target.value)] : undefined
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">전체 연도</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                  <select
                    value={filters.universities?.[0] || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      universities: e.target.value ? [e.target.value] : undefined
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">전체 대학</option>
                    {uniqueUniversities.map(univ => (
                      <option key={univ} value={univ}>{univ}</option>
                    ))}
                  </select>
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    총 {filteredRecords.length}개 / {admissionRecords.length}개 레코드
                    {selectedRecords.size > 0 && ` (${selectedRecords.size}개 선택됨)`}
                    {supabaseRecordCount !== null && (
                      <span className="ml-2 text-emerald-600">(DB: {supabaseRecordCount}개)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {admissionRecords.length > 0 && (
                      <button
                        onClick={handleSaveToSupabase}
                        disabled={isSavingToSupabase}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm disabled:opacity-50"
                      >
                        {isSavingToSupabase ? '저장 중...' : '💾 DB에 저장'}
                      </button>
                    )}
                    {selectedRecords.size > 0 && (
                      <button
                        onClick={handleDeleteRecords}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        선택 삭제
                      </button>
                    )}
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      전체 삭제
                    </button>
                  </div>
                </div>

                {/* 데이터 테이블 */}
                <div className="bg-white rounded-xl border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
                                } else {
                                  setSelectedRecords(new Set());
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">연도</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">대학</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">학과</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">계열</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">전형</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">내신</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">모고등급</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">결과</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredRecords.slice(0, 50).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedRecords.has(record.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedRecords);
                                  if (e.target.checked) {
                                    newSelected.add(record.id);
                                  } else {
                                    newSelected.delete(record.id);
                                  }
                                  setSelectedRecords(newSelected);
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3 text-gray-600">{record.admissionYear}</td>
                            <td className="px-4 py-3 font-medium">{record.university}</td>
                            <td className="px-4 py-3">{record.major}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.track === '상경계열' ? 'bg-blue-100 text-blue-700' :
                                record.track === '공학계열' ? 'bg-purple-100 text-purple-700' :
                                record.track === '인문사회계열' ? 'bg-yellow-100 text-yellow-700' :
                                record.track === '자연과학계열' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {record.track}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{record.admissionType}</td>
                            <td className="px-4 py-3">
                              {record.gradeRecord?.overall ? (
                                <span className="font-medium text-emerald-600">
                                  {record.gradeRecord.overall.toFixed(2)}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {record.mockExams?.[0]?.korean?.grade ? (
                                <span className="text-gray-600">
                                  국{record.mockExams[0].korean.grade}/
                                  수{record.mockExams[0].math?.grade || '-'}/
                                  영{record.mockExams[0].english?.grade || '-'}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.admissionResult === 'accepted' ? 'bg-green-100 text-green-700' :
                                record.admissionResult === 'additional' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {record.admissionResult === 'accepted' ? '합격' :
                                 record.admissionResult === 'additional' ? '추합' : '불합'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredRecords.length > 50 && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50">
                      {filteredRecords.length - 50}개 더 있음
                    </div>
                  )}
                  {filteredRecords.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      데이터가 없습니다. 먼저 합격자 데이터를 업로드해주세요.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 비교 분석 탭 */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-blue-800 mb-4">
                    학생 성적 입력
                  </h2>
                  <p className="text-blue-700 mb-4">
                    비교하고 싶은 학생의 성적을 입력하면, 유사한 성적대의 합격자를 찾아드립니다.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        내신 평균 등급
                      </label>
                      <input
                        type="number"
                        value={studentGrade || ''}
                        onChange={(e) => setStudentGrade(parseFloat(e.target.value) || 0)}
                        placeholder="예: 1.5"
                        step="0.1"
                        min="1"
                        max="9"
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        모의고사 평균 백분위
                      </label>
                      <input
                        type="number"
                        value={studentMockPercentile || ''}
                        onChange={(e) => setStudentMockPercentile(parseFloat(e.target.value) || 0)}
                        placeholder="예: 95"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 비교 결과 */}
                {studentGrade > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      내신 {studentGrade.toFixed(1)} 등급과 유사한 합격자 ({getMatchingRecords().length}명)
                    </h3>

                    {getMatchingRecords().length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getMatchingRecords().slice(0, 12).map((record) => (
                          <div key={record.id} className="bg-white rounded-xl border p-4 hover:shadow-lg transition">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{record.university}</h4>
                                <p className="text-gray-600 text-sm">{record.major}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.admissionResult === 'accepted' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {record.admissionResult === 'accepted' ? '합격' : '추합'}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">내신</span>
                                <span className="font-medium">
                                  {record.gradeRecord?.overall?.toFixed(2) || '-'}등급
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">전형</span>
                                <span>{record.admissionType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">연도</span>
                                <span>{record.admissionYear}</span>
                              </div>
                              {record.mockExams?.[0] && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">모고</span>
                                  <span>
                                    국{record.mockExams[0].korean?.grade || '-'}/
                                    수{record.mockExams[0].math?.grade || '-'}/
                                    영{record.mockExams[0].english?.grade || '-'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* 내신 차이 표시 */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-center">
                                <span className={`text-sm font-medium ${
                                  (record.gradeRecord?.overall || 0) <= studentGrade
                                    ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {(record.gradeRecord?.overall || 0) <= studentGrade
                                    ? '✓ 도전 가능' : '⚠ 다소 높음'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <p className="text-gray-500">
                          해당 내신 범위의 합격자 데이터가 없습니다.
                          더 많은 데이터를 업로드해주세요.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {studentGrade <= 0 && (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <p className="text-gray-500">
                      위에서 학생의 성적을 입력하면 비교 분석 결과를 볼 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 통계 탭 */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                {/* 요약 카드 */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500 mb-1">전체 데이터</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalCount}건</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500 mb-1">대학 수</p>
                    <p className="text-2xl font-bold text-blue-600">{statistics.byUniversity.length}개</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500 mb-1">연도 범위</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {statistics.byYear.length > 0
                        ? `${statistics.byYear[statistics.byYear.length - 1].year}-${statistics.byYear[0].year}`
                        : '-'}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500 mb-1">평균 내신</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.byTrack.length > 0
                        ? (statistics.byTrack.reduce((sum, t) => sum + t.avgGrade * t.count, 0) /
                           statistics.byTrack.reduce((sum, t) => sum + t.count, 0)).toFixed(2)
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* 대학별 통계 */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-800 mb-4">대학별 합격자 수 (상위 10개)</h3>
                  <div className="space-y-3">
                    {statistics.byUniversity.map((uni, idx) => (
                      <div key={uni.name} className="flex items-center gap-4">
                        <span className="w-6 text-sm text-gray-500">{idx + 1}</span>
                        <span className="flex-1 font-medium">{uni.name}</span>
                        <span className="text-sm text-gray-500">
                          평균 {uni.avgGrade.toFixed(2)}등급
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${(uni.count / (statistics.byUniversity[0]?.count || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="w-12 text-right font-bold">{uni.count}명</span>
                      </div>
                    ))}
                    {statistics.byUniversity.length === 0 && (
                      <p className="text-gray-500 text-center py-4">데이터가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* 계열별 통계 */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-800 mb-4">계열별 통계</h3>
                  <div className="grid md:grid-cols-5 gap-4">
                    {statistics.byTrack.map((track) => (
                      <div key={track.track} className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">{track.track}</p>
                        <p className="text-xl font-bold text-gray-900">{track.count}명</p>
                        <p className="text-xs text-gray-500">
                          평균 {track.avgGrade.toFixed(2)}등급
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 내신 분포 */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-800 mb-4">내신 등급 분포</h3>
                  <div className="flex items-end gap-2 h-40">
                    {statistics.gradeDistribution.map((dist) => {
                      const maxCount = Math.max(...statistics.gradeDistribution.map(d => d.count));
                      const height = maxCount > 0 ? (dist.count / maxCount) * 100 : 0;
                      return (
                        <div key={dist.range} className="flex-1 flex flex-col items-center">
                          <span className="text-xs text-gray-600 mb-1">{dist.count}</span>
                          <div
                            className="w-full bg-emerald-500 rounded-t"
                            style={{ height: `${height}%`, minHeight: dist.count > 0 ? '4px' : '0' }}
                          />
                          <span className="text-xs text-gray-500 mt-2">{dist.range}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
