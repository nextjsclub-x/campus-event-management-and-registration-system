import { get, post, put, del } from '@/utils/request';
import type { Category, CategoryStatus } from '@/types/category.types';
import type { PaginatedResponse } from '@/types/pagination.types';

/**
 * 获取分类列表
 * @param params 查询参数
 */
export const getCategoryList = (params?: {
  status?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.status !== undefined) {
    searchParams.append('status', params.status.toString());
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }
  if (params?.keyword) {
    searchParams.append('keyword', params.keyword);
  }

  return get<PaginatedResponse<Category>>(`/api/categories?${searchParams.toString()}`);
};

/**
 * 创建新分类
 * @param data 分类数据
 */
export const createCategory = (data: {
  name: string;
  description: string;
}) => post<Category>('/api/categories/create', data);

/**
 * 获取分类详情
 * @param id 分类ID
 */
export const getCategory = (id: number) => 
  get<Category>(`/api/categories/${id}`);

/**
 * 更新分类
 * @param id 分类ID
 * @param data 更新数据
 */
export const updateCategory = (id: number, data: {
  name?: string;
  description?: string;
  status?: typeof CategoryStatus[keyof typeof CategoryStatus];
}) => put<Category>(`/api/categories/${id}`, data);

/**
 * 删除分类
 * @param id 分类ID
 */
export const deleteCategory = (id: number) => 
  del(`/api/categories/${id}`);

/**
 * 获取分类统计信息
 * @param id 分类ID
 */
export const getCategoryStats = (id: number) => 
  get<{
    activityCount: number;
    activeActivityCount: number;
    participantCount: number;
  }>(`/api/categories/${id}/stats`);

/**
 * 使用示例：
 * ```typescript
 * // 获取分类列表
 * const response = await getCategoryList({
 *   status: CategoryStatus.ACTIVE,
 *   page: 1,
 *   pageSize: 20,
 *   keyword: '搜索关键词'
 * });
 * 
 * // 创建新分类
 * const createResponse = await createCategory({
 *   name: '分类名称',
 *   description: '分类描述'
 * });
 * 
 * // 更新分类
 * const updateResponse = await updateCategory(1, {
 *   name: '新名称',
 *   description: '新描述',
 *   status: CategoryStatus.ACTIVE
 * });
 * 
 * // 获取分类统计
 * const statsResponse = await getCategoryStats(1);
 * ```
 */ 
