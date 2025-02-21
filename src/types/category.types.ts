export enum CategoryStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

export type CategoryStatusType = CategoryStatus.ACTIVE | CategoryStatus.INACTIVE;

export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: CategoryStatusType;
}

export interface CategoryStats {
  totalActivities: number;
  statusStats: Array<{
    status: number;
    count: number;
  }>;
  recentActivities: Array<{
    id: number;
    title: string;
    startTime: Date;
    status: number;
  }>;
}

// 创建分类请求体
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  status?: CategoryStatusType;
}

// 更新分类请求体
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  status?: CategoryStatusType;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: CategoryStatusType;
  createdAt: Date;
  updatedAt: Date;
}
