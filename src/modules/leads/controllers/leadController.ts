import { Request, Response } from 'express';
import { LeadService } from '../services/leadService';
import { leadFilterSchema, updateLeadStatusSchema } from '../validators/leadValidator';
import { ParamsRequest } from '@/@types/express';

const leadService = new LeadService();

export class LeadController {
  async list(request: Request, response: Response): Promise<Response> {
    return response.json(await leadService.list(leadFilterSchema.parse(request.query)));
  }
  async getById(request: Request<ParamsRequest<"id">>, response: Response): Promise<Response> {
    return response.json(await leadService.getById(request.params.id));
  }
  async updateStatus(request: Request<ParamsRequest<"id">>, response: Response): Promise<Response> {
    const { status } = updateLeadStatusSchema.parse(request.body);
    return response.json(await leadService.updateStatus(request.params.id, status));
  }
}
