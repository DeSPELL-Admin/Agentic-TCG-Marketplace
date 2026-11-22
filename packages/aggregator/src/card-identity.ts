import { randomUUID } from 'node:crypto';

export interface ExternalCardReference {
  provider: 'TCGDEX';
  externalId: string;
  language: string;
  edition: string;
  condition: string;
}

/** 영구 매핑은 후속 DB 구현이 이 인터페이스를 제공한다. */
export interface CardIdentityStore {
  getOrCreateId(reference: ExternalCardReference): Promise<string>;
  findById(id: string): Promise<ExternalCardReference | null>;
}

/** 독립 시연·테스트 전용. 같은 인스턴스 내에서만 UUID를 보존한다. */
export function createInMemoryCardIdentityStore(): CardIdentityStore {
  const ids = new Map<string, string>();
  const references = new Map<string, ExternalCardReference>();
  return {
    async getOrCreateId(reference) {
      const key = JSON.stringify([reference.provider, reference.externalId, reference.language, reference.edition, reference.condition]);
      const existing = ids.get(key);
      if (existing) return existing;
      const id = randomUUID();
      ids.set(key, id);
      references.set(id, { ...reference });
      return id;
    },
    async findById(id) {
      const reference = references.get(id);
      return reference ? { ...reference } : null;
    },
  };
}
