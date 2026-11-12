import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  apiRequest,
  lanternService,
  OFFICE_LOCATIONS,
  validateWish,
  type Lantern,
  type LanternStatus,
  type LanternLocation,
} from "@/lib/lanterns";
import { downloadLanternCsv } from "@/lib/lantern-export";
import { Switch } from "@/components/ui/switch";
import { ApiModeNotice } from "@/components/ApiModeNotice";
import { getApiMode } from "@/lib/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Share the Light — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

async function loadAdmin(
  pin: string,
): Promise<{ wishes: Lantern[]; autoApprove: boolean }> {
  const source = getApiMode();
  const [wishes, settings] = await Promise.all([
    lanternService.getAll(pin),
    apiRequest<{ autoApprove: boolean }>("/settings"),
  ]);
  if (source !== "browser" && getApiMode() === "browser") return loadAdmin(pin);
  return { wishes, autoApprove: settings.autoApprove };
}

function Admin() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [input, setInput] = useState("");
  const [session, setSession] = useState<{
    pin: string;
    initial: Awaited<ReturnType<typeof loadAdmin>>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (pathname === "/admin/login") return <Outlet />;
  if (session)
    return (
      <Dashboard
        pin={session.pin}
        initial={session.initial}
        onLogout={() => {
          setSession(null);
          setInput("");
        }}
      />
    );

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setSession({ pin: input, initial: await loadAdmin(input) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-sky px-4">
      <form
        className="wish-card w-full max-w-sm space-y-5 p-7"
        onSubmit={(event) => void login(event)}
      >
        <h1 className="text-2xl font-bold text-gold">Festival Moderation</h1>
        <ApiModeNotice />
        <p className="text-sm text-muted-foreground">
          Enter your admin PIN to manage the live festival sky.
        </p>
        <label className="block">
          Admin PIN
          <input
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            className="mt-2 w-full rounded-xl border bg-background/80 px-4 py-3"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-primary px-4 py-3 font-bold disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Unlock dashboard"}
        </button>
        <Link to="/display" className="block text-center text-sm text-gold">
          Back to festival sky
        </Link>
      </form>
    </main>
  );
}

function Dashboard({
  pin,
  initial,
  onLogout,
}: {
  pin: string;
  initial: Awaited<ReturnType<typeof loadAdmin>>;
  onLogout: () => void;
}) {
  const query = useQuery({
    queryKey: ["moderation", pin],
    queryFn: () => loadAdmin(pin),
    initialData: initial,
    refetchInterval: 5000,
    retry: false,
    gcTime: 0,
  });
  const all = query.data.wishes;
  const [status, setStatus] = useState<LanternStatus>("approved");
  const [plant, setPlant] = useState<LanternLocation | "All">("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Lantern | null>(null);
  const [message, setMessage] = useState("");
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      const result = await query.refetch();
      if (result.error) throw result.error;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Action failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  const rows = all
    .filter((wish) => wish.status === status)
    .filter((wish) => plant === "All" || wish.officeLocation === plant)
    .filter((wish) =>
      `${wish.name} ${wish.email ?? ""} ${wish.message}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateWish(message);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (editing)
      await run(async () => {
        await lanternService.update(editing, { message }, pin);
        setEditing(null);
      });
  };
  return (
    <main className="min-h-screen bg-sky px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <ApiModeNotice className="mb-4" />
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">
              Share the Light
            </p>
            <h1 className="text-3xl font-bold">Live Moderation</h1>
          </div>
          <button onClick={onLogout} className="admin-button">
            Lock dashboard
          </button>
        </header>
        <section className="glass mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl p-5">
          <label
            className="flex items-center gap-3 font-bold text-gold"
            htmlFor="auto-approve"
          >
            <Switch
              id="auto-approve"
              checked={query.data.autoApprove}
              disabled={busy}
              onCheckedChange={(autoApprove) =>
                void run(async () => {
                  await apiRequest("/settings", "PATCH", { autoApprove }, pin);
                })
              }
            />
            Auto-Approve New Wishes
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  downloadLanternCsv(await lanternService.getAll(pin));
                })
              }
              className="admin-button"
            >
              Export CSV
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={busy}
                  className="admin-button border-red-400/60 bg-red-950/60 text-red-200"
                >
                  Reset All / Clear All
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Clear every festival wish?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes all approved, pending and rejected
                    wishes across every plant. Counters will reset on the next
                    live refresh. Auto-Approve settings are preserved. Export a
                    CSV first if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive"
                    onClick={() => void run(() => lanternService.clear(pin))}
                  >
                    Yes, clear all wishes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
        <p className="mt-3 text-xs text-muted-foreground">
          Live updates every 5 seconds · Auto-Approve affects new wishes only.
        </p>
        {(error || query.error) && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-400/40 bg-red-950/80 p-3 text-red-200"
          >
            {error || query.error?.message}
          </p>
        )}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {(["All", ...OFFICE_LOCATIONS] as const).map((location) => (
            <button
              key={location}
              onClick={() => setPlant(location)}
              aria-pressed={plant === location}
              className={`rounded-xl border p-3 text-center ${plant === location ? "border-gold bg-primary/70" : "glass"}`}
            >
              <span className="block text-xs text-gold">{location}</span>
              <span className="text-2xl font-bold">
                {location === "All"
                  ? all.length
                  : all.filter((wish) => wish.officeLocation === location)
                      .length}
              </span>
            </button>
          ))}
        </div>
        <div
          className="mt-7 flex flex-wrap gap-2"
          role="group"
          aria-label="Wish status"
        >
          {(["approved", "pending", "rejected"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              aria-pressed={status === value}
              className={`admin-button ${status === value ? "border-gold bg-primary" : "glass"}`}
            >
              {value === "approved"
                ? "Approved (Live on Display)"
                : value === "pending"
                  ? "Pending"
                  : "Rejected"}
              {" · "}
              {all.filter((wish) => wish.status === value).length}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm">
          Search by employee name, email or message
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-2 w-full rounded-xl border bg-background/80 px-4 py-3"
            placeholder="Find a wish…"
          />
        </label>
        <div className="mt-4 space-y-3">
          {!rows.length && (
            <p className="glass rounded-xl p-8 text-center text-muted-foreground">
              No wishes match these filters.
            </p>
          )}
          {rows.map((wish) => (
            <article
              key={wish.id}
              className="glass flex flex-wrap items-center gap-4 rounded-xl p-5"
            >
              <div className="min-w-0 flex-1 basis-72">
                <p className="whitespace-pre-wrap break-words">
                  {wish.message}
                </p>
                <p className="mt-2 break-words text-xs text-gold">
                  {wish.name} · {wish.email} · {wish.officeLocation}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(wish.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {wish.status !== "approved" && (
                  <button
                    className="admin-button text-green-200"
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        lanternService.update(
                          wish,
                          { status: "approved" },
                          pin,
                        ),
                      )
                    }
                  >
                    Approve
                  </button>
                )}
                {wish.status !== "rejected" && (
                  <button
                    className="admin-button text-red-200"
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        lanternService.update(
                          wish,
                          { status: "rejected" },
                          pin,
                        ),
                      )
                    }
                  >
                    Hide (Reject)
                  </button>
                )}
                <button
                  className="admin-button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(wish);
                    setMessage(wish.message);
                    setError(null);
                  }}
                >
                  Edit Message
                </button>
                <button
                  className="admin-button text-red-200"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Permanently delete the wish by ${wish.name}?`,
                      )
                    )
                      void run(() => lanternService.delete(wish, pin));
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
        <Dialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open && !busy) setEditing(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Use at least 3 non-whitespace characters. There is no character
                limit.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(event) => void saveEdit(event)}
              className="space-y-4"
            >
              <label className="block">
                Wish message
                <textarea
                  required
                  minLength={3}
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-2 w-full rounded-xl border bg-background p-3"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                {message.length.toLocaleString()} characters
              </p>
              {error && (
                <p role="alert" className="text-red-300">
                  {error}
                </p>
              )}
              <button disabled={busy} className="admin-button bg-primary">
                Save message
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
