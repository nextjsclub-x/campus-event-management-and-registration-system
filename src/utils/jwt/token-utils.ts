// src/utils/token-utils.ts

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { JWT_SECRET_KEY } from '@/constants/jwt.config';

export interface UserPayload extends JWTPayload {
  id: string;
  name: string;
}

export async function createToken(payload: UserPayload): Promise<string> {
  const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d') // token 有效期設置為 365 天
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<UserPayload> {
  const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

  const { payload } = await jwtVerify(token, secretKey);

  // 檢查 payload 是否包含所需的字段
  if (
    typeof payload.id !== 'string'
    || typeof payload.username !== 'string'
    || typeof payload.email !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    id: payload.id,
    name: payload.username,
    email: payload.email,
    ...payload, // 包含其他可能的 JWTPayload 字段
  };
}
