export const projectKeys = {
  all: (workspaceId: string) => ['projects', workspaceId] as const,
  list: (workspaceId: string, search: string) =>
    ['projects', workspaceId, search] as const,
};
