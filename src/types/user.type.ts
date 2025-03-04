import type { JWTPayload } from 'jose';
import type { UserRole as SchemaUserRole } from '@/schema/user.schema';
import type { PaginationInfo } from '@/types/registration.types';

/**
 * 用户角色类型
 */
export type UserRole = SchemaUserRole;

/**
 * 用户信息
 */
export interface UserInfo {
	id: number;
	email: string;
	name: string;
	role: UserRole;
	studentId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * 用户列表项
 */
export interface UserListItem extends UserInfo {
	activityCount: number;
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
	users: UserListItem[];
	pagination: PaginationInfo;
}

/**
 * 用户注册请求
 */
export interface UserRegisterRequest {
	email: string;
	password: string;
	name: string;
	studentId?: string;
}

/**
 * 用户更新密码请求
 */
export interface UserUpdatePasswordRequest {
	oldPassword: string;
	newPassword: string;
}

// JWT Payload 用户信息接口
export interface UserPayload extends JWTPayload {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	studentId: string | null;
}

