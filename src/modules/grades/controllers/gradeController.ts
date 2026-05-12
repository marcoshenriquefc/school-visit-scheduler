import { Request, Response } from 'express';
import { GradeService } from '../services/gradeService';
import { createGradeSchema, gradeFilterSchema, updateGradeSchema } from '../validators/gradeValidator';
import { IdParam } from '@/@types/express';

const gradeService = new GradeService();

export class GradeController {
  async create(request: Request, response: Response): Promise<Response> {
    return response.status(201).json(await gradeService.create(createGradeSchema.parse(request.body)));
  }
  async list(request: Request, response: Response): Promise<Response> {
    return response.json(await gradeService.list(gradeFilterSchema.parse(request.query)));
  }
  async getById(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await gradeService.getById(request.params.id));
  }
  async update(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await gradeService.update(request.params.id, updateGradeSchema.parse(request.body)));
  }
  async activate(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await gradeService.activate(request.params.id));
  }
  async deactivate(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await gradeService.deactivate(request.params.id));
  }
}
