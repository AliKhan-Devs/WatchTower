import redis from '../../config/redis';
import prisma from '../../config/prisma';

export interface MetricPayload {
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp?: string;
}

// Validate the API key and return the appId
export const resolveApp = async (apiKey: string) => {
  // Cache app lookup in Redis for 5 mins to avoid DB hit every request
  const cached = await redis.get(`apikey:${apiKey}`);
  if (cached) return cached;

  const app = await prisma.app.findUnique({ where: { apiKey } });
  if (!app) throw new Error('Invalid API key');

  await redis.set(`apikey:${apiKey}`, app.id, 'EX', 300);
  return app.id;
};

// Push metrics into Redis list (buffer)
export const bufferMetrics = async (appId: string, metrics: MetricPayload[]) => {
  const pipeline = redis.pipeline();

  for (const metric of metrics) {
    const entry = JSON.stringify({
      appId,
      route: metric.route,
      method: metric.method.toUpperCase(),
      statusCode: metric.statusCode,
      responseTime: metric.responseTime,
      timestamp: metric.timestamp || new Date().toISOString()
    });

    pipeline.lpush('metrics:buffer', entry);
  }

  await pipeline.exec();
};