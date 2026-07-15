import Link from 'next/link';

export default async function ProjectKanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Kanban Board for Project {resolvedParams.id}</h1>
      <Link href="/dashboard/projects" className="text-blue-500 underline mt-4 block">Back to Projects List</Link>
      <Link href="/" className="text-blue-500 underline mt-2 block">Back to Home</Link>
    </div>
  );
}
