'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Paperclip, Trash2, Download, Loader2 } from 'lucide-react';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useActiveWorkspaceRole } from '@/features/workspaces';
import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from '../hooks';

export function AttachmentList({
  taskId,
  currentUserId,
}: {
  taskId: string;
  currentUserId?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(
    null
  );
  const role = useActiveWorkspaceRole();
  const canAttach = role !== 'VIEWER';

  const { data: attachments, isLoading } = useAttachments(taskId);
  const deleteAttachmentMutation = useDeleteAttachment(taskId);
  const { uploadFile, isUploading } = useUploadAttachment(taskId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadFile(file);
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
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/attachments/${attachment.id}`
                    );
                    if (!res.ok) throw new Error('Failed to get download URL');
                    const { url } = await res.json();
                    if (url) window.open(url, '_blank');
                  } catch (err) {
                    console.error('Error opening attachment:', err);
                  }
                }}
                className="flex items-center gap-2 overflow-hidden hover:text-blue-600 transition-colors text-left"
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
              </button>

              {(currentUserId === attachment.user.id ||
                role === 'OWNER' ||
                role === 'ADMIN') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttachmentToDelete(attachment.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-opacity h-8 w-8"
                  disabled={deleteAttachmentMutation.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {canAttach && (
        <div className="pt-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="block w-full">
            <Button
              variant="outline"
              className="hover:bg-blue-50 border-blue-200 w-full text-blue-600 cursor-pointer"
              render={<span />}
              nativeButton={false}
              disabled={uploading}
            >
              <span className="flex justify-center items-center">
                {uploading ? (
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="mr-2 w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Attach File'}
              </span>
            </Button>
          </label>
        </div>
      )}

      <ConfirmModal
        isOpen={!!attachmentToDelete}
        onClose={() => setAttachmentToDelete(null)}
        onConfirm={() => {
          if (attachmentToDelete)
            deleteAttachmentMutation.mutate(attachmentToDelete);
        }}
        title="Delete Attachment"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteAttachmentMutation.isPending}
      />
    </div>
  );
}
