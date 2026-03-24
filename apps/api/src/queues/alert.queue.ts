import { Queue } from 'bullmq';

export interface AlertJobData {
  alertId: string;
  appId: string;
  appName: string;
  type: 'ERROR_RATE' | 'RESPONSE_TIME' | 'UPTIME';
  currentValue: number;
  threshold: number;
  webhookUrl?: string;
  email?: string;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const alertQueue = new Queue('alerts', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});
