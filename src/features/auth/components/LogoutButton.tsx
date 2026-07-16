'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/shared/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

export function LogoutButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      router.push('/login');
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
      >
        Sign out
      </Button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        isLoading={isLoading}
      />
    </>
  );
}
