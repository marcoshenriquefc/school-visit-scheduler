# Schedules

Criação: `POST /public/schedules`
Cancelamento: `PATCH /public/schedules/:leadId/cancel`
Reagendamento: `PATCH /public/schedules/:leadId/reschedule`

LGPD é obrigatório e o cancelamento/reagendamento usa `publicCancelToken`.
