import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as MetricsService from './metrics.service';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const getOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const hours = parseInt(req.query.hours as string) || 24;
    const data = await MetricsService.getOverview(req.userId!, appId, hours);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getResponseTimeChart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const hours = parseInt(req.query.hours as string) || 24;
    const data = await MetricsService.getResponseTimeChart(req.userId!, appId, hours);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getErrorRateChart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const hours = parseInt(req.query.hours as string) || 24;
    const data = await MetricsService.getErrorRateChart(req.userId!, appId, hours);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTopRoutes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const hours = parseInt(req.query.hours as string) || 24;
    const data = await MetricsService.getTopRoutes(req.userId!, appId, hours);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
