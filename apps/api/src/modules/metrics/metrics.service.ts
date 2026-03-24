import prisma from '../../config/prisma';

const getWorkspaceId = async (userId: string) => {
  const workspace = await prisma.workspace.findUnique({ where: { userId } });
  if (!workspace) throw new Error('Workspace not found');
  return workspace.id;
};

const verifyAppOwnership = async (userId: string, appId: string) => {
  const workspaceId = await getWorkspaceId(userId);
  const app = await prisma.app.findFirst({ where: { id: appId, workspaceId } });
  if (!app) throw new Error('App not found');
  return app;
};

export const getOverview = async (userId: string, appId: string, hours: number = 24) => {
  await verifyAppOwnership(userId, appId);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const metrics = await prisma.metric.findMany({
    where: { appId, timestamp: { gte: since } }
  });

  const total = metrics.length;
  const errors = metrics.filter((m) => m.statusCode >= 400).length;
  const errorRate = total > 0 ? (errors / total) * 100 : 0;
  const avgResponseTime =
    total > 0 ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / total : 0;

  return {
    total,
    errors,
    errorRate: parseFloat(errorRate.toFixed(2)),
    avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
    period: `${hours}h`
  };
};

export const getResponseTimeChart = async (userId: string, appId: string, hours: number = 24) => {
  await verifyAppOwnership(userId, appId);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const metrics = await prisma.metric.findMany({
    where: { appId, timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: { responseTime: true, timestamp: true }
  });

  // Group by hour
  const grouped: Record<string, number[]> = {};
  for (const m of metrics) {
    const hour = new Date(m.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m.responseTime);
  }

  return Object.entries(grouped).map(([time, times]) => ({
    time,
    avg: parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)),
    min: Math.min(...times),
    max: Math.max(...times)
  }));
};

export const getErrorRateChart = async (userId: string, appId: string, hours: number = 24) => {
  await verifyAppOwnership(userId, appId);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const metrics = await prisma.metric.findMany({
    where: { appId, timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: { statusCode: true, timestamp: true }
  });

  const grouped: Record<string, { total: number; errors: number }> = {};
  for (const m of metrics) {
    const hour = new Date(m.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();
    if (!grouped[key]) grouped[key] = { total: 0, errors: 0 };
    grouped[key].total++;
    if (m.statusCode >= 400) grouped[key].errors++;
  }

  return Object.entries(grouped).map(([time, data]) => ({
    time,
    errorRate: parseFloat(((data.errors / data.total) * 100).toFixed(2)),
    total: data.total,
    errors: data.errors
  }));
};

export const getTopRoutes = async (userId: string, appId: string, hours: number = 24) => {
  await verifyAppOwnership(userId, appId);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const metrics = await prisma.metric.findMany({
    where: { appId, timestamp: { gte: since } },
    select: { route: true, method: true, statusCode: true, responseTime: true }
  });

  const grouped: Record<string, { count: number; errors: number; totalTime: number }> = {};

  for (const m of metrics) {
    const key = `${m.method} ${m.route}`;
    if (!grouped[key]) grouped[key] = { count: 0, errors: 0, totalTime: 0 };
    grouped[key].count++;
    grouped[key].totalTime += m.responseTime;
    if (m.statusCode >= 400) grouped[key].errors++;
  }

  return Object.entries(grouped)
    .map(([route, data]) => ({
      route,
      count: data.count,
      avgResponseTime: parseFloat((data.totalTime / data.count).toFixed(2)),
      errorRate: parseFloat(((data.errors / data.count) * 100).toFixed(2))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};