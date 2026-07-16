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
    <div className="w-full bg-slate-50 font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 md:-left-24 w-72 h-72 md:w-96 md:h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 md:-right-24 w-72 h-72 md:w-96 md:h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            Now in public beta
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight md:leading-[1.1]">
            Manage your projects with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ultimate clarity
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            The all-in-one workspace for modern teams. Kanban boards, real-time
            activity feeds, and powerful admin controls to supercharge your
            workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-blue-600 hover:bg-blue-700"
              >
                Start for free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-semibold bg-white hover:bg-slate-50 transition-all duration-300 border-slate-200"
              >
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with modern teams in mind, SaaSPro provides the tools you
              need without the clutter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Intuitive Kanban
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize tasks visually with our lightning-fast drag-and-drop
                boards.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Secure & Scalable
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with fine-grained roles and
                permissions built-in.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 shadow-sm border border-teal-100">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
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
