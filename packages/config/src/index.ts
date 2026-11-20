import { z } from 'zod';

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATA_MODE: z.literal('mock').default('mock'),
  DATABASE_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  DATABASE_URL: z.url().optional(),
}).superRefine((env, ctx) => {
  if (env.DATABASE_ENABLED && !env.DATABASE_URL) {
    ctx.addIssue({ code: 'custom', path: ['DATABASE_URL'], message: 'DB 연결 시 DATABASE_URL이 필요합니다.' });
  }
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export function parseApiEnv(input: Record<string, unknown>): ApiEnv {
  return apiEnvSchema.parse(input);
}
