import { describe, it, expect, vi } from 'vitest';
import { handleRouteError } from '@/shared/utils/handleRoute';
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
} from '@/shared/utils/errors';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => ({ body, status: init?.status })),
    },
  };
});

describe('Utils', () => {
  describe('Error Classes', () => {
    it('AppError creates an error with status and message', () => {
      const error = new AppError('Custom Error', 400);
      expect(error.message).toBe('Custom Error');
      expect(error.status).toBe(400);
      expect(error).toBeInstanceOf(Error);
    });

    it('UnauthorizedError creates a 401/403 error', () => {
      const err1 = new UnauthorizedError();
      expect(err1.message).toBe('Unauthorized');
      expect(err1.status).toBe(403);

      const err2 = new UnauthorizedError('Custom Unauthorized Message');
      expect(err2.message).toBe('Custom Unauthorized Message');
    });

    it('NotFoundError creates a 404 error', () => {
      const err = new NotFoundError('Project not found');
      expect(err.message).toBe('Project not found');
      expect(err.status).toBe(404);
    });
  });

  describe('handleRouteError', () => {
    it('handles ZodError and returns 400', () => {
      const zodSchema = z.object({ name: z.string().min(5) });
      const parseResult = zodSchema.safeParse({ name: 'abc' });

      if (!parseResult.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = handleRouteError(parseResult.error) as any;
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
        expect(NextResponse.json).toHaveBeenCalled();
      }
    });

    it('handles AppError and returns its status', () => {
      const appError = new AppError('Business Logic Error', 409);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = handleRouteError(appError) as any;
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Business Logic Error');
    });

    it('handles generic Error and returns 500', () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Something went wrong');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = handleRouteError(genericError) as any;

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(consoleSpy).toHaveBeenCalledWith(genericError);

      consoleSpy.mockRestore();
    });
  });
});
