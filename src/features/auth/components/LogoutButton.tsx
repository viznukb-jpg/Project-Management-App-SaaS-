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
      className="text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
    >
      Logout
    </Button>
  );
}
