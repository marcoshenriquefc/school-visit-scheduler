# Rubeus Retry Job

Automatic retry job runs daily at configured hour in `America/Maceio` timezone.

## Env
- `ENABLE_RUBEUS_RETRY_JOB=true|false`
- `RUBEUS_RETRY_HOUR=18`

## Rules
- Fetch leads with `rubeusStatus=ERROR`.
- Skip canceled leads.
- Retry each lead independently.
- Register IntegrationLog for each retry attempt.
- Increment `retryCount` and stop retrying after max attempts (3).
- Lead failures do not stop the entire job.
