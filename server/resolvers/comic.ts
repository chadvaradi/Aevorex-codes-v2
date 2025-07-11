import { prisma } from '../lib/prisma';

async function increaseFreeEpisodeCampaigns(parent, args, context) {
    const now = new Date();
    const { comicId, campaignId } = args;
    const where: any = {
      comicId,
      endAt: { gte: now },
      startAt: { lte: now },
    };
    if (campaignId) {
      where.campaignId = campaignId;
    }
    return prisma.campaignFreeEpisode.findMany({ where });
  }