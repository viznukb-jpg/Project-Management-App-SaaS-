import Link from 'next/link';

export default function ActivityPage() {
  return (
    <div className="p-8">
      <h1 className="font-bold text-2xl">Activity Feed</h1>
      <p className="mt-2">Shows recent actions by users.</p>
      <Link href="/" className="block mt-4 text-blue-500 underline">
        Back to Home
      </Link>
    </div>
  );
}
