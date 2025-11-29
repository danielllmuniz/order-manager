import express, { Request, Response } from 'express';
import { CreateOrderController } from '../controllers/create-order.controller';
import { GetOrderStatusController } from '../controllers/get-order-status.controller';
import { UpdateOrderStatusController } from '../controllers/update-order-status.controller';

export const orderRoute = express.Router();

const createOrderController = new CreateOrderController();
const getOrderStatusController = new GetOrderStatusController();
const updateOrderStatusController = new UpdateOrderStatusController();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order with initial status 'created'
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
orderRoute.post('/', async (req: Request, res: Response) => {
  await createOrderController.handle(req, res);
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order status
 *     description: Retrieves the current status of a specific order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID format
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRoute.get('/:id', async (req: Request, res: Response) => {
  await getOrderStatusController.handle(req, res);
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Advances the order status to the next state (CREATED -> PROCESSING -> SHIPPED -> DELIVERED)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID or cannot advance status (order already delivered)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRoute.patch('/:id/status', async (req: Request, res: Response) => {
  await updateOrderStatusController.handle(req, res);
});
