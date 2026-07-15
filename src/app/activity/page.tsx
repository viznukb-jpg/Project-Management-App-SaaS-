import Link from 'next/link';

export default function ActivityPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Activity Feed</h1>
      <p className="mt-2">Shows recent actions by users.</p>
      <Link href="/" className="text-blue-500 underline mt-4 block">Back to Home</Link>
    </div>
  );
}
