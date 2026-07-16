import Link from 'next/link';

export default async function ProjectKanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div className="p-8">
      <h1 className="font-bold text-2xl">
        Kanban Board for Project {resolvedParams.id}
      </h1>
      <Link
        href="/dashboard/projects"
        className="block mt-4 text-blue-500 underline"
      >
        Back to Projects List
      </Link>
      <Link href="/" className="block mt-2 text-blue-500 underline">
        Back to Home
      </Link>
    </div>
  );
}
