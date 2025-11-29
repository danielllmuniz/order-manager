import express, { Request, Response } from 'express';

export const orderRoute = express.Router();

orderRoute.post('/', async (req: Request, res: Response) => {
  res.send('create');
});

orderRoute.get('/:id', async (req: Request, res: Response) => {
  res.send('find by id');
});

orderRoute.patch('/:id/status', async (req: Request, res: Response) => {
  res.send('update status');
});
