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

export async function updateCampaign(
  campaignId: string,
  data: {
    name?: string;
    description?: string;
    type?: string;
    budget?: number;
    startDate?: Date;
    endDate?: Date;
    targetAudience?: any;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...data,
        updatedAt: new Date(),
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

export async function getCampaignById(campaignId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  return campaign;
}

export async function updateCampaignMetrics(
  campaignId: string,
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    cost?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const currentMetrics = (campaign?.metrics as any) || {};
    const updatedMetrics = { ...currentMetrics, ...metrics };

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { metrics: updatedMetrics },
    });

    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (error) {
    console.error("Failed to update metrics:", error);
    return { success: false, error: "Failed to update metrics" };
  }
}
