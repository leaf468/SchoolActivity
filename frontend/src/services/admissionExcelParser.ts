/**
 * 합격자 데이터 엑셀 파싱 서비스
 * - 학교에서 관리하는 합격자 엑셀 데이터를 파싱
 */

import {
  ExtendedAdmissionRecord,
  ExcelParseResult,
  GradeRecord,
  MockExamRecord,
  AdmissionTypeInfo,
  MajorTrack,
  SectionRecord,
} from '../types/schoolActivity';

// 컬럼명 매핑 (다양한 형식 지원)
const COLUMN_MAPPINGS = {
  // 학생 기본정보
  name: ['이름', '성명', 'name', '학생명', '학생이름'],
  graduationYear: ['졸업연도', '졸업년도', '입학연도', 'year', '연도', '학년도'],
  classInfo: ['반', 'class', '반번호', '학급'],
  studentNumber: ['번호', 'number', '학번', '출석번호'],

  // 대학 정보
  university: ['대학', '대학교', '대학명', 'university', '합격대학', '지원대학'],
  major: ['학과', '전공', '학과명', 'major', '합격학과', '지원학과'],
  admissionType: ['전형', '전형유형', '전형명', 'admission_type', '입시전형'],
  admissionMethod: ['수시정시', '전형구분', '입시구분', 'method'],

  // 합격 정보
  result: ['합격여부', '결과', 'result', '합불', '합격', '최종결과'],
  enrolled: ['등록여부', '등록', 'enrolled', '실등록'],

  // 내신 성적
  gradeOverall: ['내신평균', '내신', '평균등급', '전체내신', 'gpa', 'grade'],
  grade1: ['1학년내신', '고1내신', '1학년', 'grade1'],
  grade2: ['2학년내신', '고2내신', '2학년', 'grade2'],
  grade3: ['3학년내신', '고3내신', '3학년', 'grade3'],
  gradeKorean: ['국어등급', '국어내신', 'korean_grade'],
  gradeMath: ['수학등급', '수학내신', 'math_grade'],
  gradeEnglish: ['영어등급', '영어내신', 'english_grade'],
  gradeScience: ['과탐등급', '과학등급', 'science_grade'],
  gradeSocial: ['사탐등급', '사회등급', 'social_grade'],

  // 모의고사/수능 성적
  mockKoreanGrade: ['국어모고등급', '국어등급', '모고국어', 'mock_korean'],
  mockKoreanPercentile: ['국어백분위', '국어%', 'korean_percentile'],
  mockKoreanStandard: ['국어표준', '국어표점', 'korean_standard'],
  mockMathGrade: ['수학모고등급', '수학등급', '모고수학', 'mock_math'],
  mockMathPercentile: ['수학백분위', '수학%', 'math_percentile'],
  mockMathStandard: ['수학표준', '수학표점', 'math_standard'],
  mockEnglishGrade: ['영어모고등급', '영어등급', '모고영어', 'mock_english'],
  mockInquiry1Subject: ['탐구1과목', '탐1', 'inquiry1_subject'],
  mockInquiry1Grade: ['탐구1등급', '탐1등급', 'inquiry1_grade'],
  mockInquiry1Percentile: ['탐구1백분위', '탐1%', 'inquiry1_percentile'],
  mockInquiry2Subject: ['탐구2과목', '탐2', 'inquiry2_subject'],
  mockInquiry2Grade: ['탐구2등급', '탐2등급', 'inquiry2_grade'],
  mockInquiry2Percentile: ['탐구2백분위', '탐2%', 'inquiry2_percentile'],
  totalPercentile: ['총백분위', '합산백분위', 'total_percentile'],
  totalStandard: ['총표준', '합산표점', 'total_standard'],

  // 수능 최저
  minimumRequirement: ['수능최저', '최저', 'minimum', '최저기준'],

  // 고등학교 정보
  highSchool: ['출신고', '고등학교', '학교명', 'high_school'],
  highSchoolType: ['학교유형', '고교유형', 'school_type'],
  region: ['지역', '출신지역', 'region'],

  // 계열
  track: ['계열', '전공계열', 'track'],
};

