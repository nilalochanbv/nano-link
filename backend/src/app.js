import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import redirectRoutes from './routes/redirectRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { serveSwagger, swaggerUi } from './swagger/swagger.js';

const app = express();

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Turn off for Swagger compatibility if needed
}));

// Enable CORS
app.use(cors({
  origin: true, // Allow all origins for dev, or configure your domain here
  credentials: true,
}));

// Parse JSON payloads
app.use(express.json({ limit: '10kb' }));

// Native cookie-parsing middleware to support HttpOnly refresh tokens
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length === 2) {
        req.cookies[parts[0].trim()] = parts[1].trim();
      }
    });
  }
  next();
});

// Serve API Documentation
app.use('/api-docs', swaggerUi.serve, serveSwagger);

// Mount API routes with general rate limiter
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/urls', apiLimiter, urlRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/qr', apiLimiter, qrRoutes);

// Mounting redirect route prefix-free.
// IMPORTANT: Keep this at the bottom so it doesn't intercept API calls.
// Supports both: GET /r/:code AND GET /:code
app.use('/r', redirectRoutes);
app.use('/', redirectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;
