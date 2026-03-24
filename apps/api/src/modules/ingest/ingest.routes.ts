import { Router } from 'express';
import { ingest } from './ingest.controller';

const router = Router();

// No JWT auth here — SDK uses API key instead
router.post('/', ingest);

export default router;