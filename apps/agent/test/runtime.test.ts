import { Usage, type Model, type ModelRequest, type ModelResponse } from '@openai/agents';
import { createAggregatorService, createMockCardAdapter, mockCards } from '@tcg/aggregator';
import { createMockPriceAdapter, createValuationService } from '@tcg/valuation';
import { expect, it, vi } from 'vitest';
import { createAgentRuntime } from '../src/index.js';

type ModelOutput = ModelResponse['output'][number];

function toolCall(name: string, args: object, callId: string): ModelOutput {
  return { type: 'function_call', name, callId, arguments: JSON.stringify(args) };
}

function reply(text: string): ModelOutput {
  return { type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text }] };
}

function setup(...steps: ((request: ModelRequest) => ModelOutput)[]) {
  const model: Model = {
    getResponse: vi.fn(async (request) => {
      const next = steps.shift();
      if (!next) throw new Error('예상하지 못한 모델 호출입니다.');
      return { output: [next(request)], usage: new Usage() };
    }),
    async *getStreamedResponse() {
      throw new Error('스트리밍 응답은 이 테스트에서 사용하지 않습니다.');
    },
  };
  const aggregatorService = createAggregatorService({ adapter: createMockCardAdapter() });
  const valuationService = createValuationService({ aggregatorService, adapter: createMockPriceAdapter() });
  const searchCards = vi.spyOn(aggregatorService, 'searchCards');
  const getValuation = vi.spyOn(valuationService, 'getValuation');
  const runtime = createAgentRuntime({ aggregatorService, valuationService, model });
  return { runtime, model, searchCards, getValuation };
}

function toolResult(request: ModelRequest, callId: string) {
  if (!Array.isArray(request.input)) throw new Error('도구 결과가 모델 입력에 없습니다.');
  const result = request.input.find(item => item.type === 'function_call_result' && item.callId === callId);
  if (result?.type !== 'function_call_result') {
    throw new Error(`도구 호출 ${callId}의 JSON 결과가 없습니다.`);
  }
  const { output } = result;
  if (typeof output === 'string') return JSON.parse(output) as unknown;
  if (!Array.isArray(output) && output.type === 'text') return JSON.parse(output.text) as unknown;
  throw new Error(`도구 호출 ${callId}의 결과가 텍스트 형식이 아닙니다.`);
}

it('빈 한국어 검색 후 영문 이름으로 찾은 카드의 Mock 적정가를 모델에 전달한다', async () => {
  const pikachu = mockCards[0]!;
  const answer = 'Pikachu SV 025 EN NORMAL NM의 시연용 Mock 적정가는 12 USDC입니다.';
  const { runtime, searchCards, getValuation } = setup(
    request => {
      expect(request.tools.map(tool => tool.name)).toEqual(['search_cards', 'get_valuation']);
      return toolCall('search_cards', { query: '피카츄' }, 'ko');
    },
    request => {
      expect(toolResult(request, 'ko')).toEqual({ items: [], nextCursor: null });
      return toolCall('search_cards', { query: 'Pikachu' }, 'en');
    },
    request => {
      expect(toolResult(request, 'en')).toEqual({ items: [pikachu], nextCursor: null });
      return toolCall('get_valuation', { cardVariantId: pikachu.id }, 'price');
    },
    request => {
      expect(toolResult(request, 'price')).toMatchObject({
        cardVariantId: pikachu.id,
        dataSource: 'MOCK',
        status: 'AVAILABLE',
        estimatedPrice: '12000000',
      });
      return reply(answer);
    },
  );

  await expect(runtime.runAgentTurn('피카츄 적정가 알려줘')).resolves.toBe(answer);
  expect(searchCards.mock.calls).toEqual([
    [{ query: '피카츄', limit: 10 }],
    [{ query: 'Pikachu', limit: 10 }],
  ]);
  expect(getValuation.mock.calls).toEqual([[pikachu.id]]);
});

it('표본 부족 상태와 null 가격을 모델에 전달한다', async () => {
  const eevee = mockCards[2]!;
  const answer = 'Eevee SV 133은 시연용 데이터의 표본이 부족해 적정가를 확인할 수 없습니다.';
  const { runtime } = setup(
    () => toolCall('search_cards', { query: 'Eevee' }, 'search'),
    () => toolCall('get_valuation', { cardVariantId: eevee.id }, 'price'),
    request => {
      expect(toolResult(request, 'price')).toMatchObject({
        cardVariantId: eevee.id,
        dataSource: 'MOCK',
        status: 'INSUFFICIENT_DATA',
        estimatedPrice: null,
      });
      return reply(answer);
    },
  );

  await expect(runtime.runAgentTurn('Eevee 적정가 알려줘')).resolves.toBe(answer);
});

it('빈 입력을 모델 호출 전에 거부한다', async () => {
  const { runtime, model } = setup();
  await expect(runtime.runAgentTurn('   ')).rejects.toThrow('메시지를 입력해 주세요.');
  expect(model.getResponse).not.toHaveBeenCalled();
});
