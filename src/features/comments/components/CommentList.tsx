'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Trash2 } from 'lucide-react';

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
}: {
  taskId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

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
          <p className="text-sm text-slate-500">
            No comments yet. Be the first to comment!
          </p>
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
                <p className="text-slate-600 text-sm">{comment.content}</p>
              </div>

              {currentUserId === comment.user.id && (
                <button
                  onClick={() => deleteCommentMutation.mutate(comment.id)}
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
    </div>
  );
}
