import { create } from 'zustand';
import Cookies from 'js-cookie';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId:
    typeof window !== 'undefined'
      ? Cookies.get('activeWorkspaceId') || null
      : null,
  setActiveWorkspaceId: (id) => {
    Cookies.set('activeWorkspaceId', id, { expires: 365, path: '/' });
    set({ activeWorkspaceId: id });
  },
}));
