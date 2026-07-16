import Link from 'next/link';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isLoggedIn = !!session;

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Link
          href="/"
          className="text-xl font-extrabold text-blue-600 tracking-tight"
        >
          SaaSPro
        </Link>
      </div>

      {/* Navigation Links on the right */}
      <nav className="flex items-center gap-6">
        {!isLoggedIn ? (
          <>
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/dashboard/admin"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/dashboard/activity"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Activity
            </Link>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  );
}
