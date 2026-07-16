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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[4rem] py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo on the left */}
        <div className="flex items-center shrink-0">
          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            SaaSPro
          </Link>
        </div>

        {/* Navigation Links on the right */}
        <nav className="flex items-center flex-wrap gap-2 md:gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-lg font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50/50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50 hidden sm:block"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/admin"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50 hidden md:block"
                >
                  Admin
                </Link>
                <Link
                  href="/dashboard/activity"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50 hidden lg:block"
                >
                  Activity
                </Link>
              </div>
              <div className="pl-2 sm:pl-4 border-l border-slate-200">
                <LogoutButton />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
