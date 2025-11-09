/**
 * Supabase 클라이언트 (레거시 호환성)
 *
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 새로운 코드에서는 '../supabase/client'를 직접 import 하세요.
 *
 * @deprecated 새로운 코드에서는 '@/supabase' 또는 '../supabase'를 사용하세요
 */

// 새로운 통합 클라이언트를 re-export
export { supabase } from '../supabase/client';
