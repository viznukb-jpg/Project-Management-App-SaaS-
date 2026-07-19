export const taskKeys = {
  all: (projectId: string) => ['tasks', projectId] as const,
  list: (projectId: string, search: string) =>
    ['tasks', projectId, search] as const,
};
