import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { appTitle } from "@/lib/app-config";
import { useAdminAuth } from "@/lib/use-admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: `${appTitle} — Admin Login` }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { session, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (session) void navigate({ to: "/admin", replace: true });
  }, [navigate, session]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username, password);
      await navigate({ to: "/admin", replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start prototype session.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (session) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky px-4 py-10">
      <section className="wish-card w-full max-w-md p-6 sm:p-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Coca-Cola · Coke Chill Festival
        </p>
        <h1 className="mt-4 text-center font-display text-4xl text-foreground text-glow">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to manage festival wishes.
        </p>

      

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label htmlFor="admin-username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "SIGN IN"}
          </button>
        </form>

        <Link
          to="/display"
          className="mt-6 flex w-full items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-center text-sm font-semibold text-gold transition hover:bg-gold/10"
        >
          BACK TO LIGHT DISPLAY
        </Link>
      </section>
    </main>
  );
}
