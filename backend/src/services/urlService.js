import { nanoid } from 'nanoid';
import urlRepository from '../repositories/urlRepository.js';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

class UrlService {
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  async shortenUrl(userId, { originalUrl, customAlias, expiryDate }) {
    if (!this.validateUrl(originalUrl)) {
      throw new BadRequestError('Invalid original URL format');
    }

    let parsedExpiry = null;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        throw new BadRequestError('Invalid expiry date format');
      }
      if (parsedExpiry < new Date()) {
        throw new BadRequestError('Expiry date cannot be in the past');
      }
    }

    let shortCode;
    if (customAlias) {
      // Clean custom alias
      const cleanedAlias = customAlias.trim().toLowerCase();
      if (!/^[a-z0-9-_]+$/i.test(cleanedAlias)) {
        throw new BadRequestError('Custom alias can only contain alphanumeric characters, hyphens, and underscores');
      }

      // Check if alias is already taken as a custom alias or shortCode
      const existing = await urlRepository.findByCodeOrAlias(cleanedAlias);
      if (existing) {
        throw new ConflictError('Custom alias is already in use');
      }
      shortCode = nanoid(7).toLowerCase(); // We still generate a back-up shortCode, but the user accesses via customAlias
      
      return urlRepository.create({
        userId,
        originalUrl,
        shortCode,
        customAlias: cleanedAlias,
        expiryDate: parsedExpiry,
      });
    }

    // Generate a unique shortCode
    let attempts = 0;
    while (attempts < 5) {
      shortCode = nanoid(7).toLowerCase();
      const existing = await urlRepository.findByCodeOrAlias(shortCode);
      if (!existing) {
        break;
      }
      attempts++;
    }

    if (attempts >= 5) {
      throw new Error('Failed to generate a unique short code. Please try again.');
    }

    return urlRepository.create({
      userId,
      originalUrl,
      shortCode,
      expiryDate: parsedExpiry,
    });
  }

  async getUrlsByUser(userId) {
    return urlRepository.findByUser(userId);
  }

  async updateUrl(id, userId, { originalUrl, customAlias, expiryDate, isActive }) {
    const url = await urlRepository.findByIdAndUser(id, userId);
    if (!url) {
      throw new NotFoundError('URL not found');
    }

    const updateData = {};

    if (originalUrl !== undefined) {
      if (!this.validateUrl(originalUrl)) {
        throw new BadRequestError('Invalid original URL format');
      }
      updateData.originalUrl = originalUrl;
    }

    if (customAlias !== undefined) {
      if (customAlias === null || customAlias === '') {
        updateData.customAlias = null;
      } else {
        const cleanedAlias = customAlias.trim().toLowerCase();
        if (!/^[a-z0-9-_]+$/i.test(cleanedAlias)) {
          throw new BadRequestError('Custom alias can only contain alphanumeric characters, hyphens, and underscores');
        }
        if (cleanedAlias !== url.customAlias) {
          const existing = await urlRepository.findByCodeOrAlias(cleanedAlias);
          if (existing) {
            throw new ConflictError('Custom alias is already in use');
          }
          updateData.customAlias = cleanedAlias;
        }
      }
    }

    if (expiryDate !== undefined) {
      if (expiryDate === null) {
        updateData.expiryDate = null;
      } else {
        const parsedExpiry = new Date(expiryDate);
        if (isNaN(parsedExpiry.getTime())) {
          throw new BadRequestError('Invalid expiry date format');
        }
        updateData.expiryDate = parsedExpiry;
      }
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    return urlRepository.update(id, userId, updateData);
  }

  async deleteUrl(id, userId) {
    const url = await urlRepository.findByIdAndUser(id, userId);
    if (!url) {
      throw new NotFoundError('URL not found');
    }
    return urlRepository.delete(id, userId);
  }

  async resolveUrl(code) {
    const url = await urlRepository.findByCodeOrAlias(code);
    if (!url) {
      throw new NotFoundError('Short URL not found');
    }

    if (!url.isActive) {
      throw new BadRequestError('This link has been deactivated');
    }

    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      throw new BadRequestError('This link has expired');
    }

    // Increment click count asynchronously to keep redirects fast
    urlRepository.incrementClicks(url.id).catch(err => {
      console.error('Error incrementing click count:', err);
    });

    return url;
  }

  async importUrlsFromCsv(userId, fileBuffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowNum = 1;

      const stream = Readable.from(fileBuffer.toString());

      stream
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (row) => {
          rowNum++;
          results.push({ row, rowNum });
        })
        .on('end', async () => {
          const imported = [];
          
          for (const item of results) {
            const { row, rowNum } = item;
            const originalUrl = row.originalUrl || row.url || row.OriginalUrl;
            const customAlias = row.customAlias || row.alias || row.CustomAlias || null;
            const expiryDate = row.expiryDate || row.expiry || row.ExpiryDate || null;

            if (!originalUrl) {
              errors.push({ row: rowNum, error: 'originalUrl column is missing or empty' });
              continue;
            }

            try {
              const urlRecord = await this.shortenUrl(userId, {
                originalUrl: originalUrl.trim(),
                customAlias: customAlias ? customAlias.trim() : null,
                expiryDate: expiryDate ? expiryDate.trim() : null,
              });
              imported.push(urlRecord);
            } catch (err) {
              errors.push({ row: rowNum, url: originalUrl, error: err.message });
            }
          }

          resolve({
            totalProcessed: results.length,
            successCount: imported.length,
            errorCount: errors.length,
            imported,
            errors,
          });
        })
        .on('error', (error) => {
          reject(new BadRequestError('Failed to parse CSV: ' + error.message));
        });
    });
  }
}

export default new UrlService();
