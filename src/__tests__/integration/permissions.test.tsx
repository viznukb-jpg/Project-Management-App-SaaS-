import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberManagement } from '@/features/members/components/MemberManagement';

// Mocks
vi.mock('@/features/workspaces', () => ({
  useActiveWorkspaceRole: vi.fn(),
}));

vi.mock('../hooks', () => ({
  useWorkspaceMembers: vi.fn(() => ({
    data: { pages: [{ data: [] }] },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
  useInviteMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRemoveMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateMemberRole: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useActiveWorkspaceRole } from '@/features/workspaces';

describe('Permissions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MemberManagement Component', () => {
    it('shows invite form for OWNER', () => {
      vi.mocked(useActiveWorkspaceRole).mockReturnValue('OWNER');
      render(<MemberManagement workspaceId="ws-123" />);

      expect(
        screen.getByRole('button', { name: /invite/i })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/user email address/i)
      ).toBeInTheDocument();
    });

    it('shows invite form for ADMIN', () => {
      vi.mocked(useActiveWorkspaceRole).mockReturnValue('ADMIN');
      render(<MemberManagement workspaceId="ws-123" />);

      expect(
        screen.getByRole('button', { name: /invite/i })
      ).toBeInTheDocument();
    });

    it('hides invite form for MEMBER', () => {
      vi.mocked(useActiveWorkspaceRole).mockReturnValue('MEMBER');
      render(<MemberManagement workspaceId="ws-123" />);

      expect(
        screen.queryByRole('button', { name: /invite/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/user email address/i)
      ).not.toBeInTheDocument();
    });

    it('hides invite form for VIEWER', () => {
      vi.mocked(useActiveWorkspaceRole).mockReturnValue('VIEWER');
      render(<MemberManagement workspaceId="ws-123" />);

      expect(
        screen.queryByRole('button', { name: /invite/i })
      ).not.toBeInTheDocument();
    });
  });
});
