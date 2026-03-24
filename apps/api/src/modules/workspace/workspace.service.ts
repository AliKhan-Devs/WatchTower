import prisma from '../../config/prisma';

export const getWorkspace = async (userId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { userId },
    include: {
      apps: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          apiKey: true,
          createdAt: true,
          _count: {
            select: { metrics: true }
          }
        }
      }
    }
  });

  if (!workspace) throw new Error('Workspace not found');
  return workspace;
};

export const updateWorkspace = async (userId: string, name: string) => {
  const workspace = await prisma.workspace.update({
    where: { userId },
    data: { name }
  });
  return workspace;
};