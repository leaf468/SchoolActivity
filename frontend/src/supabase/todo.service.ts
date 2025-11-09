/**
 * 할 일 관리 서비스
 *
 * todos 테이블 CRUD 작업
 */

import { supabase } from './client';
import { Todo, TodoInput, ServiceResponse } from './types';

// ========================================
// 할 일 조회
// ========================================

/**
 * 현재 사용자의 모든 할 일 조회
 *
 * @param orderBy - 정렬 기준 (기본: created_at 내림차순)
 * @returns ServiceResponse<Todo[]>
 */
export async function getMyTodos(
  orderBy: 'created_at' | 'due_date' | 'done' = 'created_at'
): Promise<ServiceResponse<Todo[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order(orderBy, { ascending: orderBy === 'due_date' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 날짜의 할 일 조회
 *
 * @param date - 조회할 날짜 (ISO 8601 형식)
 * @returns ServiceResponse<Todo[]>
 */
export async function getTodosByDate(date: string): Promise<ServiceResponse<Todo[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 날짜 범위 계산 (해당 날짜의 00:00:00 ~ 23:59:59)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .gte('due_date', startDate.toISOString())
      .lte('due_date', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 완료되지 않은 할 일만 조회
 *
 * @returns ServiceResponse<Todo[]>
 */
export async function getPendingTodos(): Promise<ServiceResponse<Todo[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('done', false)
      .order('due_date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 조회 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 할 일 생성
// ========================================

/**
 * 새 할 일 생성
 *
 * @param todoData - 할 일 데이터
 * @returns ServiceResponse<Todo>
 */
export async function createTodo(
  todoData: Omit<TodoInput, 'user_id'>
): Promise<ServiceResponse<Todo>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todoData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '할 일 생성에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 생성 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 할 일 업데이트
// ========================================

/**
 * 할 일 업데이트
 *
 * @param todoId - 업데이트할 할 일 ID
 * @param updates - 업데이트할 필드들
 * @returns ServiceResponse<Todo>
 */
export async function updateTodo(
  todoId: string,
  updates: Partial<Omit<TodoInput, 'user_id'>>
): Promise<ServiceResponse<Todo>> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', todoId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '할 일 업데이트에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 업데이트 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 할 일 완료 상태 토글
 *
 * @param todoId - 토글할 할 일 ID
 * @returns ServiceResponse<Todo>
 */
export async function toggleTodo(todoId: string): Promise<ServiceResponse<Todo>> {
  try {
    // 먼저 현재 상태 조회
    const { data: currentTodo, error: fetchError } = await supabase
      .from('todos')
      .select('done')
      .eq('id', todoId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // 상태 토글
    const { data, error } = await supabase
      .from('todos')
      .update({ done: !currentTodo.done })
      .eq('id', todoId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: '할 일 토글에 실패했습니다.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 토글 중 오류가 발생했습니다.',
    };
  }
}

// ========================================
// 할 일 삭제
// ========================================

/**
 * 할 일 삭제
 *
 * @param todoId - 삭제할 할 일 ID
 * @returns ServiceResponse<void>
 */
export async function deleteTodo(todoId: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', todoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 완료된 할 일 모두 삭제
 *
 * @returns ServiceResponse<void>
 */
export async function deleteCompletedTodos(): Promise<ServiceResponse<void>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('user_id', user.id)
      .eq('done', true);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '할 일 삭제 중 오류가 발생했습니다.',
    };
  }
}
