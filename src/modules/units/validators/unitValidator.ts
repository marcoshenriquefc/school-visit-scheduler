import { z } from 'zod';

const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const createUnitSchema = z.object({
  name: z.string().min(2),
  identifier: z.string().min(2),
  address: z.string().min(5),
  defaultCapacityPerHour: z.number().int().gt(0),
  color: z.string().regex(hexColorRegex).optional(),
  isActive: z.boolean().optional(),
});

export const updateUnitSchema = createUnitSchema.partial();

export const unitFilterSchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  identifier: z.string().optional(),
});
