import express from 'express';
import redirectController from '../controllers/redirectController.js';
import validate from '../middlewares/requestValidator.js';
import { codeParamSchema } from '../validators/urlValidator.js';
import { redirectLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/:code', redirectLimiter, validate(codeParamSchema), redirectController.handleRedirect);

export default router;
