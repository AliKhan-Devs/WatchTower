import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
  getOverview,
  getResponseTimeChart,
  getErrorRateChart,
  getTopRoutes
} from './metrics.controller';

const router = Router();

router.use(authenticate);

router.get('/:appId/overview', getOverview);
router.get('/:appId/response-time', getResponseTimeChart);
router.get('/:appId/error-rate', getErrorRateChart);
router.get('/:appId/top-routes', getTopRoutes);

export default router;