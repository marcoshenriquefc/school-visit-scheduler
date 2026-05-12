# Documentação Técnica Completa da API

## 1) Visão geral e execução do projeto

- **Stack**: Node.js + Express 5 + TypeScript + Prisma + SQLite.
- **Entry points**:
  - `src/server.ts` (boot do servidor e job agendado)
  - `src/app.ts` (middlewares globais + registro de rotas)

### Como executar
1. `cp .env.example .env`
2. `npm install`
3. `npm run prisma:generate`
4. `npm run prisma:migrate -- --name init`
5. `npm run seed`
6. `npm run dev`

### Variáveis de ambiente (mapeadas no código)
- `NODE_ENV` (default: `development`)
- `PORT` (default: `3000`)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ENABLE_RUBEUS_RETRY_JOB`
- `RUBEUS_RETRY_HOUR`
- `PUBLIC_API_KEY_REQUIRED` (quando `true`, exige `x-api-key` em `/public/*`)

## 2) Convenções globais da API

## Base URL e prefixos
- Sem versionamento explícito (`/v1`, `/v2` etc. **não existe**).
- Prefixos globais:
  - `/auth` (autenticação)
  - `/admin` (backoffice protegido por JWT/roles, com exceções por rota)
  - `/public` (API pública, opcionalmente protegida por API Key)
  - `/health`

## Middlewares globais
- `cors`, `helmet`, `morgan('dev')`, `express.json()`.
- `errorHandler` padroniza erros.

## Autenticação e autorização
- **JWT Bearer** via header `Authorization: Bearer <token>`.
- Extração do usuário em `request.user`.
- Controle de permissão por `authorizeRoles(...roles)`.
- Roles identificadas no sistema:
  - `ADMIN`
  - `MARKETING`
  - `COMMERCIAL`
  - `OPERATIONAL`

## API Key pública
- Para `/public/*`, o middleware `apiKeyMiddleware` valida `x-api-key` se `PUBLIC_API_KEY_REQUIRED=true`.

## Formato padrão de erro
- `AppError`: `{ "message": string, "details": unknown|null }` com status customizado.
- `ZodError`: `400` com `{ "message": "Validation failed", "details": ... }`.
- Erro não tratado: `500` com `{ "message": "Internal server error" }`.

## 3) Estrutura de pastas (resumo técnico)

- `src/modules/*`: domínios (auth, users, units, grades, forms, formFields, availability, public, schedules, leads, apiKeys, dashboard, leadsExport).
- `src/middlewares/*`: autenticação, api key, tratamento de erros.
- `src/config/env.ts`: configuração de ambiente.
- `prisma/schema.prisma`: models/schemas do banco.
- `docs/*`: documentação funcional pré-existente.

## 4) Rotas completas por módulo

> **Observação**: todas as URLs abaixo são relativas ao host. Ex.: `http://localhost:3000`.

---

## 4.1 Health

### GET `/health`
- Finalidade: healthcheck.
- Auth: não.
- Headers: nenhum obrigatório.
- Query/params/body: não possui.
- Sucesso `200`:
```json
{ "status": "ok", "service": "handle-backend" }
```
- Erros: `500`.

---

## 4.2 Auth

### POST `/auth/login`
- Finalidade: autenticar usuário administrativo.
- Auth: não.
- Body:
```json
{ "email": "admin@school.com", "password": "StrongPass123" }
```
- Validação: `email` válido; `password` min 8.
- Sucesso `200` (exemplo):
```json
{ "token": "<jwt>", "user": { "id": "uuid", "name": "Admin", "email": "admin@school.com", "role": "ADMIN" } }
```
- Erros: `400`, `401`, `500`.

### GET `/auth/me`
- Finalidade: retornar usuário autenticado atual.
- Auth: **Bearer obrigatório**.
- Headers: `Authorization`.
- Sucesso `200`:
```json
{ "user": { "userId": "uuid", "role": "ADMIN", "email": "admin@school.com" } }
```
- Erros: `401`, `500`.

---

## 4.3 Users (admin)

> Prefixo real: `/admin/users*`.
> Requer `ADMIN` em todas.

### POST `/admin/users`
- Body:
```json
{ "name": "Maria", "email": "maria@school.com", "password": "StrongPass123", "role": "MARKETING" }
```
- Validação: `name` min2, email, password min8, role enum.
- Sucesso `201`: objeto usuário.

### GET `/admin/users`
- Sucesso `200`: lista de usuários.

### GET `/admin/users/:id`
- Params: `id`.
- Sucesso `200`: usuário.

### PUT `/admin/users/:id`
- Body (parcial permitido):
```json
{ "name": "Maria Silva", "role": "COMMERCIAL" }
```
- Sucesso `200`: usuário atualizado.

### PATCH `/admin/users/:id/deactivate`
- Sucesso `200`: usuário desativado.

- Erros possíveis em todas: `400`, `401`, `403`, `404`, `500`.

---

## 4.4 Units

> Prefixo: `/admin/units*`.
> Auth JWT em todas.
> Roles: leitura (`ADMIN|MARKETING|COMMERCIAL|OPERATIONAL`), escrita (`ADMIN|MARKETING|COMMERCIAL`).

### GET `/admin/units`
- Query opcional: `isActive=true|false`, `name`, `identifier`.

### GET `/admin/units/:id`

### POST `/admin/units`
```json
{ "name": "Unidade Centro", "identifier": "CENTRO", "address": "Rua A, 100", "defaultCapacityPerHour": 20, "color": "#3366FF", "isActive": true }
```

### PUT `/admin/units/:id`
- Body parcial do schema de criação.

### PATCH `/admin/units/:id/deactivate`
### PATCH `/admin/units/:id/activate`

- Validações: `color` hex; `defaultCapacityPerHour` inteiro >0; etc.
- Códigos: `200/201/400/401/403/404/500`.

---

## 4.5 Grades

> Prefixo: `/admin/grades*`.
> Auth JWT em todas.

Rotas:
- `GET /admin/grades`
- `GET /admin/grades/:id`
- `POST /admin/grades`
- `PUT /admin/grades/:id`
- `PATCH /admin/grades/:id/deactivate`
- `PATCH /admin/grades/:id/activate`

Exemplo create:
```json
{ "name": "5º Ano", "identifier": "5ANO", "isActive": true }
```
Validações e códigos análogos a Units.

---

## 4.6 Forms

### GET `/admin/forms/:slug/public`
- **Inconsistência importante**: rota com nome “public”, mas sob prefixo `/admin` e **sem middleware explícito** na rota (porém o router é montado dentro de `/admin`; nesse arquivo essa rota está aberta).

### GET `/admin/forms`
- Query: `status`, `campaignIdentifier`, `title`, `slug`, `startDate`, `endDate`.

### GET `/admin/forms/:id`
### POST `/admin/forms`
```json
{ "campaignIdentifier": "CAMP-2026", "title": "Visita Guiada", "slug": "visita-guiada", "finalMessage": "Obrigado", "lgpdText": "Concordo", "startDate": "2026-05-01", "endDate": "2026-06-30", "status": "DRAFT" }
```
### PUT `/admin/forms/:id`
### PATCH `/admin/forms/:id/activate`
### PATCH `/admin/forms/:id/pause`
### PATCH `/admin/forms/:id/close`
### PUT `/admin/forms/:id/units`
```json
{ "unitIds": ["unit-uuid-1", "unit-uuid-2"] }
```
### PUT `/admin/forms/:id/grades`
```json
{ "gradeIds": ["grade-uuid-1", "grade-uuid-2"] }
```

- Validação crítica: `endDate >= startDate`.
- Auth: leitura (`ADMIN|MARKETING|COMMERCIAL|OPERATIONAL`), escrita (`ADMIN|MARKETING`).

---

## 4.7 Form Fields

> Prefixo: `/admin/forms/:formId/fields*`, JWT + roles `ADMIN|MARKETING`.
- Headers obrigatórios: `Authorization: Bearer <jwt>`.

### POST `/admin/forms/:formId/fields`
- Finalidade: criar campo dinâmico do formulário.
- Route params: `formId`.
- Body:
```json
{ "label": "Telefone", "name": "phone", "type": "PHONE", "placeholder": "(11) 99999-9999", "isRequired": true, "order": 1 }
```
- Validação: `label/name` obrigatórios, `type` enum; se `type` for `SELECT|RADIO|CHECKBOX`, `options` obrigatório.
- Sucesso: `201`.
- Erros: `400/401/403/404/500`.

### GET `/admin/forms/:formId/fields`
- Finalidade: listar campos do formulário.
- Route params: `formId`.
- Body: não possui.
- Sucesso: `200` (lista de campos).

### GET `/admin/forms/:formId/fields/:fieldId`
- Finalidade: buscar campo específico.
- Route params: `formId`, `fieldId`.
- Sucesso: `200`.

### PUT `/admin/forms/:formId/fields/:fieldId`
- Finalidade: atualizar definição do campo.
- Route params: `formId`, `fieldId`.
- Body: parcial do schema de criação.
- Sucesso: `200`.

### PATCH `/admin/forms/:formId/fields/:fieldId/activate`
### PATCH `/admin/forms/:formId/fields/:fieldId/deactivate`
- Finalidade: ativar/desativar campo.
- Route params: `formId`, `fieldId`.
- Body: não possui.
- Sucesso: `200`.

### PUT `/admin/forms/:formId/fields/reorder`
- Finalidade: reordenar campos.
- Route params: `formId`.
- Body:
```json
{ "fieldOrders": [{ "id": "field-uuid-1", "order": 0 }, { "id": "field-uuid-2", "order": 1 }] }
```
- Validação: array mínimo 1 item; `order` inteiro não negativo.
- Sucesso: `200`.

---

## 4.8 Availability (admin + public)

### Admin (`/admin`)
- Headers obrigatórios: `Authorization: Bearer <jwt>`.
- Roles:
  - escrita: `ADMIN|MARKETING`
  - leitura list: `ADMIN|MARKETING|COMMERCIAL|OPERATIONAL`

### POST `/admin/forms/:formId/availability/generate`
- Finalidade: geração em lote de slots.
- Body:
```json
{ "unitId": "unit-uuid", "startHour": "08:00", "endHour": "17:00", "slotDurationMinutes": 60, "weekdays": [1,2,3,4,5], "holidayDates": ["2026-12-25"] }
```
- Sucesso: `201`.

### POST `/admin/forms/:formId/availability`
- Finalidade: criação manual de slot.
- Body:
```json
{ "unitId": "unit-uuid", "date": "2026-05-20", "startTime": "09:00", "endTime": "10:00", "capacity": 20, "isBlocked": false }
```
- Sucesso: `201`.

### GET `/admin/forms/:formId/availability`
- Finalidade: listar slots por formulário.
- Query: `unitId`, `date`, `isBlocked=true|false`.
- Sucesso: `200`.

### PATCH `/admin/availability/:slotId/block`
- Body:
```json
{ "blockReason": "Feriado local" }
```
- Validação: `blockReason` min 3.

### PATCH `/admin/availability/:slotId/unblock`
### PUT `/admin/availability/:slotId`
### DELETE `/admin/availability/:slotId`
- Finalidade: desbloquear/editar/remover slot.
- Em `PUT`, body parcial do schema de criação manual.
- Sucesso: `200`.

### Public (`/public`, com `x-api-key` quando habilitado)
- Headers: `x-api-key` (obrigatório quando `PUBLIC_API_KEY_REQUIRED=true`).

### GET `/public/forms/:slug/availability/dates?unitId=...`
- Query obrigatória: `unitId`.
- Finalidade: retornar datas com disponibilidade para o formulário + unidade.

### GET `/public/forms/:slug/availability/times?unitId=...&date=YYYY-MM-DD&includeFull=true|false`
- Query obrigatória: `unitId`, `date`.
- Query opcional: `includeFull`.
- Finalidade: retornar horários disponíveis (ou também lotados, quando `includeFull=true`).

---

## 4.9 Public Forms (`/public`)

- `GET /public/forms/:slug`
- `GET /public/forms/:slug/units`
- `GET /public/forms/:slug/grades`
- `GET /public/forms/:slug/fields`

Auth: API key condicional (`x-api-key`) por configuração.
- `GET /public/forms/:slug`: metadados públicos do formulário.
- `GET /public/forms/:slug/units`: unidades associadas e ativas para agendamento.
- `GET /public/forms/:slug/grades`: séries associadas e ativas para agendamento.
- `GET /public/forms/:slug/fields`: campos dinâmicos ativos exibidos no formulário.
- Route params: `slug` obrigatório em todas.
- Códigos comuns: `200/401(api-key)/404/500`.

---

## 4.10 Schedules (`/public`)

- Headers: `x-api-key` quando habilitado.

### POST /public/schedules
- Finalidade: criar lead + agendamento.
- Body:
```json
{ "formId": "form-uuid", "unitId": "unit-uuid", "gradeId": "grade-uuid", "availabilitySlotId": "slot-uuid", "name": "João da Silva", "email": "joao@email.com", "phone": "11999998888", "lgpdAccepted": true, "dynamicFields": { "childName": "Pedro" } }
```
- Validação: `lgpdAccepted` deve ser `true`; `email` válido; `phone` min 8.
- Sucesso `201` (normalmente retorna lead/schedule + `cancelToken`).

### PATCH cancel
- Rota: `PATCH /public/schedules/:leadId/cancel`
- Finalidade: cancelar agendamento existente.
- Route params: `leadId`.
- Body:
```json
{ "cancelToken": "1234567890abcdef" }
```
- Validação: `cancelToken` min 16.
- Sucesso `200`.

### PATCH reschedule
- Rota: `PATCH /public/schedules/:leadId/reschedule`
- Finalidade: remarcar para outro slot.
- Route params: `leadId`.
- Body:
```json
{ "cancelToken": "1234567890abcdef", "newAvailabilitySlotId": "slot-uuid-2" }
```
- Validação: `cancelToken` min 16 + `newAvailabilitySlotId` obrigatório.
- Sucesso `200`.

Códigos comuns: `200/201/400/401(api-key)/404/409/500`.

---

## 4.11 Leads (`/admin`)

JWT + roles `ADMIN|MARKETING|COMMERCIAL|OPERATIONAL`.

### GET `/admin/leads`
- Finalidade: listagem paginada/filtrada de leads.
- Query suportada: `formId, unitId, gradeId, status, rubeusStatus, startDate, endDate, search, page, limit`.
- Defaults de paginação: `page=1`, `limit=20`, `limit` máximo 100.

### GET `/admin/leads/:id`
- Finalidade: detalhe de lead específico.
- Route params: `id`.

### PATCH `/admin/leads/:id/status`
- Finalidade: atualizar status operacional/comercial do lead.
- Route params: `id`.
- Body:
```json
{ "status": "ATTENDED" }
```
- Status permitidos: `SCHEDULED|ATTENDED|NO_SHOW|RESCHEDULED|CANCELED`.
- Sucesso `200`.

---

## 4.12 Leads Export (`/admin`)

Roles: `ADMIN|MARKETING|COMMERCIAL`.

### GET `/admin/leads/export/csv`
- Finalidade: exportar leads em CSV.
- Query: recebida e repassada ao serviço (sem schema zod explícito no controller).
- Resposta: arquivo com `Content-Type: text/csv`.

### GET `/admin/leads/export/pdf`
- Finalidade: exportar leads em PDF (estrutura textual).
- Query: recebida e repassada ao serviço.
- Resposta: arquivo com `Content-Type: application/pdf`.

Headers de resposta:
- CSV: `Content-Type: text/csv`
- PDF: `Content-Type: application/pdf`

---

## 4.13 API Keys (`/admin`)

Somente `ADMIN`.

- `POST /admin/api-keys`
```json
{ "name": "WordPress Production" }
```
- Validação create: `name` string min 2.

### GET `/admin/api-keys`
- Finalidade: listar chaves e status.

### PATCH `/admin/api-keys/:id/deactivate`
### PATCH `/admin/api-keys/:id/activate`
- Finalidade: alternar status da chave.
- Route params: `id`.
- Body: não possui.
- Códigos comuns: `200/400/401/403/404/500`.

---

## 4.14 Dashboard (`/admin`)

- `GET /admin/dashboard`
- Roles: `ADMIN|MARKETING|COMMERCIAL|OPERATIONAL`
- Query: repassada ao serviço como dicionário (sem schema zod explícito no controller).
- Uso: endpoint agregador para KPIs (leads, ocupação, distribuição temporal/status) conforme filtros enviados.
- Headers obrigatórios: `Authorization: Bearer <jwt>`.
- Códigos comuns: `200/400/401/403/500`.

---

## 5) Dependências entre endpoints (fluxo típico)

1. `POST /auth/login` → obter JWT.
2. Admin cria/gerencia `units`, `grades`, `forms`.
3. Admin vincula `forms` a `units` e `grades`.
4. Admin define `formFields`.
5. Admin gera `availability`.
6. Front público consulta `/public/forms/:slug*` e disponibilidade.
7. Front público cria `schedule`.
8. Operação acompanha via `/admin/leads*` e `/admin/dashboard`.
9. Exportação via `/admin/leads/export/*`.

## 6) Rotas dinâmicas/geradas automaticamente

- Não há geração automática de rotas em runtime; todas estão declaradas estaticamente com `express.Router()`.
- Dinamismo está apenas em **path params** (`:id`, `:slug`, `:formId`, `:slotId`, `:leadId`) e query params.

## 7) Problemas encontrados (duplicidades/obsolescência/inconsistência)

1. **Sem versionamento de API** (risco de breaking changes).
2. **Rota inconsistente**: `GET /admin/forms/:slug/public` parece funcionalmente pública, mas está no namespace admin.
3. **Padronização de resposta de sucesso não uniforme** (algumas listas, alguns objetos, alguns binários CSV/PDF).
4. **Validação ausente/limitada em alguns pontos**:
   - `dashboard` query sem schema zod explícito no controller.
   - params de rota (`:id`, etc.) sem validação de formato no controller.
5. **Mensageria de erros potencialmente heterogênea** (depende das mensagens dos services/AppError).

## 8) Endpoints sem validação ou com validação parcial

- Sem schema de query explícito no controller:
  - `GET /admin/dashboard`
  - Export endpoints (`/admin/leads/export/csv` e `/pdf`) usam cast genérico.
- Sem schema explícito para params em todos os módulos.

## 9) Padrão de erros e mensagens possíveis

Estruturas observadas:
```json
{ "message": "Unauthorized", "details": null }
```
```json
{ "message": "Forbidden", "details": null }
```
```json
{ "message": "Missing API key", "details": null }
```
```json
{ "message": "Validation failed", "details": { "formErrors": [], "fieldErrors": {} } }
```
```json
{ "message": "Internal server error" }
```

## 10) Coleção compatível com Postman/Insomnia (JSON)

> Importar manualmente o JSON abaixo em Postman/Insomnia.

```json
{
  "info": { "name": "School Visit Scheduler API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "jwt", "value": "" },
    { "key": "apiKey", "value": "" }
  ],
  "item": [
    { "name": "Health", "request": { "method": "GET", "url": "{{baseUrl}}/health" } },
    { "name": "Auth Login", "request": { "method": "POST", "header": [{"key":"Content-Type","value":"application/json"}], "body": { "mode": "raw", "raw": "{\n  \"email\": \"admin@school.com\",\n  \"password\": \"StrongPass123\"\n}" }, "url": "{{baseUrl}}/auth/login" } },
    { "name": "Auth Me", "request": { "method": "GET", "header": [{"key":"Authorization","value":"Bearer {{jwt}}"}], "url": "{{baseUrl}}/auth/me" } },
    { "name": "Admin Users List", "request": { "method": "GET", "header": [{"key":"Authorization","value":"Bearer {{jwt}}"}], "url": "{{baseUrl}}/admin/users" } },
    { "name": "Admin Units List", "request": { "method": "GET", "header": [{"key":"Authorization","value":"Bearer {{jwt}}"}], "url": "{{baseUrl}}/admin/units" } },
    { "name": "Admin Grades List", "request": { "method": "GET", "header": [{"key":"Authorization","value":"Bearer {{jwt}}"}], "url": "{{baseUrl}}/admin/grades" } },
    { "name": "Admin Forms List", "request": { "method": "GET", "header": [{"key":"Authorization","value":"Bearer {{jwt}}"}], "url": "{{baseUrl}}/admin/forms" } },
    { "name": "Public Form", "request": { "method": "GET", "header": [{"key":"x-api-key","value":"{{apiKey}}"}], "url": "{{baseUrl}}/public/forms/{{slug}}" } },
    { "name": "Public Availability Dates", "request": { "method": "GET", "header": [{"key":"x-api-key","value":"{{apiKey}}"}], "url": "{{baseUrl}}/public/forms/{{slug}}/availability/dates?unitId={{unitId}}" } },
    { "name": "Public Availability Times", "request": { "method": "GET", "header": [{"key":"x-api-key","value":"{{apiKey}}"}], "url": "{{baseUrl}}/public/forms/{{slug}}/availability/times?unitId={{unitId}}&date=2026-05-20" } },
    { "name": "Create Schedule", "request": { "method": "POST", "header": [{"key":"Content-Type","value":"application/json"},{"key":"x-api-key","value":"{{apiKey}}"}], "body": { "mode": "raw", "raw": "{\n  \"formId\": \"form-uuid\",\n  \"unitId\": \"unit-uuid\",\n  \"gradeId\": \"grade-uuid\",\n  \"availabilitySlotId\": \"slot-uuid\",\n  \"name\": \"João da Silva\",\n  \"email\": \"joao@email.com\",\n  \"phone\": \"11999998888\",\n  \"lgpdAccepted\": true\n}" }, "url": "{{baseUrl}}/public/schedules" } }
  ]
}
```

## 11) Lista consolidada de TODAS as rotas encontradas

- `GET /health`
- `POST /auth/login`
- `GET /auth/me`
- `POST /admin/users`
- `GET /admin/users`
- `GET /admin/users/:id`
- `PUT /admin/users/:id`
- `PATCH /admin/users/:id/deactivate`
- `GET /admin/units`
- `GET /admin/units/:id`
- `POST /admin/units`
- `PUT /admin/units/:id`
- `PATCH /admin/units/:id/deactivate`
- `PATCH /admin/units/:id/activate`
- `GET /admin/grades`
- `GET /admin/grades/:id`
- `POST /admin/grades`
- `PUT /admin/grades/:id`
- `PATCH /admin/grades/:id/deactivate`
- `PATCH /admin/grades/:id/activate`
- `GET /admin/forms/:slug/public`
- `GET /admin/forms`
- `GET /admin/forms/:id`
- `POST /admin/forms`
- `PUT /admin/forms/:id`
- `PATCH /admin/forms/:id/activate`
- `PATCH /admin/forms/:id/pause`
- `PATCH /admin/forms/:id/close`
- `PUT /admin/forms/:id/units`
- `PUT /admin/forms/:id/grades`
- `POST /admin/forms/:formId/fields`
- `GET /admin/forms/:formId/fields`
- `GET /admin/forms/:formId/fields/:fieldId`
- `PUT /admin/forms/:formId/fields/:fieldId`
- `PATCH /admin/forms/:formId/fields/:fieldId/activate`
- `PATCH /admin/forms/:formId/fields/:fieldId/deactivate`
- `PUT /admin/forms/:formId/fields/reorder`
- `POST /admin/forms/:formId/availability/generate`
- `POST /admin/forms/:formId/availability`
- `GET /admin/forms/:formId/availability`
- `PATCH /admin/availability/:slotId/block`
- `PATCH /admin/availability/:slotId/unblock`
- `PUT /admin/availability/:slotId`
- `DELETE /admin/availability/:slotId`
- `GET /admin/leads`
- `GET /admin/leads/:id`
- `PATCH /admin/leads/:id/status`
- `POST /admin/api-keys`
- `GET /admin/api-keys`
- `PATCH /admin/api-keys/:id/deactivate`
- `PATCH /admin/api-keys/:id/activate`
- `GET /admin/dashboard`
- `GET /admin/leads/export/csv`
- `GET /admin/leads/export/pdf`
- `GET /public/forms/:slug`
- `GET /public/forms/:slug/units`
- `GET /public/forms/:slug/grades`
- `GET /public/forms/:slug/fields`
- `GET /public/forms/:slug/availability/dates`
- `GET /public/forms/:slug/availability/times`
- `POST /public/schedules`
- `PATCH /public/schedules/:leadId/cancel`
- `PATCH /public/schedules/:leadId/reschedule`
