import { Request, Response } from 'express';
import { AvailabilityService } from '../services/availabilityService';
import { availabilityFilterSchema, blockSlotSchema, createAvailabilitySchema, generateAvailabilitySchema, publicDatesQuerySchema, publicTimesQuerySchema, updateAvailabilitySchema } from '../validators/availabilityValidator';
import { ParamsRequest } from '@/@types/express';

const availabilityService = new AvailabilityService();

export class AvailabilityController {
  async generate(request: Request<ParamsRequest<'formId'>>, response: Response): Promise<Response> {
    return response.status(201).json(await availabilityService.generate(request.params.formId, generateAvailabilitySchema.parse(request.body)));
  }
  async create(request: Request<ParamsRequest<'formId'>>, response: Response): Promise<Response> {
    return response.status(201).json(await availabilityService.createManual(request.params.formId, createAvailabilitySchema.parse(request.body)));
  }
  async list(request: Request<ParamsRequest<'formId'>>, response: Response): Promise<Response> {
    return response.json(await availabilityService.list(request.params.formId, availabilityFilterSchema.parse(request.query)));
  }
  async block(request: Request<ParamsRequest<'slotId'>>, response: Response): Promise<Response> {
    const { blockReason } = blockSlotSchema.parse(request.body);
    return response.json(await availabilityService.block(request.params.slotId, blockReason));
  }
  async unblock(request: Request<ParamsRequest<'slotId'>>, response: Response): Promise<Response> {
    return response.json(await availabilityService.unblock(request.params.slotId));
  }
  async update(request: Request<ParamsRequest<'slotId'>>, response: Response): Promise<Response> {
    return response.json(await availabilityService.update(request.params.slotId, updateAvailabilitySchema.parse(request.body)));
  }
  async delete(request: Request<ParamsRequest<'slotId'>>, response: Response): Promise<Response> {
    return response.json(await availabilityService.delete(request.params.slotId));
  }
  async publicDates(request: Request<ParamsRequest<'slug'>>, response: Response): Promise<Response> {
    const q = publicDatesQuerySchema.parse(request.query);
    return response.json(await availabilityService.publicDates(request.params.slug, q.unitId));
  }
  async publicTimes(request: Request<ParamsRequest<'slug'>>, response: Response): Promise<Response> {
    const q = publicTimesQuerySchema.parse(request.query);
    return response.json(await availabilityService.publicTimes(request.params.slug, q.unitId, q.date, q.includeFull));
  }
}
