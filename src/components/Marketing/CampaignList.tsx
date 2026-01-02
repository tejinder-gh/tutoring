"use client";

import { deleteCampaign, updateCampaignStatus } from "@/app/actions/marketing";
import { CampaignStatus } from "@prisma/client";
import { Edit, Pause, Play, Target, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { CampaignAnalyticsModal } from "./CampaignAnalyticsModal";
import { EditCampaignDialog } from "./EditCampaignDialog";

export function CampaignList({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  const handleStatusChange = (id: string, newStatus: CampaignStatus) => {
    startTransition(async () => {
      await updateCampaignStatus(id, newStatus);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    startTransition(async () => {
      await deleteCampaign(id);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {campaign.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${campaign.status === "ACTIVE" ? "bg-green-500/20 text-green-500" :
                    campaign.status === "PAUSED" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-slate-500/20 text-slate-500"
                    }`}>
                    {campaign.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{campaign.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-muted mb-6">
              <div className="flex items-center gap-1">
                <Target size={14} />
                <span>Budget: ₹{Number(campaign.budget || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <button
                onClick={() => setSelectedCampaign(campaign)}
                className="text-sm font-medium hover:text-primary"
              >
                View Analytics
              </button>
              <div className="flex gap-2">
                {campaign.status !== 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange(campaign.id, "ACTIVE")}
                    disabled={isPending}
                    className="p-2 hover:bg-green-500/10 text-green-500 rounded" title="Start"
                  >
                    <Play size={18} />
                  </button>
                )}
                {campaign.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange(campaign.id, "PAUSED")}
                    disabled={isPending}
                    className="p-2 hover:bg-yellow-500/10 text-yellow-500 rounded" title="Pause"
                  >
                    <Pause size={18} />
                  </button>
                )}
                <button
                  onClick={() => setEditingCampaign(campaign)}
                  disabled={isPending}
                  className="p-2 hover:bg-blue-500/10 text-blue-500 rounded" title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(campaign.id)}
                  disabled={isPending}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded" title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {initialCampaigns.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No campaigns found. Create one to get started.
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedCampaign && (
        <CampaignAnalyticsModal
          campaign={selectedCampaign}
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Edit Dialog */}
      {editingCampaign && (
        <EditCampaignDialog
          campaign={editingCampaign}
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
        />
      )}
    </>
  );
}
