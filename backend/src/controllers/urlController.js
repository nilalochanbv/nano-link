import urlService from '../services/urlService.js';
import { BadRequestError } from '../utils/errors.js';

class UrlController {
  async shorten(req, res, next) {
    try {
      const { originalUrl, customAlias, expiryDate } = req.body;
      const urlRecord = await urlService.shortenUrl(req.user.userId, {
        originalUrl,
        customAlias,
        expiryDate,
      });

      res.status(201).json({
        status: 'success',
        message: 'URL shortened successfully',
        data: { url: urlRecord },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyUrls(req, res, next) {
    try {
      const urls = await urlService.getUrlsByUser(req.user.userId);
      res.status(200).json({
        status: 'success',
        results: urls.length,
        data: { urls },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUrl(req, res, next) {
    try {
      const { id } = req.params;
      const { originalUrl, customAlias, expiryDate, isActive } = req.body;
      
      const updatedUrl = await urlService.updateUrl(id, req.user.userId, {
        originalUrl,
        customAlias,
        expiryDate,
        isActive,
      });

      res.status(200).json({
        status: 'success',
        message: 'URL updated successfully',
        data: { url: updatedUrl },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUrl(req, res, next) {
    try {
      const { id } = req.params;
      await urlService.deleteUrl(id, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'URL deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async importCsv(req, res, next) {
    try {
      const csvData = req.body;
      if (!csvData || typeof csvData !== 'string') {
        throw new BadRequestError('Invalid CSV content. Send CSV raw text in body with Content-Type: text/csv');
      }

      const result = await urlService.importUrlsFromCsv(req.user.userId, Buffer.from(csvData));
      
      res.status(200).json({
        status: 'success',
        message: 'CSV bulk import processing completed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new UrlController();
