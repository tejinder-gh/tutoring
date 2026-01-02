"use client";

import { markAllAsRead } from "@/app/actions/notification";
import { CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-foreground font-medium rounded-lg hover:bg-accent/80 disabled:opacity-50 text-sm"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckCheck size={16} />
      )}
      Mark All as Read
    </button>
  );
}
