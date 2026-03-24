import { Request, Response } from 'express';
import * as IngestService from './ingest.service';

export const ingest = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    const metrics = Array.isArray(req.body) ? req.body : [req.body];

    if (metrics.length === 0) {
      res.status(400).json({ error: 'No metrics provided' });
      return;
    }

    if (metrics.length > 100) {
      res.status(400).json({ error: 'Max 100 metrics per request' });
      return;
    }

    // Validate each metric
    for (const m of metrics) {
      if (!m.route || !m.method || m.statusCode === undefined || m.responseTime === undefined) {
        res.status(400).json({ error: 'Each metric needs: route, method, statusCode, responseTime' });
        return;
      }
    }

    const appId = await IngestService.resolveApp(apiKey);
    await IngestService.bufferMetrics(appId, metrics);

    res.status(202).json({ accepted: metrics.length });
  } catch (err: any) {
    if (err.message === 'Invalid API key') {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};