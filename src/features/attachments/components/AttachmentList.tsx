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
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}-${Math.random()}.${fileExt}`;
      const filePath = `tasks/${fileName}`;

      const { error } = await supabase.storage
        .from('attachments') // Ensure this bucket exists in Supabase!
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('attachments').getPublicUrl(filePath);

      await addAttachmentMutation.mutateAsync({
        fileName: file.name,
        fileUrl: publicUrl,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert(
        'Failed to upload file. Make sure the "attachments" bucket exists and is public.'
      );
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-slate-800 text-sm">Attachments</h3>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs cursor-pointer"
              asChild
              disabled={uploading}
            >
              <span>
                {uploading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Paperclip className="w-3 h-3 mr-1" />
                )}
                {uploading ? 'Uploading...' : 'Attach File'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading attachments...</p>
        ) : attachments?.length === 0 ? (
          <p className="text-sm text-slate-500">No attachments.</p>
        ) : (
          attachments?.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100 group"
            >
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 overflow-hidden hover:text-blue-600 transition-colors"
              >
                <div className="bg-white p-1.5 rounded shadow-sm">
                  <Download size={14} className="text-slate-400" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate text-slate-700">
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
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  disabled={deleteAttachmentMutation.isPending}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
