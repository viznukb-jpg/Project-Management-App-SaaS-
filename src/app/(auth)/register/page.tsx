import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 p-4 min-h-screen">
      <div className="mb-6 w-full max-w-md text-center">
        <h1 className="font-bold text-3xl">Create an Account</h1>
        <p className="mt-2 text-gray-500">
          Get started with Project Management SaaS
        </p>
      </div>

      <div className="w-full max-w-md">
        <RegisterForm />
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>

      <Link href="/" className="block mt-8 text-blue-500 underline">
        Back to Home
      </Link>
    </div>
  );
}
