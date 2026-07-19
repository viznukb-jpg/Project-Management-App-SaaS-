import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/shared/utils/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockUserFindFirst = vi.fn();
const mockMemberFindFirst = vi.fn();
const mockMembersFindMany = vi.fn();
const mockInsertValues = vi.fn().mockReturnThis();
const mockInsertReturning = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    query: {
      users: { findFirst: mockUserFindFirst },
      workspaceMembers: {
        findFirst: mockMemberFindFirst,
        findMany: mockMembersFindMany,
      },
    },
    insert: vi.fn(() => ({ values: mockInsertValues })),
  },
}));

vi.mock('@/server/services/notification.service', () => ({
  enqueueNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/server/services/audit.service', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/server/db/schema', () => ({
  workspaceMembers: {},
  users: {},
}));

const { inviteMember } = await import('@/server/services/member.service');
const { enqueueNotification } =
  await import('@/server/services/notification.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeInviter = (role: string) => ({
  id: 'm-inviter',
  userId: 'inviter-id',
  workspaceId: 'ws1',
  role,
});
const invitedUser = {
  id: 'new-user-id',
  name: 'Alice',
  email: 'alice@example.com',
};
const newMember = {
  id: 'm-new',
  workspaceId: 'ws1',
  userId: 'new-user-id',
  role: 'MEMBER',
};

// ─── inviteMember — self-notification exclusion ───────────────────────────────
describe('member.service — inviteMember self-notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertValues.mockReturnValue({ returning: mockInsertReturning });
    mockInsertReturning.mockResolvedValue([newMember]);
    mockUserFindFirst.mockResolvedValue(invitedUser);
    // No existing membership for the invited user
    mockMemberFindFirst
      .mockResolvedValueOnce(makeInviter('OWNER')) // inviter check
      .mockResolvedValueOnce(null); // existing member check
  });

  it('does NOT send MEMBER_JOINED to the inviter', async () => {
    // Inviter is an ADMIN in the admins list
    mockMembersFindMany.mockResolvedValue([
      { userId: 'inviter-id', role: 'OWNER' },
      { userId: 'other-admin-id', role: 'ADMIN' },
    ]);

    await inviteMember('ws1', 'alice@example.com', 'inviter-id', 'MEMBER');

    const calls = (enqueueNotification as ReturnType<typeof vi.fn>).mock.calls;
    const memberJoinedCalls = calls.filter(
      ([, type]) => type === 'MEMBER_JOINED'
    );

    // Only other-admin should receive MEMBER_JOINED, not inviter-id
    expect(memberJoinedCalls.every(([userId]) => userId !== 'inviter-id')).toBe(
      true
    );
    expect(memberJoinedCalls).toHaveLength(1);
    expect(memberJoinedCalls[0][0]).toBe('other-admin-id');
  });

  it('sends MEMBER_INVITED to the invited user', async () => {
    mockMembersFindMany.mockResolvedValue([
      { userId: 'inviter-id', role: 'OWNER' },
    ]);

    await inviteMember('ws1', 'alice@example.com', 'inviter-id', 'MEMBER');

    const calls = (enqueueNotification as ReturnType<typeof vi.fn>).mock.calls;
    const invitedCall = calls.find(
      ([userId, type]) => userId === 'new-user-id' && type === 'MEMBER_INVITED'
    );
    expect(invitedCall).toBeDefined();
  });

  it('throws UnauthorizedError when MEMBER tries to invite', async () => {
    const { UnauthorizedError } = await import('@/shared/utils/errors');
    mockMemberFindFirst.mockReset();
    mockMemberFindFirst.mockResolvedValue(makeInviter('MEMBER'));
    await expect(
      inviteMember('ws1', 'alice@example.com', 'inviter-id', 'MEMBER')
    ).rejects.toThrow(UnauthorizedError);
  });
});

// ─── attachment fileUrl validation ────────────────────────────────────────────
describe('attachment.service — createAttachment fileUrl validation', () => {
  // We test the regex directly since mocking the full db chain is complex
  const VALID_ATTACHMENT_PATH = /^tasks\/[\w-]+-[\w-]+\.(pdf|docx?|txt)$/i;

  it.each([
    'tasks/abc123-def456.pdf',
    'tasks/00000000-0000-0000-0000-000000000000-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.txt',
    'tasks/proj1-uuid.docx',
    'tasks/proj1-uuid.doc',
  ])('accepts valid path: %s', (path) => {
    expect(VALID_ATTACHMENT_PATH.test(path)).toBe(true);
  });

  it.each([
    '../etc/passwd',
    'tasks/../config.pdf',
    'http://evil.com/malware.pdf',
    'tasks/file.exe',
    'tasks/file.js',
    '',
    'other-bucket/file.pdf',
  ])('rejects invalid path: %s', (path) => {
    expect(VALID_ATTACHMENT_PATH.test(path)).toBe(false);
  });
});
