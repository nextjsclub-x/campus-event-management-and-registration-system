import { register } from '@/models/user/register';
import type { UserRegisterRequest } from '@/types/user.type';
import { RegisterClient } from './client';

async function handleRegister(data: UserRegisterRequest) {
	'use server';

	await register(data);
}

export default function RegisterPage() {
	return <RegisterClient onSubmit={handleRegister} />;
}
