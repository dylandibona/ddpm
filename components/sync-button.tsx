"use client";

import { useState } from "react";
import { syncGoogleDrive } from "@/app/actions/sync-drive";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await syncGoogleDrive();

      if (result.success) {
        setMessage(result.message || `Successfully synced ${result.added} PDF(s)`);
      } else {
        setError(result.error || "Failed to sync");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Syncing..." : "Sync"}
      </button>
      {message && (
        <p className="text-xs text-emerald-400 absolute mt-12">{message}</p>
      )}
      {error && (
        <p className="text-xs text-destructive absolute mt-12">{error}</p>
      )}
    </div>
  );
}

