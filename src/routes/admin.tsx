import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, Flame, CheckCircle2, XCircle, Clock, Download, LogOut } from "lucide-react";
import { lanternService, useLanterns, type LanternStatus } from "@/lib/lanterns";
import { downloadApprovedLanterns } from "@/lib/lantern-export";
import { appSubtitle, appTitle } from "@/lib/app-config";
import { useAdminAuth } from "@/lib/use-admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `${appTitle} — Admin` },
      { name: "description", content: appSubtitle },
      { property: "og:title", content: `${appTitle} — Admin` },
      { property: "og:description", content: appSubtitle },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type StatusFilter = "all" | LanternStatus;
type OfficeFilter = "all" | "HTY" | "HmweBe" | "CDC" | "Other Regions";

function Admin() {
  const { session, loading: authLoading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isLoginRoute = pathname === "/admin/login";
  const { lanterns: all, error: loadError } = useLanterns();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [officeFilter, setOfficeFilter] = useState<OfficeFilter>("all");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session && pathname === "/admin") {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [authLoading, navigate, pathname, session]);

  const stats = useMemo(() => ({
    total: all.length,
    approved: all.filter((l) => l.status === "approved").length,
    rejected: all.filter((l) => l.status === "rejected").length,
    pending: all.filter((l) => l.status === "pending").length,
  }), [all]);
  const rows = [...all]
    .reverse()
    .filter((lantern) => filter === "all" || lantern.status === filter)
    .filter((lantern) => officeFilter === "all" || lantern.officeLocation === officeFilter)
    .slice(0, 200);

  const cards = [
    { label: "Total submissions", v: stats.total, icon: Flame },
    { label: "Approved", v: stats.approved, icon: CheckCircle2 },
    { label: "Rejected", v: stats.rejected, icon: XCircle },
    { label: "Pending", v: stats.pending, icon: Clock },
  ];

  if (isLoginRoute) return <Outlet />;
  if (authLoading || !session) return null;

  const changeStatus = async (id: string, status: LanternStatus) => {
    setActionError(null);
    try {
      await lanternService.setStatus(id, status);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Message status could not be updated.");
    }
  };

  const exportMessages = async () => {
    setActionError(null);
    try {
      downloadApprovedLanterns(await lanternService.exportAll());
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Submissions could not be exported.");
    }
  };

  const resetSamples = async () => {
    if (!confirm("Reset all messages to the sample collection?")) return;
    setActionError(null);
    try {
      await lanternService.resetDemoData();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Sample messages could not be restored.");
    }
  };

  const logout = async () => {
    setActionError(null);
    try {
      await signOut();
      await navigate({ to: "/admin/login", replace: true });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Logout failed.");
    }
  };

  return (
    <main className="min-h-screen bg-sky px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{appTitle} · Admin</h1>
            <p className="text-sm text-muted-foreground">{appSubtitle}. Only approved lanterns appear on the festival display.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void exportMessages()}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" /> Export Excel
            </button>
            <button onClick={() => void resetSamples()}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" /> Reset sample data
            </button>
            <button onClick={logout}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gold">Local prototype only. Replace this development API with company-managed authentication before deployment.</p>
        {actionError && <p className="mt-3 text-sm text-destructive" role="alert">{actionError}</p>}
        {loadError && <p className="mt-3 text-sm text-destructive" role="alert">{loadError}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="glass rounded-2xl p-4">
              <c.icon className="h-5 w-5 text-gold" />
              <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{c.v.toLocaleString()}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-2">
          {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
        <label className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          Office location
          <select
            value={officeFilter}
            onChange={(event) => setOfficeFilter(event.target.value as OfficeFilter)}
            className="rounded-full border border-border bg-background/70 px-4 py-2 text-foreground"
          >
            <option value="all">All offices</option>
            <option value="HTY">HTY</option>
            <option value="HmweBe">HmweBe</option>
            <option value="CDC">CDC</option>
            <option value="Other Regions">Other Regions</option>
          </select>
        </label>

        <div className="glass mt-4 divide-y divide-border overflow-hidden rounded-2xl">
          {rows.length === 0 && <p className="p-6 text-center text-muted-foreground">No submissions here.</p>}
          {rows.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-foreground">"{l.message}"</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {l.name || "Anonymous"} · {l.officeLocation} · {new Date(l.createdAt).toLocaleString()} ·{" "}
                  <span className={l.status === "approved" ? "text-success" : l.status === "rejected" ? "text-destructive" : "text-gold"}>{l.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void changeStatus(l.id, "approved")} disabled={l.status === "approved"} aria-label="Approve"
                  className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-sm text-success hover:bg-success/25 disabled:opacity-30">
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button onClick={() => void changeStatus(l.id, "rejected")} disabled={l.status === "rejected"} aria-label="Reject"
                  className="flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/25 disabled:opacity-30">
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
