'lock';

export interface PaginatedResponse<T> {
	/** 当前页数据列表 */
	items: T[];
	/** 总数据条数 */
	total: number;
	/** 总页数 */
	totalPages: number;
	/** 当前页码 */
	currentPage: number;
	/** 每页显示数量 */
	limit: number;
	/** 是否有下一页 */
	hasNext: boolean;
	/** 是否有上一页 */
	hasPrev: boolean;
}

export interface PaginationOptions {
	/** 当前页码 */
	page: number;
	/** 每页显示数量 */
	limit: number;
	/** 排序字段 */
	sortBy?: string;
	/** 排序方式: asc | desc */
	order?: 'asc' | 'desc';
	/** 搜索关键词 */
	keyword?: string;
}

