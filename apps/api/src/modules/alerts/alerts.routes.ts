import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { createAlert, getAlerts, updateAlert, deleteAlert } from './alerts.controller';

const router = Router();

router.use(authenticate);

router.post('/', createAlert);
router.get('/:appId', getAlerts);
router.patch('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;