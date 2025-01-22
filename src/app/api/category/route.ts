import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory, updateCategory } from '@/models/category.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    // 参数验证
    if (!name) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供分类名称',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层的createCategory方法创建新分类
    const category = await createCategory({ name, description });

    const res: APIJsonResponse = {
      code: APIStatusCode.CREATED,
      message: '创建分类成功',
      data: category
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `创建分类失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();

    // 参数验证
    if (!id) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供分类ID',
        data: null
      };
      return NextResponse.json(res);
    }

    if (!name) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供分类名称',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层的updateCategory方法更新分类
    const result = await updateCategory(id, { name, description });

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '更新分类成功',
      data: result
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理特定错误
    if (error.message === 'Category not found') {
      const res: APIJsonResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '分类不存在',
        data: null
      };
      return NextResponse.json(res);
    }

    if (error.message === 'Category name already exists') {
      const res: APIJsonResponse = {
        code: APIStatusCode.CONFLICT,
        message: '分类名称已存在',
        data: null
      };
      return NextResponse.json(res);
    }

    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `更新分类失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}

export async function GET(request: NextRequest) {
  try {
    // 调用model层的getCategories方法获取分类列表
    const categories = await getCategories();

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取分类列表成功',
      data: {
        categories,
        total: categories.length
      }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取分类列表失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
