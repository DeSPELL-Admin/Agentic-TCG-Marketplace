import { createOpenAIDecisionApi } from '../src/index.js';
import { intentCases } from '../test/fixtures/intents.js';
import { loadOpenAIEnv } from './env.js';

loadOpenAIEnv();

const decisionApi = createOpenAIDecisionApi(process.env.OPENAI_DECISION_MODEL?.trim() || undefined);
let passed = 0;
const concurrency = 4;

for (let offset = 0; offset < intentCases.length; offset += concurrency) {
  const batch = intentCases.slice(offset, offset + concurrency);
  const results = await Promise.allSettled(batch.map(({ message }) => decisionApi.classify(message)));
  for (const [index, { message, expected }] of batch.entries()) {
    const result = results[index];
    if (result?.status !== 'fulfilled') {
      console.error(`오류 | ${message} | ${result?.status === 'rejected' ? result.reason?.name ?? '호출 실패' : '결과 없음'}`);
      continue;
    }
    const actual = result.value;
    const matches = actual.route === expected.route && actual.language === expected.language;
    if (matches) passed += 1;
    console.log(`${matches ? '통과' : '불일치'} | ${message} | 기대 ${expected.route}/${expected.language} | 결과 ${actual.route}/${actual.language}`);
  }
}

console.log(`의도 분류 ${passed}/${intentCases.length} 통과`);
if (passed !== intentCases.length) process.exitCode = 1;
