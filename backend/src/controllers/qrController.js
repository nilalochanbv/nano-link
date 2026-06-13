import qrService from '../services/qrService.js';
import urlRepository from '../repositories/urlRepository.js';
import { NotFoundError } from '../utils/errors.js';

class QrController {
  async generateQr(req, res, next) {
    try {
      const { code } = req.params;
      
      const urlRecord = await urlRepository.findByCodeOrAlias(code);
      if (!urlRecord) {
        throw new NotFoundError('Short URL not found');
      }

      // Construct short URL redirect target
      const shortUrl = `${req.protocol}://${req.get('host')}/r/${code}`;
      const qrDataUrl = await qrService.generateQrCode(shortUrl);

      res.status(200).json({
        status: 'success',
        data: {
          shortUrl,
          qrDataUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new QrController();
