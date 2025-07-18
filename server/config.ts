import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('5000'),
  DOMAIN: z.string().optional(),
  CLIENT_URL: z.string().optional(),
  HOST: z.string().default('0.0.0.0'),
  STRIPE_SECRET_KEY: z.string().optional(),
  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.format());
  console.error('Required environment variables:');
  console.error('- DATABASE_URL: Your database connection string');
  console.error('- SESSION_SECRET: A secure random string (32+ characters)');
  console.error('Optional environment variables:');
  console.error('- SENDGRID_API_KEY: For email verification');
  console.error('- STRIPE_SECRET_KEY: For payment processing');
  console.error('- OPENAI_API_KEY: For AI features');
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
