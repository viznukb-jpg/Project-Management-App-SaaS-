import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/shared/utils/auth-client', () => ({
  authClient: {
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
  },
}));

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/shared/utils/auth-client';

describe('Auth Flow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe('LoginForm', () => {
    it('shows validation errors for empty fields', async () => {
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        expect(
          screen.getByText(/Required|Password is required/)
        ).toBeInTheDocument();
      });
      expect(authClient.signIn.email).not.toHaveBeenCalled();
    });

    it('submits form successfully and redirects', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
        data: { user: { id: '1' } },
        error: null,
      } as any);
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authClient.signIn.email).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('/dashboard');
        expect(router.refresh).toHaveBeenCalled();
      });
    });

    it('handles auth error gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid credentials' },
      } as any);
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authClient.signIn.email).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        const router = useRouter();
        expect(router.push).not.toHaveBeenCalled();
      });
    });
  });

  describe('RegisterForm', () => {
    it('shows validation errors for invalid inputs', async () => {
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Required|Name must be at least 2 characters/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Required|Invalid email address/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Required|Password must be at least 6 characters/)
        ).toBeInTheDocument();
      });
    });

    it('submits form successfully and redirects', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(authClient.signUp.email).mockResolvedValueOnce({
        data: { user: { id: '1' } },
        error: null,
      } as any);
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(authClient.signUp.email).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });
        expect(toast.success).toHaveBeenCalledWith('Registration successful!');
        const router = useRouter();
        expect(router.push).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
