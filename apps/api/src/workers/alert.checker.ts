import prisma from '../config/prisma';
import { alertQueue } from '../queues/alert.queue';

export const checkAlerts = async (appId: string) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { appId, isActive: true },
      include: { app: { select: { name: true } } }
    });

    if (alerts.length === 0) return;

    // Get last 5 minutes of metrics for this app
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const metrics = await prisma.metric.findMany({
      where: { appId, timestamp: { gte: since } }
    });

    if (metrics.length === 0) return;

    const total = metrics.length;
    const errors = metrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = (errors / total) * 100;
    const avgResponseTime = metrics.reduce((s, m) => s + m.responseTime, 0) / total;

    for (const alert of alerts) {
      let triggered = false;
      let currentValue = 0;

      if (alert.type === 'ERROR_RATE') {
        currentValue = errorRate;
        triggered = errorRate > alert.threshold;
      } else if (alert.type === 'RESPONSE_TIME') {
        currentValue = avgResponseTime;
        triggered = avgResponseTime > alert.threshold;
      }

      if (triggered) {
        await alertQueue.add(
          `alert-${alert.id}`,
          {
            alertId: alert.id,
            appId,
            appName: alert.app.name,
            type: alert.type,
            currentValue,
            threshold: alert.threshold,
            webhookUrl: alert.webhookUrl ?? undefined,
            email: alert.email ?? undefined
          },
          {
            jobId: `alert-${alert.id}-${Math.floor(Date.now() / 60000)}` // dedupe per minute
          }
        );

        console.log(`[AlertChecker] Queued ${alert.type} alert for app ${appId}`);
      }
    }
  } catch (err) {
    console.error('[AlertChecker] Error:', err);
  }
};