import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error Handler]', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal institutional server error';
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
