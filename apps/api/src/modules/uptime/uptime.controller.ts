import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as UptimeService from './uptime.service';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createUptimeCheck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appId, url } = req.body;
    if (!appId || !url) {
      res.status(400).json({ error: 'appId and url are required' });
      return;
    }
    const check = await UptimeService.createUptimeCheck(req.userId!, appId, url);
    res.status(201).json(check);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getUptimeChecks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const checks = await UptimeService.getUptimeChecks(req.userId!, appId);
    res.status(200).json(checks);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUptimeCheck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const checkId = getParam(req.params.id);
    if (!checkId) {
      res.status(400).json({ error: 'Uptime check id is required' });
      return;
    }

    await UptimeService.deleteUptimeCheck(req.userId!, checkId);
    res.status(200).json({ message: 'Uptime check deleted' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const getUptimeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const hours = parseInt(req.query.hours as string) || 24;
    const data = await UptimeService.getUptimeHistory(req.userId!, appId, hours);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
