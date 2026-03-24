import cron from 'node-cron';
import prisma from '../config/prisma';
import { alertQueue } from '../queues/alert.queue';
import { broadcastUptimeStatus } from '../websocket/socket.server';

const FAIL_THRESHOLD = 3; // consecutive failures before alerting
const PING_TIMEOUT_MS = 10000; // 10 second timeout per ping

const pingUrl = async (url: string): Promise<{ success: boolean; statusCode?: number; responseTime?: number; error?: string }> => {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'WatchTower-Uptime-Monitor/1.0' }
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - start;

    return {
      success: res.ok,
      statusCode: res.status,
      responseTime
    };
  } catch (err: any) {
    return {
      success: false,
      responseTime: Date.now() - start,
      error: err.name === 'AbortError' ? 'Request timed out' : err.message
    };
  }
};

const runUptimeChecks = async () => {
  const checks = await prisma.uptimeCheck.findMany({
    include: {
      app: {
        select: {
          id: true,
          name: true,
          alerts: {
            where: { type: 'UPTIME', isActive: true }
          }
        }
      }
    }
  });

  if (checks.length === 0) return;

  console.log(`[UptimePinger] Checking ${checks.length} URL(s)...`);

  for (const check of checks) {
    const result = await pingUrl(check.url);

    // Log the ping event
    await prisma.uptimeEvent.create({
      data: {
        uptimeCheckId: check.id,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        error: result.error
      }
    });

    const previousStatus = check.status;
    let newFailCount = result.success ? 0 : check.failCount + 1;
    let newStatus: 'UP' | 'DOWN' | 'UNKNOWN' = result.success ? 'UP' : check.status;

    if (!result.success && newFailCount >= FAIL_THRESHOLD) {
      newStatus = 'DOWN';
    }

    // Update check status
    await prisma.uptimeCheck.update({
      where: { id: check.id },
      data: {
        status: newStatus,
        failCount: newFailCount,
        lastCheckedAt: new Date()
      }
    });

    // Fire DOWN alert — only when transitioning from UP/UNKNOWN → DOWN
    if (newStatus === 'DOWN' && previousStatus !== 'DOWN') {
      console.log(`[UptimePinger] 🔴 ${check.app.name} is DOWN (${check.url})`);
      broadcastUptimeStatus(check.app.id, 'DOWN', check.url);

      for (const alert of check.app.alerts) {
        await alertQueue.add(
          `uptime-down-${check.id}`,
          {
            alertId: alert.id,
            appId: check.app.id,
            appName: check.app.name,
            type: 'UPTIME',
            currentValue: 0,
            threshold: 0,
            webhookUrl: alert.webhookUrl ?? undefined,
            email: alert.email ?? undefined
          },
          {
            jobId: `uptime-down-${check.id}-${Math.floor(Date.now() / 60000)}`
          }
        );
      }
    }

    // Fire RECOVERY alert — transitioning from DOWN → UP
    if (result.success && previousStatus === 'DOWN') {
      console.log(`[UptimePinger] 🟢 ${check.app.name} recovered (${check.url})`);
      broadcastUptimeStatus(check.app.id, 'UP', check.url, result.responseTime);

      for (const alert of check.app.alerts) {
        await alertQueue.add(
          `uptime-up-${check.id}`,
          {
            alertId: alert.id,
            appId: check.app.id,
            appName: check.app.name,
            type: 'UPTIME',
            currentValue: 1,
            threshold: 0,
            webhookUrl: alert.webhookUrl ?? undefined,
            email: alert.email ?? undefined
          },
          {
            jobId: `uptime-up-${check.id}-${Math.floor(Date.now() / 60000)}`
          }
        );
      }
    }

    const icon = result.success ? '✅' : '❌';
    console.log(`[UptimePinger] ${icon} ${check.url} — ${result.responseTime}ms`);
  }
};

export const startUptimePinger = () => {
  // Run every 60 seconds
  cron.schedule('* * * * *', runUptimeChecks);
  console.log('[UptimePinger] Started — checking every 60 seconds');
};