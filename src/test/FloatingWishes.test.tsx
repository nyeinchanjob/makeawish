import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FloatingWishes,
  getWishLayout,
  selectNextWishes,
} from "@/components/FloatingWishes";
import type { Lantern } from "@/lib/lanterns";

function wish(id: string): Lantern {
  return {
    id,
    name: "Aye",
    officeLocation: "CDC",
    message: "Let hope shine",
    status: "approved",
    createdAt: "2026-11-10T00:00:00Z",
  };
}

describe("display card scheduling", () => {
  afterEach(() => vi.useRealTimers());
  it("prioritizes newly fetched wishes in the very next cycle", () => {
    const seen = new Set(["old", "older"]);
    const selected = selectNextWishes(
      [wish("new"), wish("old"), wish("older")],
      2,
      seen,
      1,
    );
    expect(selected.map((item) => item.id)).toEqual(["new", "old"]);
    expect(new Set(selected.map((item) => item.id)).size).toBe(2);
  });

  it("exits aligned whole cards before replacing their mounted wrappers", () => {
    vi.useFakeTimers();
    render(
      <FloatingWishes
        messages={Array.from({ length: 10 }, (_, i) => wish(String(i)))}
      />,
    );
    const cards = screen.getAllByRole("article");
    const ids = cards.map((card) => card.dataset["wishId"]);
    expect(cards).toHaveLength(6);
    expect(
      new Set(
        cards.map((card) => {
          const slot = card.parentElement!;
          return `${slot.style.gridRow}/${slot.style.gridColumn}`;
        }),
      ).size,
    ).toBe(6);
    expect(screen.queryByText("✨ New")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2999));
    expect(cards.map((card) => card.dataset["wishId"])).toEqual(ids);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getAllByRole("article")).toEqual(cards);
    expect(document.querySelectorAll(".kanote-card-exiting")).toHaveLength(2);
    expect(cards[0]).toHaveClass("kanote-card-exiting");
    expect(cards[3]).toHaveClass("kanote-card-exiting");
    expect(cards[0]!.querySelectorAll(".kanote")).toHaveLength(4);
    expect(cards[0]!.querySelector(".kanote-copy")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(749));
    expect(screen.getAllByRole("article")).toEqual(cards);
    act(() => vi.advanceTimersByTime(1));
    const next = screen.getAllByRole("article");
    expect(next).toHaveLength(6);
    expect(next.filter((card, index) => card !== cards[index])).toHaveLength(2);
    expect(
      next.filter((card, index) => card.dataset["wishId"] !== ids[index]),
    ).toHaveLength(2);
    expect(document.querySelectorAll(".kanote-card-exiting")).toHaveLength(0);
    expect(document.querySelectorAll(".kanote-copy-exiting")).toHaveLength(0);
    expect(getWishLayout(1920)).toEqual({ columns: 3, rows: 2, capacity: 6 });
    expect(getWishLayout(390)).toEqual({ columns: 2, rows: 3, capacity: 6 });
  });

  it("prioritizes an arrival in the next partial rotation and briefly highlights only that wish", () => {
    vi.useFakeTimers();
    const messages = Array.from({ length: 8 }, (_, i) => wish(String(i)));
    const { rerender } = render(<FloatingWishes messages={messages} />);
    rerender(
      <FloatingWishes
        messages={[{ ...wish("new"), name: "New sender" }, ...messages]}
      />,
    );
    expect(screen.queryByText("✨ New")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3750));
    expect(screen.getAllByRole("article")[0]).toHaveAttribute(
      "data-wish-id",
      "new",
    );
    expect(screen.getAllByText("✨ New")).toHaveLength(1);
    const footer = screen.getByText("— New sender").closest("footer")!;
    expect(footer.textContent).toBe("— New senderCDC");
    expect(within(footer).getAllByText("CDC")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.queryByText("✨ New")).not.toBeInTheDocument();
  });

  it("applies edits and removals immediately, filling vacated cells without duplicates", () => {
    vi.useFakeTimers();
    const messages = Array.from({ length: 8 }, (_, i) => wish(String(i)));
    const { rerender } = render(<FloatingWishes messages={messages} />);
    act(() => vi.advanceTimersByTime(3000));
    rerender(
      <FloatingWishes
        messages={messages
          .slice(1)
          .map((item) =>
            item.id === "1" ? { ...item, message: "An edited wish" } : item,
          )}
      />,
    );
    expect(screen.getByText("An edited wish")).toBeInTheDocument();
    const ids = screen
      .getAllByRole("article")
      .map((card) => card.dataset["wishId"]);
    expect(ids).not.toContain("0");
    expect(new Set(ids).size).toBe(6);
    act(() => vi.advanceTimersByTime(750));
    expect(
      screen.getAllByRole("article").map((card) => card.dataset["wishId"]),
    ).toEqual(ids);
    rerender(<FloatingWishes messages={[]} />);
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("remounts the entire frame on repeated cycles even with exactly six wishes", () => {
    vi.useFakeTimers();
    render(
      <FloatingWishes
        messages={Array.from({ length: 6 }, (_, i) => wish(String(i)))}
      />,
    );
    const cards = screen.getAllByRole("article");
    const ids = cards.map((card) => card.dataset["wishId"]);
    act(() => vi.advanceTimersByTime(3750));
    const next = screen.getAllByRole("article");
    expect(next.map((card) => card.dataset["wishId"])).toEqual(ids);
    expect(next[0]).not.toBe(cards[0]);
    expect(next[3]).not.toBe(cards[3]);
    expect(cards[0]).not.toBeInTheDocument();
    expect(cards[3]).not.toBeInTheDocument();
  });
});
