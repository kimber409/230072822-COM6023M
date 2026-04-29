// Custom error type for expected API failures such as 404 or 401.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Helper used by services when a requested database row is missing.
export function notFound(resource = 'Resource') {
  return new ApiError(404, `${resource} was not found`);
}
