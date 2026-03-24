import { Request, Response } from 'express';
import * as AuthService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password and name are required' });
      return;
    }
    const result = await AuthService.registerUser(email, password, name);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await AuthService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await AuthService.logoutUser(refreshToken);
    res.status(200).json({ message: 'Logged out' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};