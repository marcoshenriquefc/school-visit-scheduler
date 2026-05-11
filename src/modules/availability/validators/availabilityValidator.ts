import { z } from 'zod';

export const generateAvailabilitySchema = z.object({
  unitId: z.string(),
  startHour: z.string().default('08:00'),
  endHour: z.string().default('17:00'),
  slotDurationMinutes: z.number().int().positive().default(60),
  weekdays: z.array(z.number().int().min(1).max(5)).default([1, 2, 3, 4, 5]),
  holidayDates: z.array(z.string()).optional(),
});

export const createAvailabilitySchema = z.object({
  unitId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().int().positive().optional(),
  isBlocked: z.boolean().optional(),
  blockReason: z.string().optional(),
});

export const updateAvailabilitySchema = createAvailabilitySchema.partial();

export const blockSlotSchema = z.object({ blockReason: z.string().min(3) });

export const availabilityFilterSchema = z.object({
  unitId: z.string().optional(),
  date: z.string().optional(),
  isBlocked: z.enum(['true', 'false']).optional(),
});

export const publicTimesQuerySchema = z.object({ unitId: z.string(), date: z.string(), includeFull: z.enum(['true', 'false']).optional() });
export const publicDatesQuerySchema = z.object({ unitId: z.string() });
