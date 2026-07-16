'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [name, setName] = useState(session?.user?.name || '');
  const [hasSynced, setHasSynced] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sync state once session is loaded
  useEffect(() => {
    if (session?.user?.name && !hasSynced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(session.user.name);
      setHasSynced(true);
    }
  }, [session?.user?.name, hasSynced]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');

      toast.success('Profile updated successfully');
      // Refresh the page or session to reflect changes
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error updating profile'
      );
    } finally {
      setIsUpdating(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      // Account deleted, effectively signed out on backend
      await authClient.signOut();
      router.refresh();
      router.push('/login');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error deleting account'
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-8 text-center text-slate-500">Not authenticated.</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          General Information
        </h2>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl shadow-sm">
            {session.user.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {session.user.name}
            </div>
            <div className="text-slate-500 text-sm">{session.user.email}</div>
          </div>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isUpdating}
            />
          </div>
          <Button
            type="submit"
            disabled={
              isUpdating || name.trim().length < 2 || name === session.user.name
            }
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          Account Actions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-900 mb-1">Sign Out</h3>
            <p className="text-sm text-slate-500 mb-3">
              Log out of your current session on this device.
            </p>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-medium text-red-600 mb-1">Delete Account</h3>
            <p className="text-sm text-slate-500 mb-3">
              Permanently remove your account and all associated data. This
              action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? All your personal data, workspaces, and projects will be permanently removed. This action cannot be undone."
        confirmText="Delete Account"
        isLoading={isDeleting}
      />
    </div>
  );
}
