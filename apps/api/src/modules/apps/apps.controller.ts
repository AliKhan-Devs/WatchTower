import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as AppsService from './apps.service';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createApp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'App name is required' });
      return;
    }
    const app = await AppsService.createApp(req.userId!, name, description);
    res.status(201).json(app);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getApps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apps = await AppsService.getApps(req.userId!);
    res.status(200).json(apps);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAppById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.id);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const app = await AppsService.getAppById(req.userId!, appId);
    res.status(200).json(app);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateApp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const appId = getParam(req.params.id);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const app = await AppsService.updateApp(req.userId!, appId, name, description);
    res.status(200).json(app);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteApp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.id);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    await AppsService.deleteApp(req.userId!, appId);
    res.status(200).json({ message: 'App deleted' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const rotateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appId = getParam(req.params.id);
    if (!appId) {
      res.status(400).json({ error: 'App id is required' });
      return;
    }

    const app = await AppsService.rotateApiKey(req.userId!, appId);
    res.status(200).json({ apiKey: app.apiKey });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
