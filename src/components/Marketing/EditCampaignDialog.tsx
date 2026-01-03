"use client";

import { updateCampaign } from "@/app/actions/marketing";
import type { Campaign } from "@prisma/client";
import { X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function EditCampaignDialog({
  campaign,
  isOpen,
  onClose,
}: {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || "",
    type: campaign.type,
    budget: campaign.budget?.toString() || "",
    startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : "",
    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateCampaign(campaign.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        ...(formData.budget ? { budget: parseFloat(formData.budget) } : {}),
        ...(formData.startDate ? { startDate: new Date(formData.startDate) } : {}),
        ...(formData.endDate ? { endDate: new Date(formData.endDate) } : {}),
      });

      if (result.success) {
        toast.success("Campaign updated successfully");
        onClose();
      } else {
        toast.error("Failed to update campaign");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="SOCIAL">Social Media</option>
              <option value="GOOGLE_ADS">Google Ads</option>
              <option value="FACEBOOK_ADS">Facebook Ads</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="input-field w-full px-3 py-2 border rounded-md bg-background"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-accent"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
