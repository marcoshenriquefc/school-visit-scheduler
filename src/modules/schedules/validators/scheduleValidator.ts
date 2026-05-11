import { z } from 'zod';

export const createScheduleSchema = z.object({
  formId: z.string(),
  unitId: z.string(),
  gradeId: z.string(),
  availabilitySlotId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  lgpdAccepted: z.literal(true),
  dynamicFields: z.record(z.unknown()).optional(),
});

export const cancelScheduleSchema = z.object({ cancelToken: z.string().min(16) });
export const rescheduleSchema = z.object({ cancelToken: z.string().min(16), newAvailabilitySlotId: z.string() });
