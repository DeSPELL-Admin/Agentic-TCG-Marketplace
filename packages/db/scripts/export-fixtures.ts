import { config } from 'dotenv';
import { createPrismaClient } from '../src/index.js';
import { writeCatalogFixtures } from '../src/catalog-fixtures.js';

// 명시적으로 공유할 수집 카드만 내보낸다. 전체 DB 덤프나 사용자 데이터 수집을 하지 않는다.
const cardIds = ['044f4a6d-386b-4bbc-9eb1-046266917174', '153ce175-5434-4a80-ad9f-a6737e380aa6', '24511913-a201-437a-a7cd-5c73d48ef058', '9257498a-187e-49e1-bb69-84f38d7f2e24', 'af6aca2b-f957-496a-b874-17e980759354'];
const sourceUrl = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/cd5f6c6232f23430aa6089896d96230f5f7ecef4/data/v2/csv/pokemon_species_names.csv';
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
config({ path: '../../.env', quiet: true });
let prisma: ReturnType<typeof createPrismaClient> | undefined;
try {
  if (!process.env.DATABASE_URL) throw new Error('Missing database URL');
  prisma = createPrismaClient(process.env.DATABASE_URL);
  const data = await prisma.$transaction(async tx => {
    const cards = await tx.cardVariant.findMany({ where: { id: { in: cardIds } }, orderBy: { id: 'asc' }, select: { id: true, game: true, name: true, setCode: true, cardNumber: true, language: true, edition: true, condition: true, imageUrl: true, externalIdentityId: true, lastCollectedAt: true } });
    if (cards.length !== cardIds.length) throw new Error('Missing selected cards');
    const externalIdentities = await tx.externalCardIdentity.findMany({ where: { id: { in: cardIds } }, orderBy: { id: 'asc' }, select: { id: true, provider: true, externalId: true, language: true, edition: true, condition: true, createdAt: true } });
    const translations = await tx.pokemonNameTranslation.findMany({ where: { sourceUrl, speciesId: { lte: 1025 } }, orderBy: { speciesId: 'asc' }, select: { speciesId: true, englishName: true, englishKey: true, koreanName: true, sourceUrl: true, importedAt: true } });
    const localizedNames = await tx.cardLocalizedName.findMany({ where: { cardVariantId: { in: cardIds }, locale: 'ko', source: 'POKEAPI_SPECIES', sourceUrl }, orderBy: { cardVariantId: 'asc' }, select: { cardVariantId: true, locale: true, name: true, source: true, sourceUrl: true, speciesId: true } });
    const allPrices = await tx.marketPriceSnapshot.findMany({ where: { cardVariantId: { in: cardIds } }, orderBy: [{ observedAt: 'desc' }, { id: 'asc' }], select: { id: true, cardVariantId: true, provider: true, externalId: true, providerVariant: true, priceType: true, originalCurrency: true, originalAmount: true, sourceUrl: true, observedAt: true, collectedAt: true } });
    const seen = new Set<string>();
    const priceSnapshots = allPrices.filter(price => {
      const key = JSON.stringify([price.cardVariantId, price.provider, price.providerVariant, price.priceType]);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).sort((a, b) => compare(a.id, b.id));
    return { cards, externalIdentities, koreanNames: { translations, localizedNames }, priceSnapshots };
  }, { isolationLevel: 'RepeatableRead' });
  const json = JSON.parse(JSON.stringify(data)); // Date를 원본 시각의 UTC 문자열로 변환한다.
  await writeCatalogFixtures(json);
  console.log(JSON.stringify({ cards: data.cards.length, names: data.koreanNames.translations.length, localizedNames: data.koreanNames.localizedNames.length, prices: data.priceSnapshots.length }));
} catch {
  console.error('수집 fixture 내보내기 실패. 명시한 카드와 사전 및 DB 연결을 확인하세요.');
  process.exitCode = 1;
} finally { await prisma?.$disconnect(); }
