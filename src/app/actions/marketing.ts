"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCampaign(data: {
  name: string;
  type: string;
  description?: string;
  budget?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        budget: data.budget,
        status: "DRAFT",
      },
    });

    revalidatePath("/admin/marketing");
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return { success: false, error: "Failed to create campaign" };
  }
}

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    });

    revalidatePath("/admin/marketing");
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Failed to update campaign status:", error);
    return { success: false, error: "Failed to update campaign status" };
  }
}
