# Admin Dashboard

## Endpoint
- `GET /admin/dashboard`

## Permissions
- ADMIN
- MARKETING
- COMMERCIAL
- OPERATIONAL

## Optional filters
- formId
- unitId
- gradeId
- startDate
- endDate

## Indicators
- totalLeads
- totalScheduled
- totalAttended
- totalNoShow
- totalCanceled
- leadsByUnit
- leadsByGrade
- schedulesByDate
- schedulesByHour
- occupancyRateBySlot
- rubeusStatusSummary
- mostRequestedHours

Canceled leads are excluded from occupancy indicators.
