import { Request, Response, NextFunction } from 'express';
import { WatchTowerClient } from './client';

// Normalize route — replace actual IDs with param names
// e.g. /api/users/123 → /api/users/:id
const normalizeRoute = (req: Request): string => {
  if (req.route?.path) {
    // Express gives us the matched route pattern — use it directly
    const baseUrl = req.baseUrl || '';
    const routePath = req.route.path === '/' ? '' : req.route.path;
    return `${baseUrl}${routePath}` || '/';
  }

  // Fallback — strip numeric IDs and UUIDs from the raw URL
  return req.path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[a-z0-9]{25,}/gi, '/:id') // cuid-style IDs
    || '/';
};

export const createMiddleware = (client: WatchTowerClient) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Hook into response finish event
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const route = normalizeRoute(req);

      // Skip internal/health routes
      if (route.startsWith('/health') || route.startsWith('/favicon')) {
        return;
      }

      client.record({
        route,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        timestamp: new Date().toISOString()
      });
    });

    next();
  };
};