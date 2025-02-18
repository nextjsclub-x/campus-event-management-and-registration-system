import { register } from '@/models/user';
import { RegisterForm } from './client';

export default function RegisterPage() {
  return (
    <main className='min-h-screen flex items-center justify-center p-4 bg-background'>
      <RegisterForm onSubmit={register} />
    </main>
  );
}
