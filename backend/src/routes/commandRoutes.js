import { Router } from 'express';
import { commandController, executeCommandSchema } from '../controllers/commandController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);
router.post('/', apiLimiter, validate(executeCommandSchema), commandController.execute);

export default router;
