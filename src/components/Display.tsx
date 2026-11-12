import { Link } from "@tanstack/react-router";
import { LanternShape, LanternSky, Stars } from "@/components/Sky";
import { FloatingWishes } from "@/components/FloatingWishes";
import { OFFICE_LOCATIONS, useLanterns } from "@/lib/lanterns";

export function Display() {
  const { lanterns, counts, error } = useLanterns();
  const count = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return (
    <main className="display-main bg-sky">
      <div className="display-decor" aria-hidden="true">
        <Stars count={48} />
        <LanternSky
          lanterns={lanterns}
          max={14}
          scale={0.72}
          interactive={false}
        />
      </div>
      <section
        className="display-stage"
        aria-label="Live wishes from every plant"
      >
        {lanterns.length ? (
          <FloatingWishes messages={lanterns} />
        ) : (
          <p className="display-empty text-gold">
            Your festival wishes will shine here.
          </p>
        )}
      </section>
      {error && (
        <p className="display-sync-error" role="status">
          Live updates paused: {error} Retrying…
        </p>
      )}
      <footer className="display-footer">
        <div className="display-counter">
          <div className="flex items-center gap-3">
            <LanternShape size={30} hue={12} />
            <p className="display-count text-gold text-glow tabular-nums">
              {count.toLocaleString()}
            </p>
          </div>
          <p className="display-count-label">LANTERNS ILLUMINATED</p>
          <p className="mt-2 text-xs text-gold sm:text-sm">
            {OFFICE_LOCATIONS.map((plant) => `${plant}: ${counts[plant]}`).join(
              " · ",
            )}
          </p>
        </div>
        <Link
          to="/"
          className="display-qr-section"
          aria-label="Share your light"
        >
          <img
            className="display-qr-image p-2.5 object-contain"
            src="/qr-code.png"
            alt="Scan to open the wish submission form"
          />
          <p className="display-qr-instruction">SCAN TO SHARE YOUR LIGHT</p>
          <p className="display-qr-helper">
            Scan with phone camera to send your wish
          </p>
        </Link>
      </footer>
    </main>
  );
}
