import { createFileRoute, Link } from "@tanstack/react-router";
import { Stars } from "@/components/Sky";
import { VisitorWishForm } from "@/components/VisitorWishForm";
import { ApiModeNotice } from "@/components/ApiModeNotice";
import { lanternService } from "@/lib/lanterns";
import { appSubtitle, appTitle } from "@/lib/app-config";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: `${appTitle} — Share your wish` }] }),
  component: Submit,
});

function Submit() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-sky px-4 py-10">
      <Stars count={45} />
      <div className="relative mx-auto max-w-lg">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            Coca-Cola · Tazaungdaing 2026
          </p>
          <h1 className="mt-3 text-4xl font-bold text-glow">{appTitle}</h1>
          <p className="mt-2 text-gold">{appSubtitle}</p>
        </header>
        <ApiModeNotice className="mb-4" />
        <VisitorWishForm
          onSubmit={async (input) => {
            await lanternService.submit(input);
          }}
          onSuccess={() => {}}
        />
        <Link
          to="/display"
          className="mt-6 block text-center text-sm text-gold"
        >
          View the festival sky
        </Link>
      </div>
    </main>
  );
}
