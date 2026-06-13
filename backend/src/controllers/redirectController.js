import urlService from '../services/urlService.js';
import analyticsService from '../services/analyticsService.js';

class RedirectController {
  async handleRedirect(req, res, next) {
    try {
      const { code } = req.params;
      
      const urlRecord = await urlService.resolveUrl(code);
      
      // Extract analytics parameters
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'] || req.headers['referrer'];

      // Record analytics asynchronously (fire-and-forget) to keep the redirection fast
      analyticsService.recordVisit(urlRecord.id, {
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : ipAddress,
        userAgent,
        referrer,
      }).catch(err => {
        console.error('Failed to log visit analytics:', err);
      });

      // Redirect client with 302 (Found)
      res.redirect(302, urlRecord.originalUrl);
    } catch (err) {
      next(err);
    }
  }
}

export default new RedirectController();
