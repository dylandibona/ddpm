"use client";

import { RefreshCw } from "lucide-react";
import { syncGoogleDrive } from "@/app/actions/sync-drive";
import { useTransition } from "react";

export function SyncStatus() {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      await syncGoogleDrive();
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Sync Status
        </p>
        <p className="text-sm text-muted-foreground">
          Last sync: Recent
        </p>
      </div>
      <form action={handleSync} className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Syncing..." : "Sync Now"}
        </button>
      </form>
    </div>
  );
}
