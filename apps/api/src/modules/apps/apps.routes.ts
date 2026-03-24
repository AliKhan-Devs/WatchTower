import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  createApp,
  getApps,
  getAppById,
  updateApp,
  deleteApp,
  rotateApiKey
} from './apps.controller';

const router = Router();

router.use(authenticate);

router.post('/', createApp);
router.get('/', getApps);
router.get('/:id', getAppById);
router.patch('/:id', updateApp);
router.delete('/:id', deleteApp);
router.post('/:id/rotate-key', rotateApiKey);

export default router;