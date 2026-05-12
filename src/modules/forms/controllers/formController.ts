import { Request, Response } from 'express';
import { FormService } from '../services/formService';
import { createFormSchema, formFilterSchema, linkGradesSchema, linkUnitsSchema, updateFormSchema } from '../validators/formValidator';
import { IdParam, SlugParam } from '@/@types/express';

const formService = new FormService();

export class FormController {
  async getPublicBySlug(request: Request<SlugParam>, response: Response): Promise<Response> {
    return response.json(await formService.getPublicBySlug(request.params.slug));
  }
  async create(request: Request, response: Response): Promise<Response> {
    return response.status(201).json(await formService.create(createFormSchema.parse(request.body)));
  }
  async list(request: Request, response: Response): Promise<Response> {
    return response.json(await formService.list(formFilterSchema.parse(request.query)));
  }
  async getById(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await formService.getById(request.params.id));
  }
  async update(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await formService.update(request.params.id, updateFormSchema.parse(request.body)));
  }
  async activate(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await formService.activate(request.params.id));
  }
  async pause(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await formService.pause(request.params.id));
  }
  async close(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await formService.close(request.params.id));
  }
  async linkUnits(request: Request<IdParam>, response: Response): Promise<Response> {
    const { unitIds } = linkUnitsSchema.parse(request.body);
    return response.json(await formService.linkUnits(request.params.id, unitIds));
  }
  async linkGrades(request: Request<IdParam>, response: Response): Promise<Response> {
    const { gradeIds } = linkGradesSchema.parse(request.body);
    return response.json(await formService.linkGrades(request.params.id, gradeIds));
  }
}
