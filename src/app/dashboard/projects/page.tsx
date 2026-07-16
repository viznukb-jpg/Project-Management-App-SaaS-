import { ProjectList } from '@/features/projects/components/ProjectList';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            Manage and track your team's projects.
          </p>
        </div>
        <CreateProjectModal />
      </div>

      <ProjectList />
    </div>
  );
}
