import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as AlertsService from './alerts.service';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appId, type, threshold, cooldownMins, webhookUrl, email } = req.body;
    if (!appId || !type || threshold === undefined) {
      res.status(400).json({ error: 'appId, type and threshold are required' });
      return;
    }
    const alert = await AlertsService.createAlert(
      req.userId!, appId, type, threshold, cooldownMins, webhookUrl, email
    );
    res.status(201).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.appId);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const alerts = await AlertsService.getAlerts(req.userId!, appId);
    res.status(200).json(alerts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertId = getParam(req.params.id);
    if (!alertId) {
      res.status(400).json({ error: 'Alert id is required' });
      return;
    }

    const alert = await AlertsService.updateAlert(req.userId!, alertId, req.body);
    res.status(200).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertId = getParam(req.params.id);
    if (!alertId) {
      res.status(400).json({ error: 'Alert id is required' });
      return;
    }

    await AlertsService.deleteAlert(req.userId!, alertId);
    res.status(200).json({ message: 'Alert deleted' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
