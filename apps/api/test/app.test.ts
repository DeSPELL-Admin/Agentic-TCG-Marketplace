import { afterEach, describe, expect, it } from 'vitest';
import { cardSearchResponseSchema, errorResponseSchema, valuationSchema } from '@tcg/contracts';
import { parseApiEnv } from '@tcg/config';
import { buildApp, requireAuth } from '../src/app.js';

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
async function createApp(options: Parameters<typeof buildApp>[0] = {}) {
  const app = await buildApp({ env: parseApiEnv({ NODE_ENV: 'test' }), ...options });
  apps.push(app);
  return app;
}
afterEach(async () => { await Promise.all(apps.splice(0).map(app => app.close())); });
describe('Core API 통합', () => {
  it('공개 패키지 import 및 REST 응답이 계약과 일치한다', async () => {
    const app = await createApp();
    const response = await app.inject('/api/cards?q=pika&limit=1');
    expect(response.statusCode).toBe(200);
    const { items } = cardSearchResponseSchema.parse(response.json());
    expect(items[0]?.name).toBe('Pikachu');
    const valuation = await app.inject(`/api/cards/${items[0]!.id}/valuation`);
    expect(valuation.statusCode).toBe(200);
    expect(valuationSchema.parse(valuation.json()).dataSource).toBe('MOCK');
    expect((await app.inject(`/api/cards/${items[0]!.id}`)).json().name).toBe('Pikachu');
  });
  it('잘못된 입력은 400, 존재하지 않는 카드는 404로 처리한다', async () => {
    const app = await createApp();
    for (const path of ['/api/cards?limit=0', '/api/cards?limit=abc', '/api/cards/not-a-uuid/valuation']) {
      const response = await app.inject(path);
      expect(response.statusCode).toBe(400);
      expect(errorResponseSchema.parse(response.json()).error.code).toBe('VALIDATION_ERROR');
    }
    const response = await app.inject('/api/cards/00000000-0000-4000-8000-000000000099/valuation');
    expect(response.statusCode).toBe(404);
  });
  it('가격 부족과 Mock 모드를 명확히 응답한다', async () => {
    const app = await createApp();
    expect((await app.inject('/api/cards/00000000-0000-4000-8000-000000000003/valuation')).json()).toMatchObject({ status: 'INSUFFICIENT_DATA', estimatedPrice: null });
    expect((await app.inject('/health')).json()).toMatchObject({ dataMode: 'mock', database: 'disabled' });
  });
  it('외부 ID 헤더를 신뢰하지 않으며 보호된 통합 플러그인은 인증을 요구한다', async () => {
    const app = await createApp({ createIntegrationPlugins: async () => [async plugin => {
      plugin.get('/protected', async request => requireAuth(request));
    }] });
    const response = await app.inject({ url: '/protected', headers: { 'x-user-id': 'forged-user' } });
    expect(response.statusCode).toBe(401);
  });
  it('인증 제공자가 검증한 컨텍스트를 통합 모듈에 전달한다', async () => {
    const userId = '00000000-0000-4000-8000-000000000010';
    const app = await createApp({ resolveAuth: async () => ({ userId }), createIntegrationPlugins: async deps => {
      expect(deps.aggregatorService).toBeDefined();
      expect(deps.valuationService).toBeDefined();
      expect(deps.prisma).toBeNull();
      return [async plugin => { plugin.get('/protected', async request => requireAuth(request)); }];
    } });
    expect((await app.inject('/protected')).json()).toEqual({ userId });
  });
});
