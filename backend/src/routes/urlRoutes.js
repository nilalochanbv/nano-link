import express from 'express';
import urlController from '../controllers/urlController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/requestValidator.js';
import { shortenUrlSchema, updateUrlSchema, idParamSchema } from '../validators/urlValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(shortenUrlSchema), urlController.shorten);
router.get('/', urlController.getMyUrls);
router.patch('/:id', validate(idParamSchema), validate(updateUrlSchema), urlController.updateUrl);
router.delete('/:id', validate(idParamSchema), urlController.deleteUrl);

// Bulk CSV import endpoint (uses text/csv raw parser specifically for this route)
router.post(
  '/import',
  express.text({ type: 'text/csv', limit: '5mb' }),
  urlController.importCsv
);

export default router;
