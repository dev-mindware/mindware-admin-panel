# doc-generator-e2e

Testes de ponta a ponta (Playwright) da app `doc-generator`, com a API simulada (`mock-api.ts`): não precisam de base de dados nem de backend.

```bash
pnpm --filter doc-generator build                 # pré-requisito
pnpm --filter doc-generator-e2e exec playwright install chromium   # uma vez, se o browser não existir
pnpm --filter doc-generator-e2e test              # todos os ecrãs
pnpm --filter doc-generator-e2e test:mobile       # só os dois telefones
```

Ecrãs: `phone-360`, `phone-390`, `tablet-768`, `desktop`.

- `responsive.spec.ts` — em cada rota: sem scroll horizontal, sem erros na consola, alvos de toque ≥ 44 px, campos com letra ≥ 16 px (o iOS faz zoom abaixo disso) e com nome acessível. Guarda capturas em `screenshots/`.
- `flows.spec.ts` — fluxos: criar e mover actividades, calendário, notificações, contrato e declaração (validação, pré-visualização, gravação), relatórios, utilizadores, navegação.

> O `@playwright/test` vive neste pacote e **não** na raiz nem na app: como dependência opcional do `next`, noutro sítio altera a resolução do `next`/`nuqs` e pode duplicá-los.
