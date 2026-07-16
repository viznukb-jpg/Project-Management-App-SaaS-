import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Projects Page (CRUD)</h1>
      <Link
        href="/dashboard/projects/1"
        className="text-blue-500 underline mt-4 block"
      >
        View Project 1 (Kanban)
      </Link>
      <Link href="/dashboard" className="text-blue-500 underline mt-2 block">
        Back to Dashboard
      </Link>
      <Link href="/" className="text-blue-500 underline mt-2 block">
        Back to Home
      </Link>
    </div>
  );
}
