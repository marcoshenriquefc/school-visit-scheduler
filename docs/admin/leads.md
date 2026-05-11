# Admin Leads API

## Endpoints
- `GET /admin/leads`
- `GET /admin/leads/:id`
- `PATCH /admin/leads/:id/status`

## Filters
- formId
- unitId
- gradeId
- status
- rubeusStatus
- startDate
- endDate
- search
- page
- limit

## Notes
- Pagination is required.
- Default ordering: newest leads first.
- Allowed status updates: SCHEDULED, ATTENDED, NO_SHOW, RESCHEDULED, CANCELED.
- CANCELED releases slot capacity logically because only non-canceled leads count for slot occupancy.
