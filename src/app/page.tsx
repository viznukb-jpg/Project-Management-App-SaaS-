import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import {
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-50 w-full overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white to-transparent h-40 pointer-events-none" />
        <div className="top-0 left-0 md:-left-24 absolute bg-blue-400/20 blur-3xl rounded-full w-72 md:w-96 h-72 md:h-96 pointer-events-none" />
        <div className="top-1/2 right-0 md:-right-24 absolute bg-indigo-400/20 blur-3xl rounded-full w-72 md:w-96 h-72 md:h-96 pointer-events-none" />

        <div className="z-10 relative mx-auto px-6 max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 bg-white shadow-sm mb-8 px-4 py-1.5 border border-blue-100 rounded-full font-semibold text-blue-700 text-sm">
            <span className="flex bg-blue-600 rounded-full w-2.5 h-2.5 animate-pulse"></span>
            Now in public beta
          </div>

          <h1 className="mx-auto mb-8 max-w-4xl font-extrabold text-slate-900 text-4xl sm:text-5xl md:text-7xl leading-tight md:leading-[1.1] tracking-tight">
            Manage your projects with{' '}
            <span className="bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent">
              ultimate clarity
            </span>
            .
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed">
            The all-in-one workspace for modern teams. Kanban boards, real-time
            activity feeds, and powerful admin controls to supercharge your
            workflow.
          </p>

          <div className="flex sm:flex-row flex-col justify-center items-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl px-8 rounded-full w-full sm:w-auto h-14 font-semibold text-base transition-all hover:-translate-y-0.5 duration-300"
              >
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-slate-50 px-8 border-slate-200 rounded-full w-full sm:w-auto h-14 font-semibold text-base transition-all duration-300"
              >
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-slate-100 border-t">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-slate-900 text-3xl md:text-4xl">
              Everything you need to ship faster
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600 text-lg">
              Built with modern teams in mind, SaaSPro provides the tools you
              need without the clutter.
            </p>
          </div>

          <div className="gap-8 md:gap-12 grid md:grid-cols-3">
            <div className="flex flex-col items-center bg-slate-50/50 hover:bg-slate-50 p-8 border border-slate-100 rounded-3xl text-center transition-colors">
              <div className="flex justify-center items-center bg-blue-50 shadow-sm mb-6 border border-blue-100 rounded-2xl w-16 h-16 text-blue-600">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="mb-3 font-bold text-slate-900 text-xl">
                Intuitive Kanban
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize tasks visually with our lightning-fast drag-and-drop
                boards.
              </p>
            </div>

            <div className="flex flex-col items-center bg-slate-50/50 hover:bg-slate-50 p-8 border border-slate-100 rounded-3xl text-center transition-colors">
              <div className="flex justify-center items-center bg-indigo-50 shadow-sm mb-6 border border-indigo-100 rounded-2xl w-16 h-16 text-indigo-600">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="mb-3 font-bold text-slate-900 text-xl">
                Secure & Scalable
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with fine-grained roles and
                permissions built-in.
              </p>
            </div>

            <div className="flex flex-col items-center bg-slate-50/50 hover:bg-slate-50 p-8 border border-slate-100 rounded-3xl text-center transition-colors">
              <div className="flex justify-center items-center bg-teal-50 shadow-sm mb-6 border border-teal-100 rounded-2xl w-16 h-16 text-teal-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="mb-3 font-bold text-slate-900 text-xl">
                Real-time Updates
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stay in sync with your team instantly. No page refreshing
                required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
