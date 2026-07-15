import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="mt-2">Users count, Projects count, Tasks count, Active workspaces</p>
      <Link href="/" className="text-blue-500 underline mt-4 block">Back to Home</Link>
    </div>
  );
}
