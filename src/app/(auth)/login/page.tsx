import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Sign in to your account</p>
      </div>

      <div className="w-full max-w-md">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>

      <Link href="/" className="text-blue-500 underline mt-8 block">
        Back to Home
      </Link>
    </div>
  );
}
