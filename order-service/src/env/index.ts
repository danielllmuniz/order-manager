import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().default('mongodb://admin:admin@localhost:27017/order-service-test?authSource=admin'),
  RABBITMQ_URI: z.string().default('amqp://admin:admin@localhost:5672'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(z.treeifyError(_env.error));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
