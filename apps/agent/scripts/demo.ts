import { createAggregatorService, createMockCardAdapter } from '@tcg/aggregator';
import { createMockPriceAdapter, createValuationService } from '@tcg/valuation';
import { createAgentRuntime, createOpenAIDecisionApi } from '../src/index.js';
import { loadOpenAIEnv } from './env.js';

loadOpenAIEnv();

const aggregatorService = createAggregatorService({ adapter: createMockCardAdapter() });
const valuationService = createValuationService({
  aggregatorService,
  adapter: createMockPriceAdapter(),
});
const runtime = createAgentRuntime({
  aggregatorService,
  valuationService,
  model: process.env.OPENAI_MODEL?.trim() || undefined,
  decisionApi: createOpenAIDecisionApi(process.env.OPENAI_DECISION_MODEL?.trim() || undefined),
});

console.log(await runtime.runAgentTurn(process.argv.slice(2).join(' ') || '피카츄 적정가 알려줘'));
