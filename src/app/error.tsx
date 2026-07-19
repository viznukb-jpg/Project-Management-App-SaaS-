'use client';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/Button';

export default function Error({
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
    <div className="p-8 text-center">
      <h2 className="font-bold text-xl text-red-600">Щось пішло не так</h2>
      <p className="text-slate-500 mt-2">{error.message}</p>
      <Button onClick={() => reset()} className="mt-4">
        Спробувати ще раз
      </Button>
    </div>
  );
}
