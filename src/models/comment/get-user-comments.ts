import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';

interface GetUserCommentsParams {
  userId: number;
  page?: number;
  pageSize?: number;
}

export async function getUserComments({ userId, page = 1, pageSize = 10 }: GetUserCommentsParams) {
  const offset = (page - 1) * pageSize;
  
  const [commentsList, [{ count }]] = await Promise.all([
    db.select()
      .from(comments)
      .where(
        and(
          eq(comments.userId, userId),
          isNull(comments.deletedAt)
        )
      )
      .limit(pageSize)
      .offset(offset),
    
    db.select({
      count: sql<number>`cast(count(*) as integer)`
    })
      .from(comments)
      .where(
        and(
          eq(comments.userId, userId),
          isNull(comments.deletedAt)
        )
      )
  ]);

  return {
    data: commentsList,
    pagination: {
      total: count,
      page,
      pageSize,
    }
  };
} 
