import { NextFunction, Request, Response } from 'express';

const BUSINESS_ERRORS = ['CannotAdvanceOrderStatusError', 'InvalidOrderStatusError'];

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const errorName = error.name || error.constructor.name;
  const message = error.message || 'Internal Server Error';

  if (BUSINESS_ERRORS.includes(errorName)) {
    return res.status(400).json({
      success: false,
      error: errorName,
      message,
    });
  }

  if (errorName === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid request data',
      details: message,
    });
  }

  if (errorName === 'NotFoundError' || message.includes('not found')) {
    return res.status(404).json({
      success: false,
      error: 'NotFoundError',
      message,
    });
  }

  if (
    errorName === 'MongoError' ||
    errorName === 'MongooseError' ||
    message.includes('connection')
  ) {
    return res.status(503).json({
      success: false,
      error: 'DatabaseError',
      message: 'Database connection error. Please try again later.',
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred. Please try again later.',
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
) => {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
