interface Metric {
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

interface WatchTowerClientOptions {
  apiKey: string;
  host?: string;
  flushIntervalMs?: number;
  maxBatchSize?: number;
  debug?: boolean;
}

export class WatchTowerClient {
  private apiKey: string;
  private host: string;
  private flushIntervalMs: number;
  private maxBatchSize: number;
  private debug: boolean;
  private queue: Metric[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor(options: WatchTowerClientOptions) {
    if (!options.apiKey) throw new Error('[WatchTower] apiKey is required');

    this.apiKey = options.apiKey;
    this.host = options.host?.replace(/\/$/, '') || 'http://localhost:3000';
    this.flushIntervalMs = options.flushIntervalMs || 10000;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.debug = options.debug || false;
  }

  // Called by the middleware on every request
  record(metric: Metric) {
    this.queue.push(metric);

    // Flush immediately if batch is full
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  // Start the background flush timer
  start() {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);

    // Don't keep the process alive just for this timer
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }

    this.log(`Started — flushing every ${this.flushIntervalMs}ms`);
  }

  // Stop the client and flush remaining metrics
  async stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
    this.log('Stopped');
  }

  private async flush() {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;
    const batch = this.queue.splice(0, this.maxBatchSize);

    try {
      const res = await fetch(`${this.host}/api/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(batch)
      });

      if (!res.ok) {
        // Put metrics back in queue on failure
        this.queue.unshift(...batch);
        this.log(`Flush failed: ${res.status} ${res.statusText}`);
      } else {
        this.log(`Flushed ${batch.length} metrics`);
      }
    } catch (err: any) {
      // Put metrics back in queue on network error
      this.queue.unshift(...batch);
      this.log(`Flush error: ${err.message}`);
    } finally {
      this.isFlushing = false;
    }
  }

  private log(msg: string) {
    if (this.debug) {
      console.log(`[WatchTower] ${msg}`);
    }
  }
}