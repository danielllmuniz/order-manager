import express, { Express } from 'express';
import { env } from '../../env/index';
import { RabbitMQConnection } from '../messaging/rabbitmq.connection';
import { MongoDBConnection } from '../persistence/mongodb/mongodb.connection';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRoute } from './routes/health.route';
import { orderRoute } from './routes/order.route';

export const app: Express = express();
app.use(express.json());

const rabbitmqUri = env.RABBITMQ_URI;
const mongoUri = env.MONGODB_URI;

RabbitMQConnection.connect({ uri: rabbitmqUri });
MongoDBConnection.connect({
  uri: mongoUri,
  options: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  },
});

app.use('/health', healthRoute);
app.use('/order', orderRoute);

app.use(notFoundHandler);
app.use(errorHandler);
