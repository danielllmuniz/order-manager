import express, { Request, Response } from 'express';
import { CreateOrderController } from '../controllers/create-order.controller';

export const orderRoute = express.Router();

const createOrderController = new CreateOrderController();

orderRoute.post('/', async (req: Request, res: Response) => {
  await createOrderController.handle(req, res);
});

orderRoute.get('/:id', async (req: Request, res: Response) => {
  res.send('find by id');
});

orderRoute.patch('/:id/status', async (req: Request, res: Response) => {
  res.send('update status');
});
