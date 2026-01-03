"use client";

import type { Campaign } from "@prisma/client";
import { BarChart3, Eye, MousePointer, Target, TrendingUp, Users, X } from "lucide-react";

interface CampaignMetrics {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  reach?: number;
  engagement?: number;
  cost?: number;
  ctr?: number;
  conversionRate?: number;
}

export function CampaignAnalyticsModal({
  campaign,
  isOpen,
  onClose,
}: {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const metrics: CampaignMetrics = (campaign.metrics as unknown as CampaignMetrics) || {};

  // Calculate derived metrics
  const ctr = metrics.impressions && metrics.clicks
    ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2)
    : "N/A";
  const conversionRate = metrics.clicks && metrics.conversions
    ? ((metrics.conversions / metrics.clicks) * 100).toFixed(2)
    : "N/A";
  const costPerClick = metrics.cost && metrics.clicks
    ? (metrics.cost / metrics.clicks).toFixed(2)
    : "N/A";
  const costPerConversion = metrics.cost && metrics.conversions
    ? (metrics.cost / metrics.conversions).toFixed(2)
    : "N/A";
  const roi = metrics.cost && metrics.conversions
    ? (((metrics.conversions * 1000 - metrics.cost) / metrics.cost) * 100).toFixed(0)
    : "N/A";

  // Handle Decimal budget safely
  const budgetValue = campaign.budget ? Number(campaign.budget.toString()) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">{campaign.name}</h2>
            <p className="text-sm text-text-muted flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                {campaign.type}
              </span>
              <span>•</span>
              <span className={`${campaign.status === "ACTIVE" ? "text-green-500" :
                campaign.status === "PAUSED" ? "text-yellow-500" : "text-gray-500"
                }`}>
                {campaign.status}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Eye}
              label="Impressions"
              value={metrics.impressions?.toLocaleString() || "0"}
              color="blue"
            />
            <MetricCard
              icon={MousePointer}
              label="Clicks"
              value={metrics.clicks?.toLocaleString() || "0"}
              color="green"
            />
            <MetricCard
              icon={Target}
              label="Conversions"
              value={metrics.conversions?.toLocaleString() || "0"}
              color="purple"
            />
            <MetricCard
              icon={Users}
              label="Reach"
              value={metrics.reach?.toLocaleString() || "0"}
              color="orange"
            />
          </div>

          {/* Performance Metrics */}
          <div className="bg-accent/20 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">CTR</p>
                <p className="text-xl font-bold">{ctr}{ctr !== "N/A" && "%"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Conv. Rate</p>
                <p className="text-xl font-bold">{conversionRate}{conversionRate !== "N/A" && "%"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Engagement</p>
                <p className="text-xl font-bold">{metrics.engagement?.toLocaleString() || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-accent/20 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Cost Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Budget</p>
                <p className="text-xl font-bold">₹{budgetValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Spent</p>
                <p className="text-xl font-bold">₹{metrics.cost?.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Cost/Click</p>
                <p className="text-xl font-bold">{costPerClick !== "N/A" ? `₹${costPerClick}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Cost/Conv.</p>
                <p className="text-xl font-bold">{costPerConversion !== "N/A" ? `₹${costPerConversion}` : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className={`rounded-xl p-6 ${roi !== "N/A" && Number(roi) > 0
            ? "bg-green-500/10 border border-green-500/20"
            : "bg-yellow-500/10 border border-yellow-500/20"
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Return on Investment</p>
                <p className={`text-3xl font-bold ${roi !== "N/A" && Number(roi) > 0 ? "text-green-500" : "text-yellow-500"
                  }`}>
                  {roi !== "N/A" ? `${roi}%` : "Insufficient Data"}
                </p>
              </div>
              <div className="text-right text-sm text-text-muted">
                <p>Based on avg. course value of ₹1,000</p>
                <p>per enrolled student</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!metrics.impressions && !metrics.clicks && (
            <div className="text-center py-8 text-text-muted">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
              <p>No analytics data available yet.</p>
              <p className="text-sm">Data will appear once the campaign is active.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}
