import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '../../.env', quiet: true });
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // generate와 Mock 실행은 DB 비밀값 없이 가능하다. 실제 연결 시 호스트에서 검증.
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://tcg:tcg_local@localhost:5432/tcg?schema=public' },
});
