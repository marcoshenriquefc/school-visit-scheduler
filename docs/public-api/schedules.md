# Public Schedule API

## POST /public/schedules
Creates a lead schedule.

## PATCH /public/schedules/:leadId/cancel
Cancel own schedule using public token.

Payload:
```json
{ "cancelToken": "string" }
```

Rules:
- Lead must exist.
- Token must match the lead.
- Cannot cancel ATTENDED or already CANCELED leads.
- Status changes to CANCELED.
- Slot becomes available automatically because canceled leads do not count occupancy.

## PATCH /public/schedules/:leadId/reschedule
Reschedule own schedule using public token.

Payload:
```json
{ "cancelToken": "string", "newAvailabilitySlotId": "string" }
```

Rules:
- Lead and token must be valid.
- Cannot reschedule ATTENDED or CANCELED leads.
- New slot must belong to same form and same unit (MVP).
- New slot must not be blocked/past and must have capacity.
- Lead status updates to RESCHEDULED.
- Internal log is recorded.
