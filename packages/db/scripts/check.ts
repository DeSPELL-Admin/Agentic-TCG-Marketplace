import { config } from 'dotenv';
import { createPrismaClient } from '../src/index.js';

config({ path: '../../.env', quiet: true });
if (!process.env.DATABASE_URL) throw new Error('루트 .env에 DATABASE_URL을 설정하세요.');
const prisma = createPrismaClient(process.env.DATABASE_URL);
try {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  await prisma.cardVariant.count();
  console.log('PostgreSQL 연결 및 catalog migration 확인 완료');
} finally { await prisma.$disconnect(); }
