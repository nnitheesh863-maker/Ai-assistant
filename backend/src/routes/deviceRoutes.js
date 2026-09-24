import { Router } from 'express';
import { deviceController, pairSchema, createDeviceSchema } from '../controllers/deviceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();

// Public/Agent pairing endpoint with 6-digit code
router.post('/pair', validate(pairSchema), deviceController.pairDevice);

// Protected routes (User Dashboard)
router.use(requireAuth);
router.get('/', deviceController.listDevices);
router.post('/pairing-code', deviceController.generatePairingCode);
router.post('/direct', validate(createDeviceSchema), deviceController.createDirect);
router.delete('/:id', deviceController.deleteDevice);

export default router;
