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

export async function updateCampaign(campaignId: string, data: {
  name?: string;
  type?: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        budget: data.budget,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    revalidatePath("/admin/marketing");
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return { success: false, error: "Failed to update campaign" };
  }
}

export async function deleteCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return { success: false, error: "Failed to delete campaign" };
  }
}
