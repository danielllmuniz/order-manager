import { Request, Response } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    statusCode,
    message,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
) => {
  res.status(404).json({
    error: true,
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
