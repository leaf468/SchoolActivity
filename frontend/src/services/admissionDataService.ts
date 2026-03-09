/**
 * 합격자 생기부 데이터 관리 서비스
 * - Supabase와 연동하여 합격자 데이터 CRUD
 */

import { supabase } from '../config/supabase';
import { AdmissionRecord, MajorTrack, ExtendedAdmissionRecord } from '../types/schoolActivity';

export class AdmissionDataService {
  private static readonly TABLE_NAME = 'admission_records';

  /**
   * 모든 합격자 데이터 조회
   */
  static async getAllAdmissions(): Promise<AdmissionRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('admission_year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admission records:', error);
      return [];
    }
  }

  /**
   * 계열별 합격자 데이터 조회
   */
  static async getAdmissionsByTrack(track: MajorTrack): Promise<AdmissionRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('track', track)
        .order('admission_year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admissions by track:', error);
      return [];
    }
  }

  /**
   * 대학/전공별 합격자 데이터 조회
   */
  static async getAdmissionsByUniversityAndMajor(
    university: string,
    major?: string
  ): Promise<AdmissionRecord[]> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('university', university);

      if (major) {
        query = query.eq('major', major);
      }

      const { data, error } = await query.order('admission_year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admissions by university/major:', error);
      return [];
    }
  }

  /**
   * 특정 합격자 데이터 조회
   */
  static async getAdmissionById(id: string): Promise<AdmissionRecord | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching admission by id:', error);
      return null;
    }
  }

  /**
   * 합격자 데이터 추가 (관리자용)
   */
  static async addAdmission(admission: Omit<AdmissionRecord, 'id' | 'createdAt'>): Promise<AdmissionRecord | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            ...admission,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding admission:', error);
      return null;
    }
  }

  /**
   * 합격자 데이터 일괄 추가 (관리자용)
   */
  static async bulkAddAdmissions(admissions: Omit<AdmissionRecord, 'id' | 'createdAt'>[]): Promise<boolean> {
    try {
      const records = admissions.map(admission => ({
        ...admission,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert(records);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error bulk adding admissions:', error);
      return false;
    }
  }

  /**
   * 합격자 데이터 업데이트 (관리자용)
   */
  static async updateAdmission(id: string, updates: Partial<AdmissionRecord>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating admission:', error);
      return false;
    }
  }

  /**
   * 합격자 데이터 삭제 (관리자용)
   */
  static async deleteAdmission(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting admission:', error);
      return false;
    }
  }

  /**
   * 키워드로 합격자 데이터 검색
   */
  static async searchAdmissions(keyword: string): Promise<AdmissionRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .or(`university.ilike.%${keyword}%,major.ilike.%${keyword}%,tags.cs.{${keyword}}`)
        .order('admission_year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching admissions:', error);
      return [];
    }
  }

  /**
   * 통계: 대학별 합격자 수
   */
  static async getUniversityStats(): Promise<{ university: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('university')
        .order('university');

      if (error) throw error;

      // Count by university
      const stats = (data || []).reduce((acc, record) => {
        const uni = record.university;
        acc[uni] = (acc[uni] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(stats)
        .map(([university, count]) => ({ university, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching university stats:', error);
      return [];
    }
  }

  /**
   * 통계: 계열별 합격자 수
   */
  static async getTrackStats(): Promise<{ track: MajorTrack; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('track')
        .order('track');

      if (error) throw error;

      // Count by track
      const stats = (data || []).reduce((acc, record) => {
        const track = record.track;
        acc[track] = (acc[track] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(stats).map(([track, count]) => ({
        track: track as MajorTrack,
        count,
      }));
    } catch (error) {
      console.error('Error fetching track stats:', error);
      return [];
    }
  }

  /**
   * localStorage의 ExtendedAdmissionRecord를 AdmissionRecord로 변환
   */
  static convertExtendedToAdmissionRecord(
    extended: ExtendedAdmissionRecord
  ): Omit<AdmissionRecord, 'id' | 'createdAt'> {
    return {
      university: extended.university,
      major: extended.major,
      track: extended.track,
      admissionYear: extended.admissionYear,
      admissionType: extended.admissionType,
      grade1Records: [],
      grade2Records: [],
      grade3Records: [],
      tags: [],
    };
  }

  /**
   * localStorage 데이터를 Supabase로 일괄 저장
   */
  static async importFromLocalStorage(): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    error?: string;
  }> {
    try {
      const saved = localStorage.getItem('teacher_admission_records');
      if (!saved) {
        return { success: true, imported: 0, failed: 0 };
      }

      const extendedRecords: ExtendedAdmissionRecord[] = JSON.parse(saved);
      if (extendedRecords.length === 0) {
        return { success: true, imported: 0, failed: 0 };
      }

      const records = extendedRecords.map(record => this.convertExtendedToAdmissionRecord(record));

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert(records);

      if (error) {
        return { success: false, imported: 0, failed: extendedRecords.length, error: error.message };
      }

      return { success: true, imported: extendedRecords.length, failed: 0 };
    } catch (error: any) {
      console.error('Error importing from localStorage:', error);
      return { success: false, imported: 0, failed: 0, error: error.message };
    }
  }

  /**
   * ExtendedAdmissionRecord 배열을 직접 Supabase로 저장
   */
  static async bulkImportExtended(
    records: ExtendedAdmissionRecord[]
  ): Promise<{ success: boolean; imported: number; error?: string }> {
    try {
      if (records.length === 0) {
        return { success: true, imported: 0 };
      }

      const admissionRecords = records.map(record => ({
        university: record.university,
        major: record.major,
        track: record.track,
        admission_year: record.admissionYear,
        admission_type: record.admissionType,
        grade_record: record.gradeRecord,
        mock_exams: record.mockExams,
        high_school: record.highSchool,
        admission_result: record.admissionResult,
        tags: [],
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert(admissionRecords);

      if (error) {
        return { success: false, imported: 0, error: error.message };
      }

      return { success: true, imported: records.length };
    } catch (error: any) {
      console.error('Error bulk importing extended records:', error);
      return { success: false, imported: 0, error: error.message };
    }
  }

  /**
   * 합격자 데이터 전체 개수 조회
   */
  static async getAdmissionCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting admission count:', error);
      return 0;
    }
  }
}
