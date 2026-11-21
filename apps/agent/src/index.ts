import { Agent, Runner, type Model } from '@openai/agents';
import { createCardTools, type CardToolDependencies } from './tools.js';

export interface AgentRuntimeOptions extends CardToolDependencies {
  model?: string | Model;
}

const instructions = `
당신은 포켓몬 TCG 카드와 적정가를 조회하는 읽기 전용 도우미입니다.
사용자의 언어로 답하고, 카드 정보와 가격은 도구 응답을 근거로만 안내하세요.
카드 이름으로 먼저 검색하세요. 한국어 이름의 검색 결과가 없고 대응하는 영문 이름을
알고 있다면 영문 이름으로 다시 검색하세요.
사용자 조건에 맞는 variant가 여럿이면 세트, 카드 번호, 언어, 에디션, 상태를 바탕으로
후보를 안내하고 어느 카드인지 물어보세요. 결과가 없으면 검색 조건을 요청하세요.
적정가를 요청받고 variant가 특정되면 검색 결과의 ID로 가격을 조회하세요.
응답에는 카드 variant와 데이터 출처를 표시하세요. MOCK은 시연용 합성 시세임을
밝히고, INSUFFICIENT_DATA는 표본 부족으로 가격을 확인할 수 없다고 안내하세요.
estimatedPrice는 USDC 최소 단위 정수 문자열입니다. 소수점 6자리를 적용해 표시하세요.
도구 실패를 가격 또는 검색 결과 없음으로 해석하지 마세요.
`;

export function createAgentRuntime({ model, ...dependencies }: AgentRuntimeOptions) {
  const agent = new Agent({
    name: 'TCG 카드 조회 도우미',
    instructions,
    model,
    modelSettings: { store: false },
    tools: createCardTools(dependencies),
  });
  const runner = new Runner({ tracingDisabled: true });

  return {
    async runAgentTurn(input: string): Promise<string> {
      const message = input.trim();
      if (!message) throw new TypeError('메시지를 입력해 주세요.');

      const result = await runner.run(agent, message, { maxTurns: 6 });
      const output = result.finalOutput?.trim();
      if (!output) throw new Error('에이전트 응답이 비어 있습니다.');
      return output;
    },
  };
}
