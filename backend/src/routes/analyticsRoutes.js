import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/requestValidator.js';
import { idParamSchema } from '../validators/urlValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/link/:id', validate(idParamSchema), analyticsController.getLinkStats);

export default router;
