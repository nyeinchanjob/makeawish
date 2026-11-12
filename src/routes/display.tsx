import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cog } from "lucide-react";
import { LanternShape, LanternSky, Stars } from "@/components/Sky";
import { FloatingWishes } from "@/components/FloatingWishes";
import { useLanterns } from "@/lib/lanterns";
import { appSubtitle, appTitle } from "@/lib/app-config";

export const Route = createFileRoute("/display")({
  head: () => ({
    meta: [
      { title: `${appTitle} — Festival Display` },
      { name: "description", content: appSubtitle },
      { property: "og:title", content: appTitle },
      { property: "og:description", content: appSubtitle },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Display,
});

const MILESTONES = [1000, 3000, 5000];

function Display() {
  const { lanterns: all, error: loadError } = useLanterns();
  const approved = useMemo(
    () =>
      all
        .filter((lantern) => lantern.status === "approved")
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [all],
  );
  const count = approved.length;
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [qrAvailable, setQrAvailable] = useState(false);
  const [tcccFontAvailable, setTcccFontAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/assets/qr.png", { method: "HEAD" })
      .then((response) => {
        if (active) setQrAvailable(response.ok);
      })
      .catch(() => {
        if (active) setQrAvailable(false);
      });
    void Promise.all([
      fetch("/assets/fonts/TCCC-UnityText-Regular.woff2", { method: "HEAD" }),
      fetch("/assets/fonts/TCCC-UnityText-Bold.woff2", { method: "HEAD" }),
    ])
      .then((responses) => {
        if (active) setTcccFontAvailable(responses.every((response) => response.ok));
      })
      .catch(() => {
        if (active) setTcccFontAvailable(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current !== null) {
      const hit = MILESTONES.find((m) => prev.current! < m && count >= m);
      if (hit) {
        setCelebrate(hit);
        setTimeout(() => setCelebrate(null), 8000);
      }
    }
    prev.current = count;
  }, [count]);

  return (
    <main className={`display-main bg-sky${tcccFontAvailable ? " has-tccc-unity-font" : ""}`}>
      <div className="display-decor" aria-hidden="true">
        <Stars count={48} />
        <LanternSky lanterns={approved} max={14} scale={0.72} interactive={false} />
      </div>

      <Link
        to="/admin"
        aria-label="Open festival display settings"
        title="Display settings"
        className="display-settings rounded-full border border-gold/40 bg-black/30 p-3 text-gold transition hover:bg-gold/15 focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <Cog className="h-6 w-6" aria-hidden="true" />
      </Link>

      <header className="display-header">
        <p className="display-title font-display text-foreground text-glow">{appTitle}</p>
        <p className="display-subtitle font-serif text-gold">{appSubtitle}</p>
        <p className="display-tagline font-serif text-foreground/80">EVERY LIGHT TELLS A STORY</p>
      </header>

      <section className="display-stage" aria-live="polite">
        {loadError && (
          <p className="display-empty font-serif text-destructive" role="alert">
            Festival wishes could not be loaded. Please contact the event team.
          </p>
        )}
        {approved.length ? (
          <FloatingWishes messages={approved} />
        ) : !loadError ? (
          <p className="display-empty font-serif text-gold">Your festival wishes will shine here.</p>
        ) : null}
      </section>

      <footer className="display-footer">
        <div className="display-counter">
          <p className="display-count font-display font-bold text-gold text-glow tabular-nums">{count.toLocaleString()}</p>
          <LanternShape className="display-counter-lantern" size={30} hue={12} />
          <p className="display-count-label text-foreground/80">lanterns illuminated</p>
        </div>

        <div className="display-qr-section">
          {qrAvailable ? (
            <Link
  to="/"
  aria-label="Go to the festival wish submission page"
  title="Share your light"
  className="cursor-pointer"
>
  <img
    className="display-qr-image"
    src="/assets/qr.png"
    alt="Click to share your light"
    onError={() => setQrAvailable(false)}
  />
</Link>
          ) : (
             <Link
  to="/"
  aria-label="Go to the festival wish submission page"
  title="Share your light"
  className="cursor-pointer"
>
            <div className="display-qr-placeholder" role="img" aria-label="QR code asset placeholder">
              QR CODE ASSET<br />COMING SOON
              <span>Place the event QR image at public/assets/qr.png</span>
            </div>
            </Link>
          )}
          <p className="display-qr-instruction">SCAN TO SHARE YOUR LIGHT</p>
        </div>
      </footer>

      {celebrate && <Celebration value={celebrate} />}
    </main>
  );
}

function Celebration({ value }: { value: number }) {
  const sparks = useMemo(() => Array.from({ length: 6 }).flatMap((_, b) =>
    Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = 120 + Math.random() * 120;
      return { k: `${b}-${i}`, x: 15 + b * 14, y: 20 + (b % 2) * 25, dx: Math.cos(a) * r, dy: Math.sin(a) * r, d: b * 0.5 };
    })), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-30 animate-in fade-in">
      {sparks.map((s) => (
        <span key={s.k} className="firework" style={{ left: `${s.x}%`, top: `${s.y}%`, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, animationDelay: `${s.d}s` }} />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-[10vw] font-bold text-gold text-glow">{value.toLocaleString()}</p>
        <p className="font-serif text-[2.5vw] tracking-widest text-foreground">LANTERNS LIGHT UP THASAUNG TAING!</p>
      </div>
    </div>
  );
}
