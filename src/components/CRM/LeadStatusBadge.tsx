import { LeadStatus } from "@prisma/client";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONTACTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  QUALIFIED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  NEGOTIATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  CONVERTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${statusStyles[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      {status}
    </span>
  );
}
