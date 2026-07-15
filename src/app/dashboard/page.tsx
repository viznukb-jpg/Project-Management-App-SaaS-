import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard Page</h1>
      <Link href="/dashboard/projects" className="text-blue-500 underline mt-4 block">Go to Projects</Link>
      <Link href="/" className="text-blue-500 underline mt-2 block">Back to Home</Link>
    </div>
  );
}
