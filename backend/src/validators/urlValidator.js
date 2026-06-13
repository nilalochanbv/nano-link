import { z } from 'zod';

export const shortenUrlSchema = z.object({
  body: z.object({
    originalUrl: z.string({
      required_error: 'Original URL is required',
    }).url('Invalid URL format (must include http/https)'),
    customAlias: z.string().trim().min(3, 'Custom alias must be at least 3 characters').max(30, 'Custom alias must be under 30 characters').regex(/^[a-z0-9-_]+$/i, 'Custom alias can only contain alphanumeric characters, hyphens, and underscores').optional().nullable(),
    expiryDate: z.string().datetime({ message: 'Expiry date must be a valid ISO-8601 date string' }).optional().nullable(),
  }),
});

export const updateUrlSchema = z.object({
  body: z.object({
    originalUrl: z.string().url('Invalid URL format').optional(),
    customAlias: z.string().trim().min(3, 'Custom alias must be at least 3 characters').max(30, 'Custom alias must be under 30 characters').regex(/^[a-z0-9-_]+$/i, 'Custom alias can only contain alphanumeric characters, hyphens, and underscores').optional().nullable(),
    expiryDate: z.string().datetime({ message: 'Expiry date must be a valid ISO-8601 date string' }).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const codeParamSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'Short code is required'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid URL ID format'),
  }),
});
