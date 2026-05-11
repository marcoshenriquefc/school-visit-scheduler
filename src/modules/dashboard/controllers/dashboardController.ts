import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(request: Request, response: Response): Promise<Response> {
    return response.json(await dashboardService.getDashboard(request.query as Record<string, string>));
  }
}
