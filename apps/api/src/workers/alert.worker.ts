import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma';
import redis from '../config/redis';
import { AlertJobData } from '../queues/alert.queue';
import { broadcastAlert } from '../websocket/socket.server';

const COOLDOWN_KEY = (alertId: string) => `alert:cooldown:${alertId}`;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Send webhook (Slack / Discord / custom)
const sendWebhook = async (url: string, data: AlertJobData) => {
    const label =
        data.type === 'ERROR_RATE'
            ? `Error rate is ${data.currentValue.toFixed(2)}% (threshold: ${data.threshold}%)`
            : data.type === 'RESPONSE_TIME'
                ? `Avg response time is ${data.currentValue.toFixed(0)}ms (threshold: ${data.threshold}ms)`
                : data.currentValue === 0
                    ? `🔴 App is DOWN — ${data.appName} is not responding`
                    : `🟢 App has RECOVERED — ${data.appName} is back online`;

    const body = {
        text: `🚨 *WatchTower Alert* — ${data.appName}\n${label}`,
        // Slack-compatible format
        attachments: [
            {
                color: 'danger',
                fields: [
                    { title: 'App', value: data.appName, short: true },
                    { title: 'Alert Type', value: data.type, short: true },
                    { title: 'Current Value', value: String(data.currentValue.toFixed(2)), short: true },
                    { title: 'Threshold', value: String(data.threshold), short: true }
                ]
            }
        ]
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
};

// Send email
const sendEmail = async (to: string, data: AlertJobData) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const label =
        data.type === 'ERROR_RATE'
            ? `Error rate reached ${data.currentValue.toFixed(2)}%`
            : data.type === 'RESPONSE_TIME'
                ? `Response time reached ${data.currentValue.toFixed(0)}ms`
                : data.currentValue === 0
                    ? `App is DOWN — not responding`
                    : `App has RECOVERED — back online`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'watchtower@yourdomain.com',
        to,
        subject: `🚨 WatchTower Alert: ${data.appName}`,
        html: `
      <h2>WatchTower Alert</h2>
      <p><strong>App:</strong> ${data.appName}</p>
      <p><strong>Alert:</strong> ${label}</p>
      <p><strong>Threshold:</strong> ${data.threshold}</p>
      <p><strong>Current Value:</strong> ${data.currentValue.toFixed(2)}</p>
      <hr/>
      <p style="color:#999;font-size:12px">This alert was fired by WatchTower monitoring.</p>
    `
    });
};

// The actual worker
export const startAlertWorker = () => {
    const worker = new Worker(
        'alerts',
        async (job: Job<AlertJobData>) => {
            const data = job.data;

            // Check cooldown — skip if alert fired recently
            const cooldownKey = COOLDOWN_KEY(data.alertId);
            const onCooldown = await redis.get(cooldownKey);
            if (onCooldown) {
                console.log(`[AlertWorker] Alert ${data.alertId} is on cooldown, skipping`);
                return;
            }

            // Get cooldown duration from DB
            const alert = await prisma.alert.findUnique({ where: { id: data.alertId } });
            if (!alert || !alert.isActive) return;

            console.log(`[AlertWorker] Firing alert for ${data.appName} — ${data.type}`);

            const errors: string[] = [];

            // Fire webhook
            if (data.webhookUrl) {
                try {
                    await sendWebhook(data.webhookUrl, data);
                } catch (err: any) {
                    errors.push(`Webhook failed: ${err.message}`);
                }
            }

            // Fire email
            if (data.email) {
                try {
                    await sendEmail(data.email, data);
                } catch (err: any) {
                    errors.push(`Email failed: ${err.message}`);
                }
            }

            // Set cooldown in Redis
            await redis.set(cooldownKey, '1', 'EX', alert.cooldownMins * 60);

            // Update lastFiredAt in DB
            await prisma.alert.update({
                where: { id: data.alertId },
                data: { lastFiredAt: new Date() }
            });

            // Get userId for broadcasting
            const alertRecord = await prisma.alert.findUnique({
                where: { id: data.alertId },
                include: { app: { include: { workspace: true } } }
            });

            if (alertRecord) {
                broadcastAlert(alertRecord.app.workspace.userId, {
                    appId: data.appId,
                    appName: data.appName,
                    type: data.type,
                    currentValue: data.currentValue,
                    threshold: data.threshold
                });
            }
            if (errors.length > 0) {
                throw new Error(errors.join('; '));
            }
        },
        { connection: { url: redisUrl }, concurrency: 5 }
    );

    worker.on('completed', (job) => {
        console.log(`[AlertWorker] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[AlertWorker] Job ${job?.id} failed:`, err.message);
    });

    console.log('[AlertWorker] Started');
};
