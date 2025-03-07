'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, hashPassword } from '@/utils/password_crypto';

/**
 * 修改用户密码
 * @param userId 用户ID
 * @param currentPassword 当前密码
 * @param newPassword 新密码
 * @returns 更新成功返回true
 * @throws Error 当密码验证失败或用户不存在时
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    // 1. 查找用户
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number.parseInt(userId, 10)))
        .limit(1);

    if (!user) {
        throw new Error('用户不存在');
    }

    // 2. 验证当前密码
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('当前密码错误');
    }

    // 3. 加密新密码
    const newPasswordHash = await hashPassword(newPassword);

    // 4. 更新密码
    await db
        .update(users)
        .set({
            passwordHash: newPasswordHash,
            updatedAt: new Date()
        })
        .where(eq(users.id, Number.parseInt(userId, 10)));

    return true;
} 
