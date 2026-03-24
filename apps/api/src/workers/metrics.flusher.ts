import prisma from '../config/prisma';
import redis from '../config/redis';
import { checkAlerts } from './alert.checker';
import { broadcastMetrics } from '../websocket/socket.server';

const BATCH_SIZE = 500;
const FLUSH_INTERVAL_MS = 5000;

interface BufferedMetric {
  appId: string;
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

const flushMetrics = async () => {
  try {
    const pipeline = redis.pipeline();
    for (let i = 0; i < BATCH_SIZE; i++) {
      pipeline.rpop('metrics:buffer');
    }

    const results = await pipeline.exec();
    if (!results) return;

    const items: BufferedMetric[] = results
      .map(([err, val]) => {
        if (err || !val) return null;
        try {
          return JSON.parse(val as string) as BufferedMetric;
        } catch {
          return null;
        }
      })
      .filter((item): item is BufferedMetric => item !== null);

    if (items.length === 0) return;

    await prisma.metric.createMany({
      data: items.map((item) => ({
        appId: item.appId,
        route: item.route,
        method: item.method,
        statusCode: item.statusCode,
        responseTime: item.responseTime,
        timestamp: new Date(item.timestamp)
      }))
    });

    console.log(`[Flusher] Wrote ${items.length} metrics to DB`);

    // Broadcast to connected dashboard clients + check alerts
    const uniqueAppIds = [...new Set(items.map((i) => i.appId))];
    for (const appId of uniqueAppIds) {
      const appMetrics = items
        .filter((i) => i.appId === appId)
        .map(({ route, method, statusCode, responseTime, timestamp }) => ({
          route, method, statusCode, responseTime, timestamp
        }));

      broadcastMetrics(appId, appMetrics);
      await checkAlerts(appId);
    }
  } catch (err) {
    console.error('[Flusher] Error:', err);
  }
};

export const startMetricsFlusher = () => {
  console.log('[Flusher] Started — flushing every 5 seconds');
  setInterval(flushMetrics, FLUSH_INTERVAL_MS);
};