/**
 * Base application error class.
 *
 * All custom errors extend this class. The error handler middleware
 * checks `isOperational` to distinguish expected errors (bad input,
 * not found) from unexpected ones (bugs, DB crashes).
 *
 * Pattern: Factory — static methods create specific error types
 * without exposing implementation details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown = null,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}
