import { ProfileForm } from '@/features/profile';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
