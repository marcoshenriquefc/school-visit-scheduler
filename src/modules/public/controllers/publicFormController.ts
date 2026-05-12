import { Request, Response } from 'express';
import { PublicFormService } from '../services/publicFormService';
import { ParamsRequest } from '@/@types/express';

const publicFormService = new PublicFormService();

export class PublicFormController {
  async getForm(request: Request<ParamsRequest<"slug">>, response: Response): Promise<Response> {
    return response.json(await publicFormService.getForm(request.params.slug));
  }
  async getUnits(request: Request<ParamsRequest<"slug">>, response: Response): Promise<Response> {
    return response.json(await publicFormService.getUnits(request.params.slug));
  }
  async getGrades(request: Request<ParamsRequest<"slug">>, response: Response): Promise<Response> {
    return response.json(await publicFormService.getGrades(request.params.slug));
  }
  async getFields(request: Request<ParamsRequest<"slug">>, response: Response): Promise<Response> {
    return response.json(await publicFormService.getFields(request.params.slug));
  }
}
