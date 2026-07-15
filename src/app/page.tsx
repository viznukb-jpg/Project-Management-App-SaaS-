import Link from 'next/link';
import { Button } from '@/shared/ui/Button';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Project Management SaaS (Scaffold)
      </h1>

      <div className="mb-6">
        <Button>Shadcn Button Works!</Button>
      </div>

      <nav className="flex flex-col gap-3">
        <Link
          href="/login"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Register
        </Link>
        <Link
          href="/dashboard"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/projects"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Projects List
        </Link>
        <Link
          href="/projects/1"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Project Kanban Board (Test ID: 1)
        </Link>
        <Link
          href="/admin"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Admin Panel
        </Link>
        <Link
          href="/activity"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Activity Feed (Bonus)
        </Link>
      </nav>
    </div>
  );
}
