'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Paperclip, Trash2, Download, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Attachment = {
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

export function AttachmentList({
  taskId,
  currentUserId,
}: {
  taskId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: attachments, isLoading } = useQuery<Attachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/attachments?taskId=${taskId}`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      return res.json();
    },
  });

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

  const deleteAttachmentMutation = useMutation({
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

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
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="font-semibold text-slate-800 text-sm">Attachments</h3>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-slate-500 text-sm">Loading attachments...</p>
        ) : attachments?.length === 0 ? (
          <p className="text-slate-500 text-sm">No attachments.</p>
        ) : (
          attachments?.map((attachment) => (
            <div
              key={attachment.id}
              className="group flex justify-between items-center bg-slate-50 p-2 border border-slate-100 rounded-md"
            >
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 overflow-hidden hover:text-blue-600 transition-colors"
              >
                <div className="bg-white shadow-sm p-1.5 rounded">
                  <Download size={14} className="text-slate-400" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-slate-700 text-sm truncate">
                    {attachment.fileName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {attachment.fileSize
                      ? (attachment.fileSize / 1024).toFixed(1) + ' KB'
                      : 'Unknown size'}{' '}
                    • {attachment.user.name}
                  </span>
                </div>
              </a>

              {currentUserId === attachment.user.id && (
                <button
                  onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
                  disabled={deleteAttachmentMutation.isPending}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-2">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="w-full block">
          <Button
            variant="outline"
            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            render={<span />}
            nativeButton={false}
            disabled={uploading}
          >
            <span className="flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Attach File'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
