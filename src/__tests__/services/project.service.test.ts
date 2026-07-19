import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedError } from '@/shared/utils/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockMemberFindFirst = vi.fn();
const mockProjectFindFirst = vi.fn();
const mockInsertValues = vi.fn().mockReturnThis();
const mockInsertReturning = vi.fn();
const mockUpdateSet = vi.fn().mockReturnThis();
const mockUpdateWhere = vi.fn().mockReturnThis();
const mockUpdateReturning = vi.fn();
const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);

vi.mock('@/server/db', () => ({
  db: {
    query: {
      workspaceMembers: { findFirst: mockMemberFindFirst },
      projects: { findFirst: mockProjectFindFirst },
    },
    insert: vi.fn(() => ({ values: mockInsertValues })),
    update: vi.fn(() => ({ set: mockUpdateSet })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  },
}));

vi.mock('@/server/services/audit.service', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/server/db/schema', () => ({
  projects: {},
  workspaceMembers: {},
}));

// Import AFTER mocks are registered
const { createProject, updateProject, deleteProject } =
  await import('@/server/services/project.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeMember = (role: string) => ({
  id: 'm1',
  userId: 'user1',
  workspaceId: 'ws1',
  role,
});

const stubCreatedProject = { id: 'proj1', name: 'Test', workspaceId: 'ws1' };
const existingProject = { id: 'proj1', workspaceId: 'ws1', name: 'Old' };

// ─── createProject ────────────────────────────────────────────────────────────
describe('project.service — createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertValues.mockReturnValue({ returning: mockInsertReturning });
    mockInsertReturning.mockResolvedValue([stubCreatedProject]);
  });

  it.each(['OWNER', 'ADMIN'])('allows %s to create a project', async (role) => {
    mockMemberFindFirst.mockResolvedValue(makeMember(role));
    await expect(
      createProject('ws1', 'Test', null, 'user1')
    ).resolves.toMatchObject({
      id: 'proj1',
    });
  });

  it.each(['MEMBER', 'VIEWER'])(
    'blocks %s from creating a project',
    async (role) => {
      mockMemberFindFirst.mockResolvedValue(makeMember(role));
      await expect(createProject('ws1', 'Test', null, 'user1')).rejects.toThrow(
        UnauthorizedError
      );
    }
  );

  it('blocks non-members from creating a project', async () => {
    mockMemberFindFirst.mockResolvedValue(null);
    await expect(createProject('ws1', 'Test', null, 'user1')).rejects.toThrow(
      UnauthorizedError
    );
  });
});

// ─── updateProject ────────────────────────────────────────────────────────────
describe('project.service — updateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockReturnValue({ returning: mockUpdateReturning });
    mockUpdateReturning.mockResolvedValue([
      { ...existingProject, name: 'New' },
    ]);
  });

  it.each(['OWNER', 'ADMIN'])('allows %s to update a project', async (role) => {
    mockProjectFindFirst.mockResolvedValue(existingProject);
    mockMemberFindFirst.mockResolvedValue(makeMember(role));
    await expect(
      updateProject('proj1', { name: 'New' }, 'user1')
    ).resolves.toMatchObject({
      name: 'New',
    });
  });

  it.each(['MEMBER', 'VIEWER'])(
    'blocks %s from updating a project',
    async (role) => {
      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockMemberFindFirst.mockResolvedValue(makeMember(role));
      await expect(
        updateProject('proj1', { name: 'New' }, 'user1')
      ).rejects.toThrow(UnauthorizedError);
    }
  );
});

// ─── deleteProject ────────────────────────────────────────────────────────────
describe('project.service — deleteProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(['OWNER', 'ADMIN'])('allows %s to delete a project', async (role) => {
    mockProjectFindFirst.mockResolvedValue(existingProject);
    mockMemberFindFirst.mockResolvedValue(makeMember(role));
    await expect(deleteProject('proj1', 'user1')).resolves.toBe(true);
  });

  it.each(['MEMBER', 'VIEWER'])(
    'blocks %s from deleting a project',
    async (role) => {
      mockProjectFindFirst.mockResolvedValue(existingProject);
      mockMemberFindFirst.mockResolvedValue(makeMember(role));
      await expect(deleteProject('proj1', 'user1')).rejects.toThrow(
        UnauthorizedError
      );
    }
  );
});
