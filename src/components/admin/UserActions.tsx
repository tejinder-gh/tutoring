"use client";

import { usePermission } from "@/hooks/use-permission";
import { Trash2 } from "lucide-react";

export function UserActions({ userId }: { userId: string }) {
  const { can } = usePermission();

  if (!can("delete", "user")) return null;

  return (
    <button
      className="text-destructive hover:text-destructive/80 p-2 rounded-full hover:bg-destructive/10 transition-colors"
      title="Delete User"
      onClick={() => alert(`Delete user ${userId}`)} // Placeholder action
    >
      <Trash2 size={16} />
    </button>
  );
}
