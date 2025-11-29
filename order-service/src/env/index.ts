import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'staging', 'production']).default('dev'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string(),
  RABBITMQ_URI: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(z.treeifyError(_env.error));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
