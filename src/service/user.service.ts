/* eslint-disable @typescript-eslint/no-throw-literal */

'use server';

import {
	register,
	getUserById,
	getUserByEmail,
	updateUser,
	getUsers,
	countUsers,
	softDeleteUser as modelSoftDeleteUser,
	countUsersAddedLastWeek as modelCountUsersAddedLastWeek,
	countUsersAddedLast30Days as modelCountUsersAddedLast30Days,
	getUserRoleDistribution as modelGetUserRoleDistribution,
} from '@/models/user.model';
import type { UserRole } from '@/schema/user.schema';
import { hashPassword, verifyPassword } from '@/utils/password_crypto';
import { createToken } from '@/utils/jwt/token-utils';
import { cookies } from 'next/headers';
import { EmailExistsError } from '@/schema/errors.schema';

// 用户注册
export async function registerUser(
	email: string, // 用户邮箱
	password: string, // 用户密码
	name: string, // 用户姓名
	role: UserRole = 'student', // 用户角色，从 @/schema/user.schema.ts 导入的 UserRole 类型
	studentId?: string, // 学号（仅当角色为学生时需要填写）
) {
	const existingUser = await getUserByEmail(email);
	if (existingUser) {
		throw new EmailExistsError();
	}

	// 在服务层处理密码加密
	const passwordHash = await hashPassword(password);

	// 将加密后的密码传给模型层
	return await register(email, passwordHash, name, role, studentId);
}

// 用户登录
export async function loginUser(email: string, password: string) {
	// 检查用户是否存在
	const user = await getUserByEmail(email);
	if (!user) {
		throw new Error('User not found');
	}

	// 验证密码
	const isPasswordValid = await verifyPassword(password, user.passwordHash);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	// 生成 JWT
	const tokenPayload = {
		id: user.id.toString(),
		username: user.name,
		email: user.email,
	};
	const token = await createToken(tokenPayload);

	return { token, user }; // 返回 token 和用户信息
}

// 根据ID获取用户信息
export async function getUserInfo(userId: number) {
	return await getUserById(userId);
}

// 根据邮箱获取用户信息
export async function getUserByEmailService(email: string) {
	return await getUserByEmail(email);
}

// 用户更新自己的信息（不包含角色）
export async function updateUserProfileService(
	userId: number,
	data: {
		email?: string;
		password?: string;
		name?: string;
		status?: number;
	},
) {
	// 如果更新包含密码，需要先加密
	if (data.password) {
		data.password = await hashPassword(data.password);
	}

	// 如果更新邮箱，需要检查唯一性
	if (data.email) {
		const existingUser = await getUserByEmail(data.email);
		if (existingUser && existingUser.id !== userId) {
			throw new EmailExistsError();
		}
	}

	return await updateUser(userId, data);
}

// 管理员更新用户信息（包含角色）
export async function adminUpdateUserService(
	userId: number,
	data: {
		email?: string;
		password?: string;
		name?: string;
		role?: UserRole; // 使用 UserRole 类型
		status?: number;
	},
) {
	// 如果更新包含密码，需要先加密
	if (data.password) {
		data.password = await hashPassword(data.password);
	}

	// 如果更新邮箱，需要检查唯一性
	if (data.email) {
		const existingUser = await getUserByEmail(data.email);
		if (existingUser && existingUser.id !== userId) {
			throw new EmailExistsError();
		}
	}

	return await updateUser(userId, data);
}

// 获取用户列表
export async function getUserList(
	filters: any = {},
	pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 },
	status?: number,
	role?: UserRole,
	startDate?: Date,
	endDate?: Date,
	query?: string,
	lastActiveDate?: Date,
) {
	return await getUsers(
		filters,
		pagination,
		status,
		role,
		startDate,
		endDate,
		query,
		lastActiveDate,
	);
}

// 获取用户统计信息
export async function getUserStatistics() {
	return await countUsers();
}

// 软删除用户
export async function softDeleteUser(userId: number) {
	return await modelSoftDeleteUser(userId);
}

// 获取最近一周新增用户数量
export async function countUsersAddedLastWeek() {
	return await modelCountUsersAddedLastWeek();
}

// 获取最近30天新增用户数量
export async function countUsersAddedLast30Days() {
	return await modelCountUsersAddedLast30Days();
}

// 获取用户角色分布
export async function getUserRoleDistribution() {
	return await modelGetUserRoleDistribution();
}

// 新增服务端登录方法
export async function serverLoginUser(email: string, password: string) {
	// 检查用户是否存在
	const user = await getUserByEmail(email);
	if (!user) {
		throw '邮箱或密码错误';
	}

	// 验证密码
	const isPasswordValid = await verifyPassword(password, user.passwordHash);
	if (!isPasswordValid) {
		throw '邮箱或密码错误';
	}

	// 生成 JWT
	const tokenPayload = {
		id: user.id.toString(),
		username: user.name,
		email: user.email,
		role: user.role,
	};
	const token = await createToken(tokenPayload);

	// 设置 cookie
	cookies().set({
		name: 'token',
		value: token,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365, // 365天
	});

	return {
		success: true,
		data: {
			token,
			userId: user.id,
			role: user.role,
		},
	};
}

export async function changePassword(
	userId: number,
	oldPassword: string,
	newPassword: string,
) {
	// 1. 先获取用户信息
	const user = await getUserById(userId);
	if (!user) {
		throw new Error('用户不存在');
	}

	// 2. 验证原密码是否正确
	const isOldPasswordValid = await verifyPassword(
		oldPassword,
		user.passwordHash,
	);
	if (!isOldPasswordValid) {
		throw new Error('原密码错误');
	}

	// 3. 加密新密码
	const newPasswordHash = await hashPassword(newPassword);

	// 4. 更新密码
	return await updateUser(userId, { password: newPasswordHash });
}
