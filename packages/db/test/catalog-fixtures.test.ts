import { expect, it } from 'vitest';
import { readCatalogFixtures, validateCatalogFixtures } from '../src/index.js';

it('Git 스냅샷은 무결성 검사를 통과하고 원본 ID와 가격 관측 시각을 보존한다', async () => {
  const data = await readCatalogFixtures();
  expect(data.cards).toHaveLength(5);
  expect(data.externalIdentities).toHaveLength(5);
  expect(data.koreanNames.translations).toHaveLength(1025);
  expect(data.koreanNames.localizedNames).toHaveLength(5);
  expect(data.priceSnapshots).toHaveLength(30);
  expect(data.cards[0]!.id).toBe('044f4a6d-386b-4bbc-9eb1-046266917174');
  expect(data.koreanNames.translations.find(row => row.speciesId === 25)?.koreanName).toBe('피카츄');
  expect(data.priceSnapshots.every(row => row.observedAt.startsWith('2026-11-21'))).toBe(true);
  expect(JSON.stringify(data)).not.toMatch(/assessment|password|DATABASE_URL|paymentAttempt/i);
});
it('허용하지 않은 필드와 중복 UUID를 거부한다', async () => {
  const data = await readCatalogFixtures();
  expect(() => validateCatalogFixtures({ ...data, assessments: [] })).toThrow();
  expect(() => validateCatalogFixtures({ ...data, cards: [...data.cards, data.cards[0]] })).toThrow();
  expect(() => validateCatalogFixtures({ ...data, cards: [{ ...data.cards[0], password: 'not-exportable' }, ...data.cards.slice(1)] })).toThrow();
});
it('끊어진 FK·잘못된 종명·원본 통화·시각의 모순을 DB 쓰기 전에 거부한다', async () => {
  const original = await readCatalogFixtures();
  for (const mutate of [
    (data: typeof original) => { data.externalIdentities.pop(); },
    (data: typeof original) => { data.koreanNames.localizedNames[0]!.name = '리자몽'; },
    (data: typeof original) => { data.priceSnapshots[0]!.externalId = 'wrong-external-id'; },
    (data: typeof original) => { data.priceSnapshots[0]!.originalCurrency = 'USD'; },
    (data: typeof original) => { data.priceSnapshots[0]!.observedAt = '2030-01-01T00:00:00Z'; },
  ]) {
    const data = structuredClone(original); mutate(data);
    expect(() => validateCatalogFixtures(data)).toThrow();
  }
});
