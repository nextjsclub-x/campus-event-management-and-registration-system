import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategoryList,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from '@/api/category';
import { useToast } from '@/hooks/use-toast';
import type { Category, CategoryStatus } from '@/types/category.types';

/**
 * 获取分类列表的hook
 */
export function useCategoryList(params?: {
  status?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: ['categories', params?.status, params?.page, params?.pageSize, params?.keyword],
    queryFn: () => getCategoryList(params),
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取单个分类详情的hook
 */
export function useCategory(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id),
    enabled: !!id,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 创建分类的hook
 */
export function useCreateCategory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (response) => {
      if (response.code === 201) {
        toast({
          title: '分类创建成功',
          variant: 'default',
        });
        // 创建成功后，使分类列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '分类创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 更新分类的hook
 */
export function useUpdateCategory(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateCategory>[1]) => updateCategory(id, data),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '分类更新成功',
          variant: 'default',
        });
        // 更新成功后，使相关缓存失效
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['category', id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '分类更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 删除分类的hook
 */
export function useDeleteCategory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '分类删除成功',
          variant: 'default',
        });
        // 删除成功后，使分类列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '分类删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 获取分类统计信息的hook
 */
export function useCategoryStats(id: number) {
  return useQuery({
    queryKey: ['category-stats', id],
    queryFn: () => getCategoryStats(id),
    enabled: !!id,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 使用示例：
 * ```typescript
 * function CategoryList() {
 *   const [page, setPage] = useState(1);
 *   const [keyword, setKeyword] = useState('');
 * 
 *   const { data, isLoading } = useCategoryList({
 *     status: CategoryStatus.ACTIVE,
 *     page,
 *     pageSize: 10,
 *     keyword
 *   });
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>分类列表</h1>
 *       <input
 *         value={keyword}
 *         onChange={(e) => setKeyword(e.target.value)}
 *         placeholder="搜索分类..."
 *       />
 *       {data?.data.items.map(category => (
 *         <CategoryItem
 *           key={category.id}
 *           category={category}
 *         />
 *       ))}
 *       <Pagination
 *         currentPage={page}
 *         totalPages={Math.ceil((data?.data.total || 0) / 10)}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * 
 * function CategoryItem({ category }: { category: Category }) {
 *   const { mutate: deleteCategory } = useDeleteCategory();
 *   const { mutate: updateCategory } = useUpdateCategory(category.id);
 * 
 *   const handleDelete = () => {
 *     if (window.confirm('确定要删除这个分类吗？')) {
 *       deleteCategory(category.id);
 *     }
 *   };
 * 
 *   const handleStatusChange = (status: typeof CategoryStatus[keyof typeof CategoryStatus]) => {
 *     updateCategory({ status });
 *   };
 * 
 *   return (
 *     <div>
 *       <h2>{category.name}</h2>
 *       <p>{category.description}</p>
 *       <select
 *         value={category.status}
 *         onChange={(e) => handleStatusChange(Number(e.target.value))}
 *       >
 *         <option value={CategoryStatus.ACTIVE}>启用</option>
 *         <option value={CategoryStatus.INACTIVE}>禁用</option>
 *       </select>
 *       <button onClick={handleDelete}>删除</button>
 *     </div>
 *   );
 * }
 * ```
 */ 
