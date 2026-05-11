import { Request, Response } from 'express';
import { FormFieldService } from '../services/formFieldService';
import { createFormFieldSchema, reorderFormFieldsSchema, updateFormFieldSchema } from '../validators/formFieldValidator';

const formFieldService = new FormFieldService();

export class FormFieldController {
  async create(request: Request, response: Response): Promise<Response> { return response.status(201).json(await formFieldService.create(request.params.formId, createFormFieldSchema.parse(request.body))); }
  async list(request: Request, response: Response): Promise<Response> { return response.json(await formFieldService.list(request.params.formId)); }
  async getById(request: Request, response: Response): Promise<Response> { return response.json(await formFieldService.getById(request.params.formId, request.params.fieldId)); }
  async update(request: Request, response: Response): Promise<Response> { return response.json(await formFieldService.update(request.params.formId, request.params.fieldId, updateFormFieldSchema.parse(request.body))); }
  async activate(request: Request, response: Response): Promise<Response> { return response.json(await formFieldService.activate(request.params.formId, request.params.fieldId)); }
  async deactivate(request: Request, response: Response): Promise<Response> { return response.json(await formFieldService.deactivate(request.params.formId, request.params.fieldId)); }
  async reorder(request: Request, response: Response): Promise<Response> { const { fieldOrders } = reorderFormFieldsSchema.parse(request.body); return response.json(await formFieldService.reorder(request.params.formId, fieldOrders)); }
}
