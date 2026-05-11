import { Request, Response } from 'express';
import { ScheduleService } from '../services/scheduleService';
import { cancelScheduleSchema, createScheduleSchema, rescheduleSchema } from '../validators/scheduleValidator';

const scheduleService = new ScheduleService();

export class ScheduleController {
  async create(request: Request, response: Response): Promise<Response> {
    const payload = createScheduleSchema.parse(request.body);
    const requester = request.ip || 'anonymous';
    return response.status(201).json(await scheduleService.create(payload, requester));
  }

  async cancel(request: Request, response: Response): Promise<Response> {
    const { cancelToken } = cancelScheduleSchema.parse(request.body);
    return response.json(await scheduleService.cancel(request.params.leadId, cancelToken));
  }

  async reschedule(request: Request, response: Response): Promise<Response> {
    const { cancelToken, newAvailabilitySlotId } = rescheduleSchema.parse(request.body);
    return response.json(await scheduleService.reschedule(request.params.leadId, cancelToken, newAvailabilitySlotId));
  }
}
