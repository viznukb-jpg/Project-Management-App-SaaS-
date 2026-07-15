import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Page Not Found (not-found.tsx)</h1>
      <Link href="/" className="text-blue-500 underline mt-4 block">Go Home</Link>
    </div>
  );
}
