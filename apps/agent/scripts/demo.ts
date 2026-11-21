import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createAggregatorService, createMockCardAdapter } from '@tcg/aggregator';
import { createMockPriceAdapter, createValuationService } from '@tcg/valuation';
import { createAgentRuntime } from '../src/index.js';

const rootEnvFile = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

if (!process.env.OPENAI_API_KEY?.trim()) {
  throw new Error('OPENAI_API_KEY를 설정해 주세요.');
}

const aggregatorService = createAggregatorService({ adapter: createMockCardAdapter() });
const valuationService = createValuationService({
  aggregatorService,
  adapter: createMockPriceAdapter(),
});
const runtime = createAgentRuntime({
  aggregatorService,
  valuationService,
  model: process.env.OPENAI_MODEL?.trim() || undefined,
});

console.log(await runtime.runAgentTurn(process.argv.slice(2).join(' ') || '피카츄 적정가 알려줘'));
