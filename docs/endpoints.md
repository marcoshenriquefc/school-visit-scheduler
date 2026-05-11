# API Endpoints

## Public
- `POST /public/schedules`
- `PATCH /public/schedules/:leadId/cancel`
- `PATCH /public/schedules/:leadId/reschedule`
- `GET /public/forms/:slug`
- `GET /public/forms/:slug/units`
- `GET /public/forms/:slug/grades`
- `GET /public/forms/:slug/fields`
- `GET /public/forms/:slug/availability/dates?unitId=`
- `GET /public/forms/:slug/availability/times?unitId=&date=&includeFull=true|false`

## Admin Leads
- `GET /admin/leads`
- `GET /admin/leads/:id`
- `PATCH /admin/leads/:id/status`


## Admin API Keys
- `POST /admin/api-keys`
- `GET /admin/api-keys`
- `PATCH /admin/api-keys/:id/deactivate`
- `PATCH /admin/api-keys/:id/activate`


## Admin Dashboard
- `GET /admin/dashboard`

## Admin Leads Export
- `GET /admin/leads/export/csv`
- `GET /admin/leads/export/pdf`
