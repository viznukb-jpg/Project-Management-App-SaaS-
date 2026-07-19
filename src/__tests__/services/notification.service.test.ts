import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedError } from '@/shared/utils/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNotifFindFirst = vi.fn();
const mockNotifUpdate = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    query: {
      notifications: { findFirst: mockNotifFindFirst },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({ where: mockNotifUpdate })),
    })),
  },
}));

vi.mock('@/server/queue', () => ({
  notificationQueue: {
    add: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/server/db/schema', () => ({
  notifications: {},
}));

const { markAsRead, enqueueNotification } =
  await import('@/server/services/notification.service');

// ─── markAsRead ───────────────────────────────────────────────────────────────
describe('notification.service — markAsRead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks notification as read for the correct user', async () => {
    mockNotifFindFirst.mockResolvedValue({ id: 'n1', userId: 'user1' });
    mockNotifUpdate.mockResolvedValue(undefined);
    await expect(markAsRead('n1', 'user1')).resolves.toBe(true);
  });

  it('throws UnauthorizedError if notification belongs to a different user', async () => {
    mockNotifFindFirst.mockResolvedValue({ id: 'n1', userId: 'user2' });
    await expect(markAsRead('n1', 'user1')).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError if notification does not exist', async () => {
    mockNotifFindFirst.mockResolvedValue(null);
    await expect(markAsRead('n1', 'user1')).rejects.toThrow(UnauthorizedError);
  });
});

// ─── enqueueNotification ─────────────────────────────────────────────────────
describe('notification.service — enqueueNotification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enqueues a notification job with correct data', async () => {
    const { notificationQueue } = await import('@/server/queue');
    await enqueueNotification('user1', 'TASK_ASSIGNED', 'You have a new task');
    expect(notificationQueue.add).toHaveBeenCalledWith('TASK_ASSIGNED', {
      userId: 'user1',
      type: 'TASK_ASSIGNED',
      message: 'You have a new task',
    });
  });
});
