import { useEffect, useState, type ReactNode } from "react";
import { Stars } from "./Sky";

type EventStatus = "checking" | "open" | "closed";

export function EventConcluded() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky px-6 py-12 text-center">
      <Stars count={50} />
      <section className="wish-card relative w-full max-w-2xl px-6 py-12 sm:px-12">
        <img
          src="/logo.png"
          alt="Coca-Cola Tazaungdaing 2026"
          className="mx-auto h-24 w-auto drop-shadow-xl sm:h-28"
        />
        <p className="mt-7 text-xs uppercase tracking-[0.3em] text-gold">
          Coca-Cola · Tazaungdaing 2026
        </p>
        <h1 className="mt-4 text-4xl font-bold text-glow sm:text-5xl">
          Event Concluded
        </h1>
        <p className="mt-3 text-xl font-semibold text-gold">
          Share the Light, Share a Coke
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-foreground/90 sm:text-lg">
          Tazaungdaing 2026 — Share the Light, Share a Coke has concluded. Thank
          you to everyone who participated!
        </p>
      </section>
    </main>
  );
}

function EventStatusLoading() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky px-6"
      role="status"
      aria-label="Checking event status"
    >
      <Stars count={25} />
      <img
        src="/logo.png"
        alt=""
        className="relative h-20 w-auto animate-pulse drop-shadow-xl"
      />
      <span className="sr-only">Checking event status</span>
    </main>
  );
}

export function EventStatusGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EventStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatus() {
      try {
        const response = await fetch("/api/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(`Status returned ${response.status}.`);
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== "object" ||
          !("eventClosed" in data) ||
          typeof data.eventClosed !== "boolean"
        ) {
          throw new Error("Status returned an invalid response.");
        }
        setStatus(data.eventClosed ? "closed" : "open");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn(
          "Unable to check event status; keeping the app open.",
          error,
        );
        setStatus("open");
      }
    }

    void loadStatus();
    return () => controller.abort();
  }, []);

  if (status === "checking") return <EventStatusLoading />;
  if (status === "closed") return <EventConcluded />;
  return children;
}
