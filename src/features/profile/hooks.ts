import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error updating profile');
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      return true;
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error deleting account');
    },
  });
};
