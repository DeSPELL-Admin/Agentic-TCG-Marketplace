# 로컬 인프라

저장소 루트에서 `pnpm infra:up`으로 PostgreSQL 17을 실행합니다. Docker Engine이 필요하며 127.0.0.1:5432만 공개합니다. `pnpm infra:down`은 컨테이너를 종료하고 볼륨은 유지합니다.

연결 문자열은 루트 `.env.example`을 참고하세요. API의 DB 연결은 `DATABASE_ENABLED=true`로 활성화합니다. `pnpm db:migrate`, `pnpm db:check` 순서로 스키마와 실제 연결을 검증하세요. DB가 없어도 Mock 데모는 실행됩니다.
