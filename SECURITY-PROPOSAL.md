# Proposta de segurança de acesso ao portal Mindware

## Situação actual (observada no código)

- O portal (`apps/portal`) é só um *reverse proxy* de zones (`/mindgest`, `/mindschool`, `/affiliate`, `/doc-generator`) e uma página pública de entrada. Não autentica ninguém: cada app tem o seu login.
- MindSchool: cookies `httpOnly`, `sameSite=lax`, `secure` em produção; access token 1 h, refresh 7 dias; exige papel `admin_sistema`; já tem MFA (TOTP) e *step-up*.
- Os cookies têm `path=/` e o mesmo domínio para todas as zones: um XSS numa app expõe a sessão de todas as outras.
- O portal e as apps não definem cabeçalhos de segurança (CSP, HSTS, etc.).
- A página do portal é pública e lista todas as aplicações internas.
- Não há limitação de tentativas nem alertas ao nível do portal.

## Proposta, por prioridade

### P0 — Rápido, sem mudar arquitectura
1. **Cabeçalhos de segurança** no `next.config.ts` do portal e das apps (`headers()`): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Permissions-Policy` mínima e uma **CSP** (começar em *report-only*).
2. **Cookies mais restritos**: prefixo `__Host-` (exige `secure`, `path=/`, sem `domain`), `sameSite=strict` para o refresh token, access token com 15 min em vez de 1 h.
3. **`noindex`** (`robots`) no portal e apps: portal interno não deve ser indexado.
4. **Rate limiting** no proxy do portal (por IP) para `/*/auth/login` e `/api/auth/refresh`, mais *lockout* progressivo no backend.
5. **MFA obrigatório** para `admin_sistema` (hoje existe mas é opcional por conta): bloquear o acesso até à inscrição TOTP.

### P1 — Controlo de acesso à rede e à sessão
6. **Restrição de rede**: o painel só acessível via VPN / lista de IPs permitidos (Cloudflare Access, WireGuard ou *allowlist* no Nginx). É a medida de maior impacto para um portal de administração.
7. **Sessões**: ligar refresh token ao dispositivo (rotação a cada uso + detecção de reutilização, que invalida toda a família), timeout por inactividade (ex. 30 min), logout global e lista de sessões activas na página de conta.
8. **Re-autenticação (step-up)** para operações sensíveis (personificação, alterar planos/cupões, gerir admins) — já existe no MindSchool; estender ao Mindgest/Afiliados/DocGen.
9. **Validação de origem** em server actions (`allowedOrigins`) restringida aos domínios reais; remover `*.vercel.app` e `localhost` em produção.

### P2 — Identidade unificada e observabilidade
10. **SSO central (OIDC)** — um único IdP (Keycloak/Entra/Auth0) com MFA e políticas de palavra-passe; o portal passa a ser o ponto de entrada autenticado e só mostra as apps a que o utilizador tem direito. Reduz 4 logins separados a 1, e permite revogar acesso num único sítio.
11. **Passkeys / WebAuthn** como segundo factor preferencial (resistente a phishing).
12. **Auditoria**: registar logins, falhas, step-ups e personificações num log central imutável; alertas para novos dispositivos/IPs, múltiplas falhas e acessos fora de horas.
13. **Higiene**: `pnpm audit`/Dependabot no CI, segredos só em variáveis de ambiente (nunca `NEXT_PUBLIC_*` para segredos), `SESSION_SECRET` rodado periodicamente.

## Roadmap sugerido
| Fase | Itens | Esforço |
|---|---|---|
| 1 (esta semana) | 1, 2, 3, 5 | Baixo |
| 2 (2–3 semanas) | 4, 6, 7, 9 | Médio |
| 3 (trimestre) | 8, 10, 11, 12 | Alto |

## Decisões em aberto
- Existe infra para VPN/Cloudflare Access? (determina o item 6)
- Querem SSO único ou manter logins por app com MFA obrigatório?
- Quem são os utilizadores do portal (só equipa interna, ou também parceiros/afiliados)? Afiliados externos justificam um login separado do dos admins.
