import { z } from 'zod';

export const createGradeSchema = z.object({
  name: z.string().min(2),
  identifier: z.string().min(2),
  isActive: z.boolean().optional(),
});

export const updateGradeSchema = createGradeSchema.partial();

export const gradeFilterSchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  identifier: z.string().optional(),
});
