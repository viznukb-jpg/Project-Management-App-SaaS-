import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Project Management SaaS (Scaffold)</h1>
      <nav className="flex flex-col gap-3">
        <Link href="/login" className="text-blue-500 underline">Login</Link>
        <Link href="/register" className="text-blue-500 underline">Register</Link>
        <Link href="/dashboard" className="text-blue-500 underline">Dashboard</Link>
        <Link href="/dashboard/projects" className="text-blue-500 underline">Projects List</Link>
        <Link href="/projects/1" className="text-blue-500 underline">Project Kanban Board (Test ID: 1)</Link>
        <Link href="/admin" className="text-blue-500 underline">Admin Panel</Link>
        <Link href="/activity" className="text-blue-500 underline">Activity Feed (Bonus)</Link>
      </nav>
    </div>
  );
}
