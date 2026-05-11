import { Request, Response } from 'express';
import { PublicFormService } from '../services/publicFormService';

const publicFormService = new PublicFormService();

export class PublicFormController {
  async getForm(request: Request, response: Response): Promise<Response> { return response.json(await publicFormService.getForm(request.params.slug)); }
  async getUnits(request: Request, response: Response): Promise<Response> { return response.json(await publicFormService.getUnits(request.params.slug)); }
  async getGrades(request: Request, response: Response): Promise<Response> { return response.json(await publicFormService.getGrades(request.params.slug)); }
  async getFields(request: Request, response: Response): Promise<Response> { return response.json(await publicFormService.getFields(request.params.slug)); }
}
