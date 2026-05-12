import { Request, Response } from 'express';
import { UnitService } from '../services/unitService';
import { createUnitSchema, unitFilterSchema, updateUnitSchema } from '../validators/unitValidator';
import { IdParam } from '@/@types/express';

const unitService = new UnitService();

export class UnitController {
  async create(request: Request, response: Response): Promise<Response> {
    return response.status(201).json(await unitService.create(createUnitSchema.parse(request.body)));
  }
  async list(request: Request, response: Response): Promise<Response> {
    return response.json(await unitService.list(unitFilterSchema.parse(request.query)));
  }
  async getById(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await unitService.getById(request.params.id));
  }
  async update(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await unitService.update(request.params.id, updateUnitSchema.parse(request.body)));
  }
  async activate(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await unitService.activate(request.params.id));
  }
  async deactivate(request: Request<IdParam>, response: Response): Promise<Response> {
    return response.json(await unitService.deactivate(request.params.id));
  }
}
