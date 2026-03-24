import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/prisma';

let io: SocketIOServer;

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Auth middleware — verify JWT before allowing connection
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;
      if (!token) return next(new Error('No token provided'));

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;

      // Attach workspace info
      const workspace = await prisma.workspace.findUnique({
        where: { userId: payload.userId },
        include: { apps: { select: { id: true } } }
      });

      if (!workspace) return next(new Error('Workspace not found'));

      socket.data.workspaceId = workspace.id;
      socket.data.appIds = workspace.apps.map((a) => a.id);

      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Join a room per user — so we broadcast only to the right user
    socket.join(`user:${userId}`);

    // Client can subscribe to a specific app's live feed
    socket.on('subscribe:app', (appId: string) => {
      // Verify they own this app
      if (socket.data.appIds.includes(appId)) {
        socket.join(`app:${appId}`);
        socket.emit('subscribed', { appId });
        console.log(`[Socket] User ${userId} subscribed to app ${appId}`);
      } else {
        socket.emit('error', { message: 'App not found' });
      }
    });

    socket.on('unsubscribe:app', (appId: string) => {
      socket.leave(`app:${appId}`);
      socket.emit('unsubscribed', { appId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });

  console.log('[Socket] WebSocket server initialized');
  return io;
};

// Called by the metrics flusher after every DB write
export const broadcastMetrics = (appId: string, metrics: {
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}[]) => {
  if (!io) return;
  io.to(`app:${appId}`).emit('metrics:new', { appId, metrics });
};

// Called by uptime pinger on status change
export const broadcastUptimeStatus = (appId: string, status: 'UP' | 'DOWN', url: string, responseTime?: number) => {
  if (!io) return;
  io.to(`app:${appId}`).emit('uptime:status', { appId, status, url, responseTime, timestamp: new Date().toISOString() });
};

// Called by alert worker when an alert fires
export const broadcastAlert = (userId: string, alert: {
  appId: string;
  appName: string;
  type: string;
  currentValue: number;
  threshold: number;
}) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('alert:fired', alert);
};

export const getIO = () => io;