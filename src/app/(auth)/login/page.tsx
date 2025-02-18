import { login } from '@/models/user';
import { LoginForm } from './client';

export default function LoginPage() {
  return (
    <main className='min-h-screen flex items-center justify-center p-4 bg-background'>
      <LoginForm onSubmit={login} />
    </main>
  );
}
