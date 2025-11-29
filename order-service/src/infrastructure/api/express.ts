import express, { Express } from 'express';
import { orderRoute } from './routes/order.route';

export const app: Express = express();
app.use(express.json());
app.use('/order', orderRoute);
