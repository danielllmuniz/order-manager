import express, { Request, Response } from 'express';
import { CreateOrderController } from '../controllers/create-order.controller';
import { GetOrderStatusController } from '../controllers/get-order-status.controller';
import { UpdateOrderStatusController } from '../controllers/update-order-status.controller';

export const orderRoute = express.Router();

const createOrderController = new CreateOrderController();
const getOrderStatusController = new GetOrderStatusController();
const updateOrderStatusController = new UpdateOrderStatusController();

orderRoute.post('/', async (req: Request, res: Response) => {
  await createOrderController.handle(req, res);
});

orderRoute.get('/:id', async (req: Request, res: Response) => {
  await getOrderStatusController.handle(req, res);
});

orderRoute.patch('/:id/status', async (req: Request, res: Response) => {
  await updateOrderStatusController.handle(req, res);
});
