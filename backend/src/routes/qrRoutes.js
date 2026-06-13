import express from 'express';
import qrController from '../controllers/qrController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/requestValidator.js';
import { codeParamSchema } from '../validators/urlValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:code', validate(codeParamSchema), qrController.generateQr);

export default router;
