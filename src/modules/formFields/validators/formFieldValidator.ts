import { z } from 'zod';

const typeEnum = z.enum([
  'TEXT',
  'EMAIL',
  'PHONE',
  'SELECT',
  'CHECKBOX',
  'RADIO',
  'TEXTAREA',
  'DATE',
  'HIDDEN',
]);

const baseFormFieldSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(1),
  type: typeEnum,
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional(),
  options: z.unknown().optional(),
  order: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const createFormFieldSchema = baseFormFieldSchema.superRefine(
  (value, ctx) => {
    if (
      ['SELECT', 'RADIO', 'CHECKBOX'].includes(value.type) &&
      !value.options
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'options is required for SELECT, RADIO and CHECKBOX',
        path: ['options'],
      });
    }
  }
);

export const updateFormFieldSchema = baseFormFieldSchema
  .partial()
  .superRefine((value, ctx) => {
    if (
      value.type &&
      ['SELECT', 'RADIO', 'CHECKBOX'].includes(value.type) &&
      !value.options
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'options is required for SELECT, RADIO and CHECKBOX',
        path: ['options'],
      });
    }
  });

export const reorderFormFieldsSchema = z.object({
  fieldOrders: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().nonnegative(),
      })
    )
    .min(1),
});