import { z } from 'zod';

const formStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'CLOSED',
]);

const baseFormSchema = z.object({
  campaignIdentifier: z.string().min(1),
  title: z.string().min(2),
  slug: z.string().min(2),
  finalMessage: z.string().optional(),
  lgpdText: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: formStatusEnum.optional(),
});

export const createFormSchema = baseFormSchema.refine(
  (v) => v.endDate >= v.startDate,
  {
    message: 'endDate cannot be before startDate',
    path: ['endDate'],
  }
);

export const updateFormSchema = baseFormSchema
  .partial()
  .refine(
    (v) => {
      if (v.startDate && v.endDate) {
        return v.endDate >= v.startDate;
      }

      return true;
    },
    {
      message: 'endDate cannot be before startDate',
      path: ['endDate'],
    }
  );

export const formFilterSchema = z.object({
  status: formStatusEnum.optional(),
  campaignIdentifier: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const linkUnitsSchema = z.object({
  unitIds: z.array(z.string()).min(1),
});

export const linkGradesSchema = z.object({
  gradeIds: z.array(z.string()).min(1),
});