import { prisma } from '../database/prisma';

export class RubeusService {
  async sendLead(leadId: string): Promise<void> {
    await prisma.integrationLog.create({ data: { leadId, integrationName: 'RUBEUS', status: 'SENT', requestPayload: JSON.stringify({ leadId }), responsePayload: JSON.stringify({ ok: true }) } });
  }
}
