"use client";

import { createCampaign } from "@/app/actions/marketing";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export function CreateCampaignDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      budget: Number(formData.get("budget")),
    };

    const res = await createCampaign(data);
    setIsPending(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert("Failed to create campaign");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={16} /> Create Campaign
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md relative animate-in zoom-in-95">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">New Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Name
                </label>
                <input
                  name="name"
                  required
                  className="w-full p-2 rounded border border-border bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    name="type"
                    className="w-full p-2 rounded border border-border bg-background"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="SOCIAL">Social Media</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Budget ($)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    min="0"
                    className="w-full p-2 rounded border border-border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-2 rounded border border-border bg-background resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
