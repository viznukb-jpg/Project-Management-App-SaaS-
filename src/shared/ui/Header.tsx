import Link from 'next/link';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { WorkspaceSwitcher } from '@/features/workspaces/components/WorkspaceSwitcher';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { HeaderNav } from './HeaderNav';

export async function Header() {
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (e) {
    console.error('Session error:', e);
  }
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.email === 'admin@example.com';

  return (
    <header className="top-0 z-50 sticky bg-white/80 shadow-sm backdrop-blur-md border-gray-100 border-b w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mx-auto px-4 sm:px-6 py-3 max-w-7xl min-h-[4rem]">
        {/* Logo & Switcher on the left */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            className="bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 font-extrabold text-transparent text-2xl tracking-tighter transition-opacity"
          >
            SaaSPro
          </Link>
          {isLoggedIn && <WorkspaceSwitcher />}
        </div>

        {/* Navigation Links on the right */}
        <nav className="flex flex-wrap items-center gap-2 md:gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="hover:bg-blue-50/50 px-3 py-2 rounded-md font-medium text-slate-600 hover:text-blue-600 text-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg px-5 py-2.5 rounded-full font-medium text-white text-lg transition-all duration-300"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <HeaderNav isAdmin={isAdmin} />
              <div className="pl-2 sm:pl-4 border-slate-200 border-l flex items-center gap-2">
                <NotificationBell />
                <LogoutButton />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
