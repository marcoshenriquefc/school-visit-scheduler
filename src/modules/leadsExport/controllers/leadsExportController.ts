import { Request, Response } from 'express';
import { LeadsExportService } from '../services/leadsExportService';

const leadsExportService = new LeadsExportService();

export class LeadsExportController {
  async exportCsv(request: Request, response: Response): Promise<Response> {
    const csv = await leadsExportService.toCsv(request.query as Record<string, string>);
    response.header('Content-Type', 'text/csv');
    response.header('Content-Disposition', 'attachment; filename="leads.csv"');
    return response.send(csv);
  }

  async exportPdf(request: Request, response: Response): Promise<Response> {
    const pdf = await leadsExportService.toPdfLike(request.query as Record<string, string>);
    response.header('Content-Type', 'application/pdf');
    response.header('Content-Disposition', 'attachment; filename="leads.pdf"');
    return response.send(pdf);
  }
}
