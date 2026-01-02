"use client";

import { updateCampaign } from "@/app/actions/marketing";
import { Loader2, X } from "lucide-react";
import { useTransition } from "react";

interface Campaign {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  budget?: any;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function EditCampaignDialog({
  campaign,
  onClose
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      budget: Number(formData.get("budget")),
      startDate: formData.get("startDate") as string || undefined,
      endDate: formData.get("endDate") as string || undefined,
    };

    startTransition(async () => {
      const res = await updateCampaign(campaign.id, data);
      if (res.success) {
        onClose();
      } else {
        alert("Failed to update campaign");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md relative animate-in zoom-in-95 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Campaign</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Campaign Name
            </label>
            <input
              name="name"
              defaultValue={campaign.name}
              required
              className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                defaultValue={campaign.type}
                className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="SOCIAL">Social Media</option>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="FACEBOOK_ADS">Facebook Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Budget (₹)
              </label>
              <input
                name="budget"
                type="number"
                defaultValue={campaign.budget ? Number(campaign.budget) : undefined}
                min="0"
                className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                name="startDate"
                type="date"
                defaultValue={campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : undefined}
                className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                defaultValue={campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : undefined}
                className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={campaign.description || ""}
              rows={3}
              className="w-full p-2 rounded border border-border bg-background resize-none focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Updating..." : "Update Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
