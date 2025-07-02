import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  DOMAIN: z.string().optional(),
  CLIENT_URL: z.string().optional(),
  HOST: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.format());
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
