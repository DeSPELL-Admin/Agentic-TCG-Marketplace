import { expect, it } from 'vitest';
import { formatUsdc } from '../src/lib/api';

it('USDC 소수 6자리와 큰 값을 손실 없이 표시한다', () => {
  expect(formatUsdc('12500000')).toBe('12.5 USDC');
  expect(formatUsdc('1')).toBe('0.000001 USDC');
  expect(formatUsdc('0')).toBe('0 USDC');
  expect(formatUsdc('9007199254740993000001')).toBe('9,007,199,254,740,993.000001 USDC');
});
