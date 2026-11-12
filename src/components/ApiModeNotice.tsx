import { useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BROWSER_DEMO_PIN,
  getApiMode,
  retryLiveApi,
  subscribeApiMode,
} from "@/lib/api-client";

export function ApiModeNotice({ className = "" }: { className?: string }) {
  const mode = useSyncExternalStore(subscribeApiMode, getApiMode, () => "live");
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (mode === "live") return null;
  const retry = async () => {
    setBusy(true);
    setError(null);
    try {
      await retryLiveApi();
      await queryClient.invalidateQueries({ queryKey: ["moderation"] });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The live API is still unreachable.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <aside
      role="status"
      className={`rounded-lg border border-amber-300/40 bg-slate-950/95 px-3 py-2 text-xs text-amber-100 ${className}`}
    >
      {mode === "browser"
        ? `Browser demo mode — API unavailable. Wishes/emails stay in this browser, are not private from its users, and are not synced. Demo admin PIN: ${BROWSER_DEMO_PIN}.`
        : "Local dev API — in-memory demo data, shared by this dev server only; resets on restart. No Cosmos DB sync."}
      {mode === "browser" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void retry()}
          className="ml-2 underline disabled:opacity-50"
        >
          {busy ? "Checking…" : "Retry live API"}
        </button>
      )}
      {error && (
        <span role="alert" className="ml-2 text-red-200">
          {error}
        </span>
      )}
    </aside>
  );
}
