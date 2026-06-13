import prisma from '../utils/prisma.js';

class UrlRepository {
  async create(data) {
    return prisma.url.create({ data });
  }

  async findByShortCode(shortCode) {
    return prisma.url.findUnique({
      where: { shortCode },
    });
  }

  async findByCustomAlias(customAlias) {
    return prisma.url.findUnique({
      where: { customAlias },
    });
  }

  async findByCodeOrAlias(code) {
    return prisma.url.findFirst({
      where: {
        OR: [
          { shortCode: code },
          { customAlias: code }
        ]
      }
    });
  }

  async findByUser(userId) {
    return prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndUser(id, userId) {
    return prisma.url.findFirst({
      where: { id, userId },
    });
  }

  async update(id, userId, data) {
    return prisma.url.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id, userId) {
    return prisma.url.delete({
      where: { id, userId },
    });
  }

  async incrementClicks(id) {
    return prisma.url.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  }
}

export default new UrlRepository();
