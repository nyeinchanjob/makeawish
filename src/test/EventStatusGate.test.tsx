import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EventConcluded, EventStatusGate } from "@/components/EventStatusGate";

describe("EventStatusGate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hides application content while the event is closed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ eventClosed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <EventStatusGate>
        <form aria-label="wish form" />
      </EventStatusGate>,
    );

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Checking event status",
    );
    expect(
      await screen.findByRole("heading", { name: "Event Concluded" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "wish form" })).toBeNull();
    expect(
      screen.getByText(
        /Tazaungdaing 2026 — Share the Light, Share a Coke has concluded/,
      ),
    ).toBeInTheDocument();
  });

  it("renders normal application routes while the event is open", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ eventClosed: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <EventStatusGate>
        <main>Normal application</main>
      </EventStatusGate>,
    );

    expect(await screen.findByText("Normal application")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Event Concluded" }),
    ).toBeNull();
  });

  it("keeps the concluded screen independent of live app content", () => {
    render(<EventConcluded />);
    expect(
      screen.getByRole("heading", { name: "Event Concluded" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("continues to the normal app when status cannot be checked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <EventStatusGate>
        <main>Normal application</main>
      </EventStatusGate>,
    );

    await waitFor(() =>
      expect(screen.getByText("Normal application")).toBeInTheDocument(),
    );
    expect(warn).toHaveBeenCalled();
  });
});
