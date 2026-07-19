import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
} from '@/features/projects/schemas';
import { createTaskSchema, updateTaskSchema } from '@/features/tasks/schemas';
import { registerSchema, loginSchema } from '@/features/auth/schemas';

describe('Validators', () => {
  describe('Project Schemas', () => {
    it('validates createProjectSchema correctly', () => {
      expect(
        createProjectSchema.safeParse({
          name: 'Test Project',
          workspaceId: 'ws-123',
        }).success
      ).toBe(true);

      // missing workspaceId
      expect(
        createProjectSchema.safeParse({ name: 'Test Project' }).success
      ).toBe(false);

      // name too short
      expect(
        createProjectSchema.safeParse({ name: '', workspaceId: 'ws-123' })
          .success
      ).toBe(false);
    });

    it('validates updateProjectSchema correctly', () => {
      expect(
        updateProjectSchema.safeParse({ name: 'New Name', status: 'COMPLETED' })
          .success
      ).toBe(true);

      // invalid status
      expect(
        updateProjectSchema.safeParse({ status: 'INVALID_STATUS' }).success
      ).toBe(false);
    });
  });

  describe('Task Schemas', () => {
    it('validates createTaskSchema correctly', () => {
      expect(
        createTaskSchema.safeParse({
          projectId: 'proj-123',
          title: 'New Task',
          priority: 'HIGH',
        }).success
      ).toBe(true);

      // missing projectId
      expect(createTaskSchema.safeParse({ title: 'New Task' }).success).toBe(
        false
      );
    });

    it('validates updateTaskSchema correctly', () => {
      expect(
        updateTaskSchema.safeParse({
          status: 'DONE',
          priority: 'URGENT',
        }).success
      ).toBe(true);

      // invalid priority
      expect(updateTaskSchema.safeParse({ priority: 'LOWEST' }).success).toBe(
        false
      );
    });
  });

  describe('Auth Schemas', () => {
    it('validates registerSchema correctly', () => {
      expect(
        registerSchema.safeParse({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }).success
      ).toBe(true);

      // invalid email
      expect(
        registerSchema.safeParse({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        }).success
      ).toBe(false);

      // password too short
      expect(
        registerSchema.safeParse({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        }).success
      ).toBe(false);
    });

    it('validates loginSchema correctly', () => {
      expect(
        loginSchema.safeParse({
          email: 'john@example.com',
          password: 'password123',
        }).success
      ).toBe(true);

      // missing password
      expect(loginSchema.safeParse({ email: 'john@example.com' }).success).toBe(
        false
      );
    });
  });
});
