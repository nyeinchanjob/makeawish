import { useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Lantern } from "@/lib/lanterns";

function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function LanternShape({ size = 28, hue = 25, className = "" }: { size?: number; hue?: number; className?: string }) {
  const gradientId = `lantern-${useId().replace(/:/g, "")}`;
  return (
    <span className={`lantern-wrap ${className}`} style={{ width: size, height: size * 1.5 }} aria-hidden="true">
      <svg
        className="lantern"
        viewBox="0 0 60 90"
        width={size}
        height={size * 1.5}
        role="presentation"
        style={{ filter: `hue-rotate(${hue}deg)` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0" stopColor="#9f1625" />
            <stop offset="0.4" stopColor="#f04a23" />
            <stop offset="0.72" stopColor="#ff9d27" />
            <stop offset="1" stopColor="#ffd879" />
          </linearGradient>
          <radialGradient id={`${gradientId}-glow`} cx="50%" cy="68%" r="52%">
            <stop offset="0" stopColor="#fff4b1" stopOpacity=".95" />
            <stop offset=".45" stopColor="#ffb332" stopOpacity=".55" />
            <stop offset="1" stopColor="#ff5c21" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M30 2v8" stroke="#f8d889" strokeWidth="1.5" />
        <path d="M13 11 Q30 5 47 11 L51 17 Q30 23 9 17 Z" fill="#9f1625" stroke="#ffd879" strokeWidth="1.5" />
        <path
          d="M9 17 Q7 40 14 56 Q19 68 23 72 L37 72 Q41 68 46 56 Q53 40 51 17 Q30 23 9 17 Z"
          fill={`url(#${gradientId})`}
          stroke="#ffd879"
          strokeWidth="1.3"
        />
        <path
          d="M9 17 Q30 23 51 17 Q53 40 46 56 Q41 68 37 72 L23 72 Q19 68 14 56 Q7 40 9 17 Z"
          fill={`url(#${gradientId}-glow)`}
        />
        <path d="M16 20 Q15 48 25 68 M44 20 Q45 48 35 68" fill="none" stroke="#ffe29a" strokeOpacity=".55" strokeWidth="1.5" />
        <path d="M22 73 Q30 77 38 73 L36 78 Q30 81 24 78 Z" fill="#8f1b20" stroke="#f6c75d" strokeWidth="1" />
        <path d="M26 84 Q25 79 30 75 Q35 80 34 84 Q32 88 30 88 Q27 87 26 84 Z" fill="#ffb62e" className="lantern-flame" />
        <path d="M29 85 Q29 82 30 80 Q32 83 31 85 Z" fill="#fff3b0" />
      </svg>
    </span>
  );
}

export function Stars({ count = 80 }: { count?: number }) {
  const stars = useMemo(() => {
    const r = rand("stars" + count);
    return Array.from({ length: count }, (_, i) => ({
      i, x: r() * 100, y: r() * 85, s: r() * 2 + 0.5, d: r() * 5,
    }));
  }, [count]);
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s) => (
        <span key={s.i} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
      ))}
    </div>
  );
}

interface SkyProps {
  lanterns: Lantern[];
  max?: number;
  scale?: number;
  interactive?: boolean;
  highlightId?: string | null | undefined;
}

export function LanternSky({ lanterns, max = 120, scale = 1, interactive = true, highlightId }: SkyProps) {
  const [open, setOpen] = useState<Lantern | null>(null);
  const shown = lanterns.slice(-max);
  return (
    <div className={`absolute inset-0 overflow-hidden ${interactive ? "" : "pointer-events-none"}`}>
      {shown.map((l) => {
        const r = rand(l.id);
        const size = (16 + r() * 26) * scale;
        const dur = 32 + r() * 30;
        const delay = -r() * dur;
        const x = 4 + r() * 88;
        const isNew = l.id === highlightId;
        const lantern = (
          <span className="sway block" style={{ animationDuration: `${4 + r() * 4}s` }}>
            <LanternShape size={isNew ? size * 1.4 : size} hue={Math.round(r() * 35)} />
          </span>
        );
        return (
          interactive ? (
            <button
              key={l.id}
              type="button"
              onClick={() => setOpen(l)}
              aria-label={`Lantern: ${l.message}`}
              className={`absolute bottom-0 ${isNew ? "float-new" : "float-up"} cursor-pointer`}
              style={{ left: `${x}%`, animationDuration: isNew ? "9s" : `${dur}s`, animationDelay: isNew ? "0s" : `${delay}s` }}
            >
              {lantern}
            </button>
          ) : (
            <span
              key={l.id}
              aria-hidden="true"
              className={`absolute bottom-0 ${isNew ? "float-new" : "float-up"}`}
              style={{ left: `${x}%`, animationDuration: isNew ? "9s" : `${dur}s`, animationDelay: isNew ? "0s" : `${delay}s` }}
            >
              {lantern}
            </span>
          )
        );
      })}
      {open && (
        <div className="absolute inset-x-4 top-1/3 z-20 mx-auto max-w-xs animate-in fade-in zoom-in-95">
          <div className="wish-card relative p-5 text-center">
            <button onClick={() => setOpen(null)} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <p className="font-display text-lg leading-snug text-foreground">"{open.message}"</p>
            <p className="mt-2 text-sm text-gold">— {open.name || "A friend of Ta Saung Tine"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
