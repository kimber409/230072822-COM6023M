import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

// Converts unmatched routes into a normal API error.
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`));
}

// Central error handler so clients always receive JSON instead of raw stack traces.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({ error: 'A record with those unique details already exists' });
  }

  if (error.code === '23503') {
    return res.status(400).json({ error: 'The request references a record that does not exist' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}
