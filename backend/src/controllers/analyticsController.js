import analyticsService from '../services/analyticsService.js';

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardAnalytics(req.user.userId);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async getLinkStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await analyticsService.getLinkAnalytics(id, req.user.userId);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AnalyticsController();
