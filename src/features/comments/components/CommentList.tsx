'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useActiveWorkspaceRole } from '@/features/workspaces/hooks';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export function CommentList({
  taskId,
  currentUserId,
  projectId,
  isModal = false,
}: {
  taskId: string;
  currentUserId?: string;
  projectId?: string;
  isModal?: boolean;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const role = useActiveWorkspaceRole();
  const canComment = role !== 'VIEWER';

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?taskId=${taskId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, content }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setContent('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setCommentToDelete(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate(content);
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-semibold text-slate-800 text-sm border-b pb-2">
        Comments
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments?.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          comments?.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 p-3 rounded-md flex justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800 text-sm">
                    {comment.user.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>

              {(currentUserId === comment.user.id ||
                role === 'OWNER' ||
                role === 'ADMIN') && (
                <button
                  onClick={() => setCommentToDelete(comment.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={deleteCommentMutation.isPending}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {isModal && projectId ? (
        <div className="pt-2">
          <Link
            href={`/dashboard/projects/${projectId}/tasks/${taskId}/comments`}
          >
            <Button
              variant="outline"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View full comments page
            </Button>
          </Link>
        </div>
      ) : canComment ? (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <Input
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={addCommentMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!content.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      ) : null}

      <ConfirmModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => {
          if (commentToDelete) deleteCommentMutation.mutate(commentToDelete);
        }}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
}
