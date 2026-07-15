import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="font-bold text-2xl">Page Not Found (not-found.tsx)</h1>
      <Link href="/" className="block mt-4 text-blue-500 underline">
        Go Home
      </Link>
    </div>
  );
}
