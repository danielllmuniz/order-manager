import express, { Express } from 'express';
import { env } from '../../env/index';
import { container } from '../container';
import { RabbitMQConnection } from '../messaging/rabbitmq.connection';
import { MongoDBConnection } from '../persistence/mongodb/mongodb.connection';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRoute } from './routes/health.route';
import { orderRoute } from './routes/order.route';

export const app: Express = express();
app.use(express.json());

const rabbitmqUri = env.RABBITMQ_URI;
const mongoUri = env.MONGODB_URI;

export async function initializeApp(): Promise<void> {
  try {
    await RabbitMQConnection.connect({ uri: rabbitmqUri });
    console.log('RabbitMQ connected successfully');

    await MongoDBConnection.connect({
      uri: mongoUri,
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      },
    });
    console.log('MongoDB connected successfully');

    await container.initialize();
    console.log('Dependency Injection Container initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}

app.use('/health', healthRoute);
app.use('/order', orderRoute);

app.use(notFoundHandler);
app.use(errorHandler);
