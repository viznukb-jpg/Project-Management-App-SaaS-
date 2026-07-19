'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/shared/utils/auth-client';
import { LogOut, User } from 'lucide-react';

interface UserAvatarProps {
  name: string;
}

export function UserAvatar({ name }: UserAvatarProps) {
  const router = useRouter();
  const initials = name.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
          router.push('/login');
        },
      },
    });
  };

  return (
    <div className="relative group inline-block">
      <Link
        href="/dashboard/profile"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm hover:bg-blue-700 hover:shadow-md transition-all shrink-0 cursor-pointer"
        title="View Profile"
      >
        {initials}
      </Link>

      {/* Hover Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
        </div>
        <div className="p-1">
          <Link
            href="/dashboard/profile"
            className="flex items-center w-full px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors text-left"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
