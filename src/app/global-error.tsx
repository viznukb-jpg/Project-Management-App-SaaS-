'use client';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <h2 className="font-bold text-2xl text-red-600">
              Критична помилка
            </h2>
            <p className="text-slate-500 mt-2 max-w-md">{error.message}</p>
            <Button onClick={() => reset()} className="mt-6">
              Спробувати ще раз
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
