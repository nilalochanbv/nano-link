import prisma from '../utils/prisma.js';

class VisitRepository {
  async create(data) {
    return prisma.visit.create({ data });
  }

  // Helper to construct filter conditions
  buildFilter(urlId, userId) {
    if (urlId) {
      return { urlId };
    }
    if (userId) {
      return { url: { userId } };
    }
    return {};
  }

  async getTotalClicks(urlId, userId) {
    const filter = this.buildFilter(urlId, userId);
    return prisma.visit.count({
      where: filter,
    });
  }

  async getLastVisited(urlId, userId) {
    const filter = this.buildFilter(urlId, userId);
    const lastVisit = await prisma.visit.findFirst({
      where: filter,
      orderBy: { visitedAt: 'desc' },
      select: { visitedAt: true },
    });
    return lastVisit ? lastVisit.visitedAt : null;
  }

  async getRecentVisits(urlId, userId, limit = 10) {
    const filter = this.buildFilter(urlId, userId);
    return prisma.visit.findMany({
      where: filter,
      orderBy: { visitedAt: 'desc' },
      take: limit,
      include: {
        url: {
          select: {
            shortCode: true,
            originalUrl: true,
          },
        },
      },
    });
  }

  async getDailyClickTrends(urlId, userId, days = 7) {
    const filter = this.buildFilter(urlId, userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch visits in range and group in JS to remain database-agnostic and robust
    const visits = await prisma.visit.findMany({
      where: {
        ...filter,
        visitedAt: {
          gte: startDate,
        },
      },
      select: {
        visitedAt: true,
      },
    });

    // Aggregate by local date format YYYY-MM-DD
    const trendMap = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    visits.forEach(v => {
      const dateStr = v.visitedAt.toISOString().split('T')[0];
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++;
      }
    });

    return Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopCountries(urlId, userId, limit = 5) {
    const filter = this.buildFilter(urlId, userId);
    const groups = await prisma.visit.groupBy({
      by: ['country'],
      where: {
        ...filter,
        NOT: { country: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return groups.map(g => ({
      country: g.country || 'Unknown',
      count: g._count.id,
    }));
  }

  async getTopBrowsers(urlId, userId, limit = 5) {
    const filter = this.buildFilter(urlId, userId);
    const groups = await prisma.visit.groupBy({
      by: ['browser'],
      where: {
        ...filter,
        NOT: { browser: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return groups.map(g => ({
      browser: g.browser || 'Unknown',
      count: g._count.id,
    }));
  }

  async getTopDevices(urlId, userId, limit = 5) {
    const filter = this.buildFilter(urlId, userId);
    const groups = await prisma.visit.groupBy({
      by: ['device'],
      where: {
        ...filter,
        NOT: { device: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return groups.map(g => ({
      device: g.device || 'Desktop', // default device is often empty/desktop
      count: g._count.id,
    }));
  }
}

export default new VisitRepository();
