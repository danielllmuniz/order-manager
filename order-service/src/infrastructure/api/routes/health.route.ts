import express, { Request, Response } from 'express';

export const healthRoute = express.Router();

healthRoute.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});
