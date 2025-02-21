import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { Comment, NewComment } from '@/schema/comment.schema';

/**
 * 创建新评论
 * @param data - 评论数据，包含用户ID、标题、内容等
 * @returns 返回创建成功的评论对象
 */
export async function createComment(data: NewComment): Promise<Comment> {
  const [comment] = await db.insert(comments)
    .values({
      ...data,
      createdAt: new Date()
    })
    .returning();
  
  return comment;
} 
