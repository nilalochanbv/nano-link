import { AppError } from '../utils/errors.js';

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log only critical server errors in development/production
  if (error.statusCode === 500) {
    console.error('SERVER ERROR 💥:', err);
  }

  // Handle Prisma Unique Constraint Violation (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    error.statusCode = 409;
    error.message = `Conflict: Duplicate value for unique constraint on ${fields}`;
    error.status = 'fail';
  }

  // Handle Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    error.statusCode = 404;
    error.message = err.meta?.cause || 'Record not found';
    error.status = 'fail';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid authentication token';
    error.status = 'fail';
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
