import { config } from 'dotenv';
import { z } from 'zod';
import { envSchema } from './env.schema';

config();

export const envLoader = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid ENV');
    console.error(parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
};

export type AppConfig = z.infer<typeof envSchema>;
