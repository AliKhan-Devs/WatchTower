import prisma from '../../config/prisma';

const verifyAppOwnership = async (userId: string, appId: string) => {
  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace) throw new Error('Workspace not found');
  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId: workspace.id } });
  if (!app) throw new Error('App not found');
  return app;
};

export const createUptimeCheck = async (userId: string, appId: string, url: string) => {
  await verifyAppOwnership(userId, appId);

  // Only one uptime check per app for now
  const existing = await prisma.uptimeCheck.findFirst({ where: { appId } });
  if (existing) throw new Error('App already has an uptime check. Delete it first.');

  try {
    new URL(url); // validate URL format
  } catch {
    throw new Error('Invalid URL format');
  }

  return prisma.uptimeCheck.create({
    data: { appId, url }
  });
};

export const getUptimeChecks = async (userId: string, appId: string) => {
  await verifyAppOwnership(userId, appId);
  return prisma.uptimeCheck.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' }
  });
};

export const deleteUptimeCheck = async (userId: string, checkId: string) => {
  const check = await prisma.uptimeCheck.findUnique({
    where: { id: checkId },
    include: { app: { include: { workspace: true } } }
  });

  if (!check) throw new Error('Uptime check not found');

  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace || check.app.workspace.id !== workspace.id) {
    throw new Error('Uptime check not found');
  }

  await prisma.uptimeCheck.delete({ where: { id: checkId } });
};

export const getUptimeHistory = async (userId: string, appId: string, hours: number = 24) => {
  await verifyAppOwnership(userId, appId);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const check = await prisma.uptimeCheck.findFirst({ where: { appId } });
  if (!check) throw new Error('No uptime check configured for this app');

  // Calculate uptime % from UptimeEvent log
  const events = await prisma.uptimeEvent.findMany({
    where: { uptimeCheckId: check.id, timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' }
  });

  const total = events.length;
  const up = events.filter((e) => e.success).length;
  const uptimePercent = total > 0 ? parseFloat(((up / total) * 100).toFixed(2)) : null;

  return {
    check,
    uptimePercent,
    totalPings: total,
    successfulPings: up,
    failedPings: total - up,
    events: events.slice(-50) // last 50 events
  };
};