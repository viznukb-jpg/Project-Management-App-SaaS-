import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/utils/supabase/client';

export type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export function useAttachments(taskId: string) {
  return useQuery<Attachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/attachments?taskId=${taskId}`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      return res.json();
    },
  });
}

export function useDeleteAttachment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete attachment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
  });
}

export function useUploadAttachment(taskId: string) {
  const queryClient = useQueryClient();

  const addAttachmentMutation = useMutation({
    mutationFn: async (data: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }) => {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, ...data }),
      });
      if (!res.ok) throw new Error('Failed to save attachment info');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
  });

  const uploadFile = async (file: File) => {
    // 1. Get Signed URL from server
    const urlRes = await fetch('/api/attachments/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!urlRes.ok) {
      const errorData = await urlRes.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const { token, path } = await urlRes.json();

    // 2. Upload to Supabase using Signed URL
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .uploadToSignedUrl(path, token, file);

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('attachments').getPublicUrl(path);

    // 4. Save metadata to our DB
    await addAttachmentMutation.mutateAsync({
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
    });
  };

  return { uploadFile, isUploading: addAttachmentMutation.isPending };
}
