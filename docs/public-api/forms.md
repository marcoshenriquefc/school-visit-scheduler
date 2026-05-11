# Public Forms API

Base path: `/public`

## GET /public/forms/:slug
Returns minimal public form data when ACTIVE.
- If PAUSED: returns status PAUSED with message.
- If CLOSED: returns status CLOSED with message.
- If DRAFT or missing: 404.

## GET /public/forms/:slug/units
Returns only active units linked to the form.

## GET /public/forms/:slug/grades
Returns only active grades linked to the form.

## GET /public/forms/:slug/fields
Returns only active dynamic fields ordered by `order`.

## GET /public/forms/:slug/availability/dates?unitId=
Returns available dates for the selected unit.

## GET /public/forms/:slug/availability/times?unitId=&date=&includeFull=true|false
Returns available times.
- FULL slots are hidden unless `includeFull=true`.
- Blocked slots never appear.

## Future API KEY Support
Public routes are designed to support API key auth in future iterations.
