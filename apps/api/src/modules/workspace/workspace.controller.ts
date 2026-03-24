import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as WorkspaceService from './workspace.service';

export const getWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await WorkspaceService.getWorkspace(req.userId!);
    res.status(200).json(workspace);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const workspace = await WorkspaceService.updateWorkspace(req.userId!, name);
    res.status(200).json(workspace);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};