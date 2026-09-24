import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', activityController.listActivity);
router.delete('/', activityController.clearActivity);

export default router;
