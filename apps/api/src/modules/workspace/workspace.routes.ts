import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getWorkspace, updateWorkspace } from './workspace.controller';

const router = Router();

router.use(authenticate);

router.get('/', getWorkspace);
router.patch('/', updateWorkspace);

export default router;