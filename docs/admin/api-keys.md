# Admin API Keys

## Endpoints (ADMIN only)
- `POST /admin/api-keys`
- `GET /admin/api-keys`
- `PATCH /admin/api-keys/:id/deactivate`
- `PATCH /admin/api-keys/:id/activate`

## Behavior
- Plain API key is shown only once when created.
- Only hash is stored (`keyHash`).
- Public endpoints can require `x-api-key` when `PUBLIC_API_KEY_REQUIRED=true`.
- `lastUsedAt` is updated on each successful usage.
