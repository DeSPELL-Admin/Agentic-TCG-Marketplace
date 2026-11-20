import { expect, it } from 'vitest';
import { createPrismaClient } from '../src/index.js';

it('연결 없이 독립 Client를 생성하고 종료할 수 있다', async () => {
  const prisma = createPrismaClient('postgresql://tcg:local@localhost:5432/tcg');
  expect(prisma.cardVariant).toBeDefined();
  await prisma.$disconnect();
});
it.skipIf(!process.env.DATABASE_TEST_URL)('실제 DB의 catalog 모델을 조회한다 (선택 통합 테스트)', async () => {
  const prisma = createPrismaClient(process.env.DATABASE_TEST_URL!);
  try {
    await prisma.$connect();
    expect(await prisma.cardVariant.count()).toBeGreaterThanOrEqual(0);
  } finally { await prisma.$disconnect(); }
});