// 계열 매핑
const TRACK_MAPPINGS: Record<string, MajorTrack> = {
  '상경': '상경계열',
  '경영': '상경계열',
  '경제': '상경계열',
  '상경계열': '상경계열',
  '공학': '공학계열',
  '이공': '공학계열',
  '공과': '공학계열',
  '공학계열': '공학계열',
  '인문': '인문사회계열',
  '사회': '인문사회계열',
  '인문사회': '인문사회계열',
  '인문사회계열': '인문사회계열',
  '자연': '자연과학계열',
  '자연과학': '자연과학계열',
  '이학': '자연과학계열',
  '자연과학계열': '자연과학계열',
  '의생명': '의생명계열',
  '의학': '의생명계열',
  '생명': '의생명계열',
  '의약': '의생명계열',
  '의생명계열': '의생명계열',
};

// 합격 결과 매핑
const RESULT_MAPPINGS: Record<string, ExtendedAdmissionRecord['admissionResult']> = {
  '합격': 'accepted',
  '최초합격': 'accepted',
  '추합': 'additional',
  '추가합격': 'additional',
  '불합': 'rejected',
  '불합격': 'rejected',
  '탈락': 'rejected',
  '예비': 'waitlist',
  'accepted': 'accepted',
  'additional': 'additional',
  'rejected': 'rejected',
  'waitlist': 'waitlist',
};

// 전형 구분 매핑
const METHOD_MAPPINGS: Record<string, 'early' | 'regular'> = {
  '수시': 'early',
  '정시': 'regular',
  'early': 'early',
  'regular': 'regular',
};

