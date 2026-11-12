import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode } from "lucide-react";
import { LanternSky, Stars } from "@/components/Sky";
import { VisitorWishForm } from "@/components/VisitorWishForm";
import { lanternService, useLanterns } from "@/lib/lanterns";
import { appSubtitle, appTitle } from "@/lib/app-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${appTitle} — Festival Wishes` },
      { name: "description", content: appSubtitle },
      { property: "og:title", content: appTitle },
      { property: "og:description", content: appSubtitle },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { lanterns, error: loadError } = useLanterns();
  const visible = lanterns.filter((lantern) => lantern.status !== "rejected");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky">
      <Stars count={70} />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <LanternSky lanterns={visible} max={18} scale={0.8} interactive={false} />
      </div>
      

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col px-5 pb-12 pt-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold">Coca-Cola · Coke Chill Festival</p>
        <h1 className="display-title mt-5 text-center font-display text-4x11 leading-tight text-foreground text-glow sm:text-6xl">
          {appTitle}
        </h1>
 {!submitted && (
          <Link
            to="/display"
            className="visitor-display-link mt-8 self-center rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            VIEW THE FESTIVAL SKY
          </Link>
        )}
        <div className="relative mt-8">
          {loadError && (
            <p className="mb-3 text-center text-sm text-destructive" role="alert">
             {loadError}
            </p>
          )}
          <VisitorWishForm
            onSubmit={async (input) => {
              await lanternService.submit(input);
            }}
            onSuccess={() => setSubmitted(true)}
          />
        </div>
       
      </div>
    </main>
  );
}
