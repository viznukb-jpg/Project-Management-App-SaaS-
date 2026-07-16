'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/shared/ui/Button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        await authClient.signOut();
        router.push('/login');
      }}
      variant="ghost"
      className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
    >
      Sign out
    </Button>
  );
}
