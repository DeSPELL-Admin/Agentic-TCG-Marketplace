import { expect, it } from 'vitest';
import { parseApiEnv } from '../src/index.js';

it('문자열 false는 false로 파싱한다', () => {
  expect(parseApiEnv({ DATABASE_ENABLED: 'false' }).DATABASE_ENABLED).toBe(false);
});
it('DB 활성화 시 URL이 필요하며 미구현 실제 데이터 모드는 거부한다', () => {
  expect(() => parseApiEnv({ DATABASE_ENABLED: 'true' })).toThrow();
  expect(() => parseApiEnv({ DATA_MODE: 'live' })).toThrow();
});
