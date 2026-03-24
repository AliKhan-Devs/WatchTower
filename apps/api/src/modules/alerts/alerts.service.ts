import prisma from '../../config/prisma';

const verifyAppOwnership = async (userId: string, appId: string) => {
  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace) throw new Error('Workspace not found');
  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId: workspace.id } });
  if (!app) throw new Error('App not found');
  return app;
};

export const createAlert = async (
  userId: string,
  appId: string,
  type: 'ERROR_RATE' | 'RESPONSE_TIME' | 'UPTIME',
  threshold: number,
  cooldownMins: number = 15,
  webhookUrl?: string,
  email?: string
) => {
  await verifyAppOwnership(userId, appId);

  if (!webhookUrl && !email) {
    throw new Error('At least one of webhookUrl or email is required');
  }

  return prisma.alert.create({
    data: { appId, type, threshold, cooldownMins, webhookUrl, email }
  });
};

export const getAlerts = async (userId: string, appId: string) => {
  await verifyAppOwnership(userId, appId);
  return prisma.alert.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateAlert = async (
  userId: string,
  alertId: string,
  data: Partial<{
    threshold: number;
    webhookUrl: string;
    email: string;
    cooldownMins: number;
    isActive: boolean;
  }>
) => {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { app: { include: { workspace: true } } }
  });

  if (!alert) throw new Error('Alert not found');

  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace || alert.app.workspace.id !== workspace.id) {
    throw new Error('Alert not found');
  }

  return prisma.alert.update({ where: { id: alertId }, data });
};

export const deleteAlert = async (userId: string, alertId: string) => {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { app: { include: { workspace: true } } }
  });

  if (!alert) throw new Error('Alert not found');

  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace || alert.app.workspace.id !== workspace.id) {
    throw new Error('Alert not found');
  }

  await prisma.alert.delete({ where: { id: alertId } });
};