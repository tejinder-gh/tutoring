/**
 * @jest-environment node
 */
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createLead, updateLeadStatus } from '../lead';
import { createCampaign, updateCampaignStatus } from '../marketing';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    leadActivity: {
      create: jest.fn(),
    },
    campaign: {
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
        create: jest.fn(), // If logActivity uses prisma directly or we mock logActivity
    }
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock logActivity
jest.mock('@/lib/audit', () => ({
    AuditAction: { UPDATE: 'UPDATE', CREATE: 'CREATE' },
    AuditResource: { LEAD: 'LEAD' },
    logActivity: jest.fn(),
}));


describe('CRM & Marketing Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-1' } });
  });

  describe('Lead Management', () => {
    test('createLead should create a new lead and log activity', async () => {
      const leadData = { name: 'John Doe', phone: '1234567890', email: 'john@example.com' };
      (prisma.lead.create as jest.Mock).mockResolvedValue({ id: 'lead-1', ...leadData, status: 'NEW' });

      const result = await createLead(leadData);

      expect(result.success).toBe(true);
      expect(prisma.lead.create).toHaveBeenCalled();
      expect(prisma.leadActivity.create).toHaveBeenCalled(); // Log creation
    });

    test('updateLeadStatus should update status and log audit', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({ id: 'lead-1', status: 'NEW' });
      (prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead-1', status: 'CONTACTED' });

      const result = await updateLeadStatus('lead-1', 'CONTACTED');

      expect(result.success).toBe(true);
      expect(prisma.lead.update).toHaveBeenCalledWith(expect.objectContaining({
          where: { id: 'lead-1' },
          data: { status: 'CONTACTED' }
      }));
    });
  });

  describe('Marketing Campaigns', () => {
    test('createCampaign should create draft campaign', async () => {
      const campaignData = { name: 'Summer Sale', type: 'EMAIL', budget: 1000 };
      (prisma.campaign.create as jest.Mock).mockResolvedValue({ id: 'camp-1', ...campaignData, status: 'DRAFT' });

      const result = await createCampaign(campaignData);

      expect(result.success).toBe(true);
      expect(prisma.campaign.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ status: 'DRAFT' })
      }));
    });

    test('updateCampaignStatus should change status', async () => {
        (prisma.campaign.update as jest.Mock).mockResolvedValue({ id: 'camp-1', status: 'ACTIVE' });

        const result = await updateCampaignStatus('camp-1', 'ACTIVE');

        expect(result.success).toBe(true);
        expect(prisma.campaign.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'camp-1' },
            data: { status: 'ACTIVE' }
        }));
    });
  });
});
