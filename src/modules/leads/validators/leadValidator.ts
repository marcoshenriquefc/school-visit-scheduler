import { z } from 'zod';

export const leadFilterSchema = z.object({
  formId: z.string().optional(),
  unitId: z.string().optional(),
  gradeId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'ATTENDED', 'NO_SHOW', 'RESCHEDULED', 'CANCELED']).optional(),
  rubeusStatus: z.enum(['PENDING', 'SENT', 'ERROR', 'RESENT']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'ATTENDED', 'NO_SHOW', 'RESCHEDULED', 'CANCELED']),
});
