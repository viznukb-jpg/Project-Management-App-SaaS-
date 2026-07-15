import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-gray-500 mt-2">
          Get started with Project Management SaaS
        </p>
      </div>

      <div className="w-full max-w-md">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>

      <Link href="/" className="text-blue-500 underline mt-8 block">
        Back to Home
      </Link>
    </div>
  );
}