export class AdmissionExcelParser {
  /**
   * CSV/TSV 텍스트 파싱
   */
  static parseText(text: string): ExcelParseResult {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: '', message: '데이터가 충분하지 않습니다.' }],
        warnings: [],
        summary: { totalRows: 0, successRows: 0, failedRows: 0, duplicateRows: 0 },
      };
    }

    // 헤더 파싱
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
    const columnMap = this.mapColumns(headers);

    const result: ExcelParseResult = {
      success: true,
      data: [],
      errors: [],
      warnings: [],
      summary: { totalRows: lines.length - 1, successRows: 0, failedRows: 0, duplicateRows: 0 },
    };

    // 데이터 파싱
    for (let i = 1; i < lines.length; i++) {
      const cells = this.parseLine(lines[i], delimiter);

      try {
        const record = this.parseRow(cells, columnMap, i + 1);
        if (record) {
          result.data.push(record);
          result.summary.successRows++;
        } else {
          result.summary.failedRows++;
        }
      } catch (error) {
        result.errors.push({
          row: i + 1,
          column: '',
          message: error instanceof Error ? error.message : '파싱 오류',
        });
        result.summary.failedRows++;
      }
    }

    result.success = result.summary.successRows > 0;
    return result;
  }

  /**
   * 라인 파싱 (쉼표/탭 구분, 따옴표 처리)
   */
  private static parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }

  /**
   * 헤더를 내부 키로 매핑
   */
  private static mapColumns(headers: string[]): Map<string, number> {
    const columnMap = new Map<string, number>();

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().replace(/\s/g, '');

      for (const [key, aliases] of Object.entries(COLUMN_MAPPINGS)) {
        for (const alias of aliases) {
          if (lowerHeader.includes(alias.toLowerCase().replace(/\s/g, ''))) {
            columnMap.set(key, index);
            break;
          }
        }
      }
    });

    return columnMap;
  }

  /**
   * 행 데이터 파싱
   */
  private static parseRow(
    cells: string[],
    columnMap: Map<string, number>,
    rowNumber: number
  ): ExtendedAdmissionRecord | null {
    const getValue = (key: string): string | undefined => {
      const index = columnMap.get(key);
      if (index === undefined || index >= cells.length) return undefined;
      const value = cells[index]?.trim();
      return value || undefined;
    };

    const getNumber = (key: string): number | undefined => {
      const value = getValue(key);
      if (!value) return undefined;
      const num = parseFloat(value.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? undefined : num;
    };

    // 필수 필드 검증
    const university = getValue('university');
    if (!university) {
      return null; // 대학명 없으면 스킵
    }

    // 내신 성적 파싱
    const gradeRecord: GradeRecord = {
      overall: getNumber('gradeOverall') || 0,
      grade1: getNumber('grade1'),
      grade2: getNumber('grade2'),
      grade3: getNumber('grade3'),
      korean: getNumber('gradeKorean'),
      math: getNumber('gradeMath'),
      english: getNumber('gradeEnglish'),
      science: getNumber('gradeScience'),
      social: getNumber('gradeSocial'),
    };

    // 모의고사/수능 성적 파싱
    const mockExam: MockExamRecord = {
      type: 'mock',
      korean: {
        grade: getNumber('mockKoreanGrade'),
        percentile: getNumber('mockKoreanPercentile'),
        standard: getNumber('mockKoreanStandard'),
      },
      math: {
        grade: getNumber('mockMathGrade'),
        percentile: getNumber('mockMathPercentile'),
        standard: getNumber('mockMathStandard'),
      },
      english: {
        grade: getNumber('mockEnglishGrade'),
      },
      inquiry1: {
        subject: getValue('mockInquiry1Subject'),
        grade: getNumber('mockInquiry1Grade'),
        percentile: getNumber('mockInquiry1Percentile'),
      },
      inquiry2: {
        subject: getValue('mockInquiry2Subject'),
        grade: getNumber('mockInquiry2Grade'),
        percentile: getNumber('mockInquiry2Percentile'),
      },
      totalStandard: getNumber('totalStandard'),
      averagePercentile: getNumber('totalPercentile'),
    };

    // 전형 정보 파싱
    const admissionMethod = getValue('admissionMethod');
    const admissionTypeName = getValue('admissionType');
    const minimumReq = getValue('minimumRequirement');

    const admissionTypeInfo: AdmissionTypeInfo = {
      method: METHOD_MAPPINGS[admissionMethod?.toLowerCase() || ''] || 'early',
      typeName: admissionTypeName || '학생부종합전형',
      hasMinimumRequirement: !!minimumReq,
      minimumRequirement: minimumReq,
    };

    // 계열 추론
    const trackValue = getValue('track');
    const major = getValue('major') || '';
    let track: MajorTrack = '인문사회계열';

    if (trackValue && TRACK_MAPPINGS[trackValue]) {
      track = TRACK_MAPPINGS[trackValue];
    } else {
      // 학과명으로 계열 추론
      track = this.inferTrackFromMajor(major);
    }

    // 합격 결과 파싱
    const resultValue = getValue('result');
    const admissionResult = RESULT_MAPPINGS[resultValue?.toLowerCase() || ''] || 'accepted';

    // 고교 유형 파싱
    const highSchoolTypeValue = getValue('highSchoolType');
    let highSchoolType: ExtendedAdmissionRecord['highSchoolType'] = 'general';
    if (highSchoolTypeValue) {
      if (highSchoolTypeValue.includes('특목')) highSchoolType = 'special';
      else if (highSchoolTypeValue.includes('자사')) highSchoolType = 'autonomous';
      else if (highSchoolTypeValue.includes('외고')) highSchoolType = 'foreign';
    }

    // 결과 레코드 생성
    const record: ExtendedAdmissionRecord = {
      id: `admission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      university: university,
      major: major,
      track: track,
      admissionYear: getNumber('graduationYear') || new Date().getFullYear(),
      admissionType: admissionTypeInfo.typeName,
      highSchool: getValue('highSchool'),
      region: getValue('region'),

      // 빈 생기부 배열 (별도 입력 필요)
      grade1Records: [],
      grade2Records: [],
      grade3Records: [],

      tags: this.extractTags(major, track),
      createdAt: new Date().toISOString(),

      // 확장 필드
      gradeRecord: gradeRecord,
      mockExams: [mockExam],
      admissionTypeInfo: admissionTypeInfo,
      admissionResult: admissionResult,
      enrolled: getValue('enrolled')?.toLowerCase() === '등록' ||
                getValue('enrolled')?.toLowerCase() === 'yes' ||
                getValue('enrolled')?.toLowerCase() === 'y',
      highSchoolType: highSchoolType,
      highSchoolRegion: getValue('region'),
    };

    return record;
  }

  /**
   * 학과명으로 계열 추론
   */
  private static inferTrackFromMajor(major: string): MajorTrack {
    const lowerMajor = major.toLowerCase();

    // 의생명계열
    if (['의학', '의예', '치의', '약학', '한의', '간호', '수의', '생명'].some(k => lowerMajor.includes(k))) {
      return '의생명계열';
    }

    // 공학계열
    if (['공학', '컴퓨터', '전자', '기계', '전기', '화공', 'it', '소프트웨어', '정보', '건축', '산업'].some(k => lowerMajor.includes(k))) {
      return '공학계열';
    }

    // 상경계열
    if (['경영', '경제', '금융', '무역', '회계', '상경', '통상', '세무'].some(k => lowerMajor.includes(k))) {
      return '상경계열';
    }

    // 자연과학계열
    if (['수학', '물리', '화학', '생물', '지구', '천문', '통계', '자연'].some(k => lowerMajor.includes(k))) {
      return '자연과학계열';
    }

    // 기본값: 인문사회계열
    return '인문사회계열';
  }

  /**
   * 태그 추출
   */
  private static extractTags(major: string, track: MajorTrack): string[] {
    const tags: string[] = [track];

    const majorLower = major.toLowerCase();

    if (majorLower.includes('의')) tags.push('의학');
    if (majorLower.includes('경영')) tags.push('경영');
    if (majorLower.includes('컴퓨터') || majorLower.includes('소프트웨어')) tags.push('IT');
    if (majorLower.includes('법')) tags.push('법학');
    if (majorLower.includes('교육')) tags.push('교육');

    return Array.from(new Set(tags));
  }

  /**
   * 샘플 엑셀 템플릿 생성
   */
  static generateTemplate(): string {
    const headers = [
      '졸업연도', '이름', '반', '번호',
      '대학', '학과', '계열', '전형', '수시정시', '합격여부', '등록여부',
      '내신평균', '1학년내신', '2학년내신', '3학년내신',
      '국어내신', '수학내신', '영어내신', '과탐등급', '사탐등급',
      '국어등급', '국어백분위', '국어표준',
      '수학등급', '수학백분위', '수학표준',
      '영어등급',
      '탐구1과목', '탐구1등급', '탐구1백분위',
      '탐구2과목', '탐구2등급', '탐구2백분위',
      '총백분위', '총표준',
      '수능최저',
      '출신고', '학교유형', '지역'
    ];

    const sampleRow = [
      '2024', '홍길동', '1', '1',
      '서울대학교', '경영학과', '상경계열', '학생부종합전형', '수시', '합격', '등록',
      '1.5', '1.6', '1.4', '1.5',
      '1', '2', '1', '2', '',
      '2', '93', '134',
      '1', '97', '145',
      '1',
      '생명과학I', '2', '94',
      '지구과학I', '2', '92',
      '95', '279',
      '3합 5등급',
      '서울고등학교', '일반고', '서울'
    ];

    return [headers.join(','), sampleRow.join(',')].join('\n');
  }

  /**
   * 데이터 검증
   */
  static validateData(records: ExtendedAdmissionRecord[]): {
    valid: boolean;
    issues: { recordId: string; issues: string[] }[];
  } {
    const issues: { recordId: string; issues: string[] }[] = [];

    for (const record of records) {
      const recordIssues: string[] = [];

      // 필수 필드 검증
      if (!record.university) recordIssues.push('대학명 누락');
      if (!record.major) recordIssues.push('학과명 누락');

      // 내신 검증
      if (record.gradeRecord) {
        if (record.gradeRecord.overall < 1 || record.gradeRecord.overall > 9) {
          recordIssues.push('내신 등급이 유효 범위(1-9)를 벗어남');
        }
      }

      // 모의고사 검증
      if (record.mockExams && record.mockExams.length > 0) {
        const mock = record.mockExams[0];
        if (mock.korean?.grade && (mock.korean.grade < 1 || mock.korean.grade > 9)) {
          recordIssues.push('국어 등급이 유효 범위(1-9)를 벗어남');
        }
        if (mock.korean?.percentile && (mock.korean.percentile < 0 || mock.korean.percentile > 100)) {
          recordIssues.push('국어 백분위가 유효 범위(0-100)를 벗어남');
        }
      }

      if (recordIssues.length > 0) {
        issues.push({ recordId: record.id, issues: recordIssues });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
