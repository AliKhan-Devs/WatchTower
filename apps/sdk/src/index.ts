import { WatchTowerClient } from './client';
import { createMiddleware } from './middleware';

export interface WatchTowerOptions {
  apiKey: string;
  host?: string;
  flushIntervalMs?: number;
  maxBatchSize?: number;
  debug?: boolean;
}

export const watchTower = (options: WatchTowerOptions) => {
  const client = new WatchTowerClient(options);
  client.start();

  const middleware = createMiddleware(client);

  // Attach stop method to middleware for graceful shutdown
  (middleware as any).stop = () => client.stop();

  return middleware;
};

// Named exports for advanced usage
export { WatchTowerClient } from './client';
export { createMiddleware } from './middleware';