import express, { Express } from 'express';
import { env } from '../../env/index';
import { RabbitMQConnection } from '../messaging/rabbitmq.connection';
import { orderRoute } from './routes/order.route';

export const app: Express = express();
app.use(express.json());

const rabbitmqUri = env.RABBITMQ_URI;

RabbitMQConnection.connect({ uri: rabbitmqUri });

app.use('/order', orderRoute);
