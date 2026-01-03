import { auth } from '@/auth';
import { db } from "@/lib/db";
import { LeadStatus } from '@prisma/client';
import { getLeads, logLeadActivity, updateLeadStatus } from '../lead';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    leadActivity: {
      create: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
        // Need this if we want to confirm logActivity (which uses prisma) works
        // BUT logActivity is imported from @/lib/audit.
        // If we don't mock @/lib/audit, it uses the real function which uses the mocked db.
    }
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Lead Actions', () => {
    const mockSession = { user: { id: 'user-123' } };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getLeads', () => {
        it('should return empty list if not authenticated', async () => {
            (auth as jest.Mock).mockResolvedValue(null);
            const result = await getLeads();
            expect(result).toEqual({ leads: [], total: 0 });
        });

        it('should return leads and total count', async () => {
            (auth as jest.Mock).mockResolvedValue(mockSession);
            const mockLeads = [{ id: '1', name: 'Test Lead' }];
            (db.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);
            (db.lead.count as jest.Mock).mockResolvedValue(1);

            const result = await getLeads();
            expect(result).toEqual({ leads: mockLeads, total: 1 });
            expect(db.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 20,
                skip: 0
            }));
        });
    });

    describe('logLeadActivity', () => {
         it('should create activity and revalidate path', async () => {
            (auth as jest.Mock).mockResolvedValue(mockSession);
            (db.leadActivity.create as jest.Mock).mockResolvedValue({ id: 'act-1' });

            const result = await logLeadActivity('lead-1', 'CALL', 'Called customer');

            expect(result.success).toBe(true);
            expect(db.leadActivity.create).toHaveBeenCalledWith({
                data: {
                    leadId: 'lead-1',
                    type: 'CALL',
                    notes: 'Called customer',
                    createdBy: 'user-123'
                }
            });
         });
    });

    describe('updateLeadStatus', () => {
        it('should update status, log activity, and audit log', async () => {
            (auth as jest.Mock).mockResolvedValue(mockSession);
            (db.lead.findUnique as jest.Mock).mockResolvedValue({ id: 'lead-1', status: 'NEW' });
            (db.lead.update as jest.Mock).mockResolvedValue({ id: 'lead-1', status: 'CONTACTED' });

            const result = await updateLeadStatus('lead-1', LeadStatus.CONTACTED);

            expect(result.success).toBe(true);
            // 1. Update Lead
            expect(db.lead.update).toHaveBeenCalledWith({
                where: { id: 'lead-1' },
                data: { status: 'CONTACTED' }
            });
            // 2. Create Semantic Activity
            expect(db.leadActivity.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    type: 'STATUS_CHANGE',
                    leadId: 'lead-1'
                })
            }));
            // 3. Create Audit Log (via logActivity -> db.auditLog.create)
            expect(db.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    action: 'UPDATE',
                    entity: 'LEAD',
                    userId: 'user-123'
                })
            }));
        });
    });
});
