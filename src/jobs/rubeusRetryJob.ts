import { LeadStatus, RubeusStatus } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../database/prisma';
import { RubeusService } from '../services/rubeusService';

const rubeusService = new RubeusService();
const MAX_RETRY_COUNT = 3;

export const startRubeusRetryJob = (): void => {
  if (!env.enableRubeusRetryJob) return;

  setInterval(async () => {
    const now = new Date();
    const maceioHour = Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/Maceio' }).format(now));
    const maceioMinute = Number(new Intl.DateTimeFormat('en-US', { minute: '2-digit', hour12: false, timeZone: 'America/Maceio' }).format(now));
    if (maceioHour !== env.rubeusRetryHour || maceioMinute !== 0) return;

    const leads = await prisma.lead.findMany({ where: { rubeusStatus: RubeusStatus.ERROR, status: { not: LeadStatus.CANCELED }, retryCount: { lt: MAX_RETRY_COUNT } } });
    for (const lead of leads) {
      try {
        await rubeusService.sendLead(lead.id);
        await prisma.lead.update({ where: { id: lead.id }, data: { rubeusStatus: RubeusStatus.RESENT, retryCount: { increment: 1 } } });
      } catch (error) {
        await prisma.integrationLog.create({ data: { leadId: lead.id, integrationName: 'RUBEUS_RETRY_JOB', status: 'ERROR', errorMessage: error instanceof Error ? error.message : 'Unknown retry error' } });
        await prisma.lead.update({ where: { id: lead.id }, data: { retryCount: { increment: 1 } } });
      }
    }
  }, 60 * 1000);
};
