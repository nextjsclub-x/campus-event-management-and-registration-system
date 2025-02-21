import type { NextRequest } from 'next/server';
import { createNotification } from '@/models/notification';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

const createSchema = z.object({
  userId: z.number(),
  activityId: z.number(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = createSchema.parse(body);

    const notification = await createNotification(
      validatedBody.userId,
      validatedBody.activityId,
      validatedBody.message
    );

    const response: APIResponse = {
      code: APIStatusCode.CREATED,
      message: '创建通知成功',
      data: notification,
    };
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('创建通知失败:', error);

    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '参数验证失败',
        data: error.errors,
      };
      return Response.json(response, { status: 400 });
    }

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '创建通知失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
