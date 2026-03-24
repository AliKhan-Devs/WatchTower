import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  createUptimeCheck,
  getUptimeChecks,
  deleteUptimeCheck,
  getUptimeHistory
} from './uptime.controller';

const router = Router();

router.use(authenticate);

router.post('/', createUptimeCheck);
router.get('/:appId', getUptimeChecks);
router.delete('/:id', deleteUptimeCheck);
router.get('/:appId/history', getUptimeHistory);

export default router;