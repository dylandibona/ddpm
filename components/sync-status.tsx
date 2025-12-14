"use client";

import { RefreshCw } from "lucide-react";
import { syncGoogleDrive } from "@/app/actions/sync-drive";
import { useTransition, useState } from "react";

export function SyncStatus() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSync = () => {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      try {
        await syncGoogleDrive();
        setMessage("Sync completed successfully!");
        setIsError(false);

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);

        // Reload the page to show new data
        window.location.reload();
      } catch (error) {
        console.error("Sync error:", error);
        setMessage(error instanceof Error ? error.message : "Sync failed");
        setIsError(true);
      }
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
      <div className="mt-4">
        <form action={handleSync}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Syncing..." : "Sync Now"}
          </button>
        </form>

        {message && (
          <p className={`mt-2 text-xs ${isError ? "text-rose-400" : "text-emerald-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
