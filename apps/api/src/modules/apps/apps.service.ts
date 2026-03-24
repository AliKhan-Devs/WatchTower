import { randomBytes } from 'crypto';
import prisma from '../../config/prisma';

// helper — verify app belongs to this user's workspace
const getWorkspaceId = async (userId: string) => {
  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace) throw new Error('Workspace not found');
  return workspace.id;
};

export const createApp = async (userId: string, name: string, description?: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const app = await prisma.app.create({
    data: {
      name,
      description,
      apiKey: randomBytes(32).toString('hex'), // stronger than cuid for API keys
      workspaceId
    }
  });

  return app;
};

export const getApps = async (userId: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const apps = await prisma.app.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { metrics: true, alerts: true }
      }
    }
  });

  return apps;
};

export const getAppById = async (userId: string, appId: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const app = await prisma.app.findFirst({
    where: { id: appId, workspaceId },
    include: {
      alerts: true,
      uptimeChecks: true,
      _count: {
        select: { metrics: true }
      }
    }
  });

  if (!app) throw new Error('App not found');
  return app;
};

export const updateApp = async (userId: string, appId: string, name?: string, description?: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId } });
  if (!app) throw new Error('App not found');

  const updated = await prisma.app.update({
    where: { id: appId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description })
    }
  });

  return updated;
};

export const deleteApp = async (userId: string, appId: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId } });
  if (!app) throw new Error('App not found');

  await prisma.app.delete({ where: { id: appId } });
};

export const rotateApiKey = async (userId: string, appId: string) => {
  const workspaceId = await getWorkspaceId(userId);

  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId } });
  if (!app) throw new Error('App not found');

  const updated = await prisma.app.update({
    where: { id: appId },
    data: { apiKey: randomBytes(32).toString('hex') }
  });

  return updated;
};