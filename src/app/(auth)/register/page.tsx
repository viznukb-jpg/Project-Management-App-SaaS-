import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Register Page</h1>
      <Link href="/" className="text-blue-500 underline mt-4 block">Back to Home</Link>
    </div>
  );
}
