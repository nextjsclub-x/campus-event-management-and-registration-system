import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommentList, createComment, getComment, updateCommentStatus, deleteComment } from '@/api/comment';
import { useToast } from '@/hooks/use-toast';
import type { ListCommentsFilter } from '@/types/comment.types';
import type { PaginationOptions } from '@/types/pagination.types';
import type { Comment } from '@/schema/comment.schema';
import type { APIResponse } from '@/types/api-response.types';

/**
 * 获取评论列表的hook
 * @param params 查询参数
 * @param params.filters 过滤条件
 * @param params.pagination 分页参数
 */
export function useCommentList(params: {
  filters?: ListCommentsFilter;
  pagination?: Partial<PaginationOptions>;
}) {
  const { filters = {}, pagination = {} } = params;
  const { toast } = useToast();

  return useQuery({
    queryKey: [
      'comments',
      filters.status,
      filters.userId,
      pagination.page,
      pagination.limit,
      pagination.sortBy,
      pagination.order
    ],
    queryFn: () => getCommentList({ filters, pagination }),
    retry: false,
    staleTime: 1000 * 60 * 1, // 1分钟内不重新请求
  });
}

/**
 * 获取评论详情的hook
 */
export function useComment(id: number) {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: () => getComment(id),
    enabled: !!id,
    retry: false,
  });
}

/**
 * 更新评论状态的hook
 */
export function useUpdateCommentStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<Comment>,
    Error,
    { id: number; status: number }
  >({
    mutationFn: ({ id, status }) => updateCommentStatus(id, status),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '状态更新成功',
          description: response.data?.status === 1 ? '留言已通过' : '留言已驳回',
          variant: 'default',
        });
        // 更新成功后，使评论列表和详情缓存失效
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ 
          queryKey: ['comment', response.data?.id],
        });
      }
    },
    onError: (error) => {
      toast({
        title: '状态更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 删除评论的hook
 */
export function useDeleteComment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<{ message: string }>,
    Error,
    number
  >({
    mutationFn: (id) => deleteComment(id),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '删除成功',
          description: '留言已删除',
          variant: 'default',
        });
        // 删除成功后，使评论列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
    onError: (error) => {
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 创建评论的hook
 */
export function useCreateComment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<Comment>,
    Error,
    { userId: number; title: string; content: string }
  >({
    mutationFn: (data) => createComment(data),
    onSuccess: (response) => {
      if (response.code === 201) {
        toast({
          title: '评论创建成功',
          variant: 'default',
        });
        // 创建成功后，使评论列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
    onError: (error) => {
      toast({
        title: '评论创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 使用示例：
 * ```typescript
 * function CommentList() {
 *   const [page, setPage] = useState(1);
 *   const [status, setStatus] = useState<CommentStatusType>();
 * 
 *   const { data, isLoading } = useCommentList({
 *     filters: {
 *       status,
 *     },
 *     pagination: {
 *       page,
 *       limit: 10,
 *       sortBy: 'createdAt',
 *       order: 'desc'
 *     }
 *   });
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>评论列表</h1>
 *       {data?.data.items.map(comment => (
 *         <div key={comment.id}>
 *           <h2>{comment.title}</h2>
 *           <p>{comment.content}</p>
 *         </div>
 *       ))}
 *       <Pagination
 *         currentPage={page}
 *         totalPages={data?.data.totalPages || 1}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * 
 * function CreateCommentForm() {
 *   const { mutate: createComment, isLoading } = useCreateComment();
 * 
 *   const handleSubmit = (data: { title: string; content: string }) => {
 *     createComment({
 *       userId: 123, // 通常从用户上下文或 store 中获取
 *       ...data
 *     });
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="title" placeholder="标题" />
 *       <textarea name="content" placeholder="内容" />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? '提交中...' : '发表评论'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */ 
