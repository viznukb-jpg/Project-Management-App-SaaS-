'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { useActiveWorkspaceRole } from '@/features/workspaces';

export function HeaderNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const role = useActiveWorkspaceRole();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', className: '' },
    {
      name: 'Projects',
      href: '/dashboard/projects',
      className: 'hidden sm:block',
    },
    {
      name: 'Activity',
      href: '/dashboard/activity',
      className: 'hidden lg:block',
    },
  ];

  if (isAdmin || role === 'ADMIN' || role === 'OWNER') {
    navItems.push({
      name: 'Admin',
      href: '/dashboard/admin',
      className: 'hidden md:block',
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        // Exact match required for dashboard so it doesn't stay highlighted on sub-routes
        const isActuallyActive =
          item.href === '/dashboard' ? pathname === '/dashboard' : isActive;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'px-3 py-2 rounded-md font-medium text-sm transition-colors',
              isActuallyActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600',
              item.className
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
