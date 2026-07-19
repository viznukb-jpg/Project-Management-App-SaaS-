import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 text-center">
        <h1 className="font-bold text-2xl text-slate-800">
          Сторінку не знайдено
        </h1>
        <p className="text-slate-500 mt-2">
          Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-blue-600 hover:underline font-medium"
        >
          Повернутись на головну
        </Link>
      </div>
    </div>
  );
}
