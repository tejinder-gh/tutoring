import { auth } from "@/auth";
import { CampaignList } from "@/components/Marketing/CampaignList";
import { CreateCampaignDialog } from "@/components/Marketing/CreateCampaignDialog";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function MarketingPage() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  await requirePermission("read", "marketing");

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          <p className="text-text-muted">Manage email, SMS, and social campaigns</p>
        </div>
        <CreateCampaignDialog />
      </div>

      <CampaignList initialCampaigns={campaigns} />
    </div>
  );
}
