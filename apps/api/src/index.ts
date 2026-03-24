import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { watchTower, WatchTowerClient } from '@alikhan-devs/watchtower-sdk';
dotenv.config();

import authRoutes from './modules/auth/auth.routes';
import workspaceRoutes from './modules/workspace/workspace.routes';
import appsRoutes from './modules/apps/apps.routes';
import ingestRoutes from './modules/ingest/ingest.routes';
import metricsRoutes from './modules/metrics/metrics.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import uptimeRoutes from './modules/uptime/uptime.routes';
import { startMetricsFlusher } from './workers/metrics.flusher';
import { startAlertWorker } from './workers/alert.worker';
import { startUptimePinger } from './workers/uptime.pinger';
import { initSocketServer } from './websocket/socket.server';

const app = express();

const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(watchTower({
  apiKey: "b275c6df962aa96a95df2d1c1be7c6563758e7ce5d56260a59d2b8ed09715ac4",
  host: process.env.HOST
}))
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/uptime', uptimeRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Init WebSocket
initSocketServer(httpServer);

// Start background workers
startMetricsFlusher();
startAlertWorker();
startUptimePinger();

// Use httpServer instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`WatchTower API running on port ${PORT}`);
});