import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FloatingWishes,
  distributeMasonryCards,
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

const wishes = (count = 18) =>
  Array.from({ length: count }, (_, i) => wish(String(i)));
const columnFor = (node: HTMLElement) =>
  node.closest<HTMLDivElement>(".wish-column");
const idOf = (node: HTMLElement) => node.getAttribute("data-wish-id");

describe("locked masonry card scheduling", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1920);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("balances initial stacks while populating all four columns and preserving the artwork spacer", () => {
    expect(
      distributeMasonryCards([260, 80, 80, 80, 80, 80, 80, 80], 4),
    ).toEqual([0, 1, 2, 3, 2, 1, 2, 1]);
    expect(distributeMasonryCards([260, 80, 80, 80], 2)).toEqual([0, 1, 1, 1]);
    render(<FloatingWishes messages={wishes()} />);
    expect(screen.getAllByRole("article")).toHaveLength(14);
    for (const column of screen.getAllByRole("region", {
      name: /Wish column/,
    })) {
      expect(within(column).queryAllByRole("article").length).toBeGreaterThan(
        0,
      );
    }
  });

  it("exits only the top card, then appends its replacement without moving any surviving card across columns", () => {
    render(<FloatingWishes messages={wishes()} />);
    const cards = screen.getAllByRole("article");
    const columns = new Map(cards.map((card) => [card, columnFor(card)]));
    const firstColumn = columnFor(cards[0]!)!;
    const firstStack = within(firstColumn).getAllByRole("article");
    act(() => vi.advanceTimersByTime(3000));
    expect(document.querySelectorAll(".kanote-card-exiting")).toHaveLength(1);
    expect(cards[0]).toHaveClass("kanote-card-exiting");
    act(() => vi.advanceTimersByTime(749));
    expect(cards[0]).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(cards[0]).not.toBeInTheDocument();
    for (const card of cards.slice(1)) {
      expect(card).toBeInTheDocument();
      expect(columnFor(card)).toBe(columns.get(card));
    }
    const nextStack = within(firstColumn).getAllByRole("article");
    expect(nextStack.slice(0, -1)).toEqual(firstStack.slice(1));
    expect(idOf(nextStack.at(-1)!)).toBe("14");
    expect(screen.getAllByRole("article")).toHaveLength(14);
  });

  it("glides surviving items vertically in only the affected column for 700ms", () => {
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
      function (this: HTMLElement) {
        if (!this.classList.contains("wish-slot")) return 0;
        return Array.from(this.parentElement!.children).indexOf(this) * 100;
      },
    );
    const animate = vi.fn();
    vi.stubGlobal("ResizeObserver", undefined);
    const originalAnimate = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "animate",
    );
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });
    try {
      render(<FloatingWishes messages={wishes()} />);
      const column = screen.getByRole("region", { name: "Wish column 1" });
      const survivors = within(column).getAllByRole("article").slice(1);
      act(() => vi.advanceTimersByTime(3750));
      expect(animate).toHaveBeenCalledTimes(survivors.length);
      for (const call of animate.mock.calls) {
        expect(call).toEqual([
          [{ transform: "translateY(100px)" }, { transform: "translateY(0)" }],
          { duration: 700, easing: "ease-in-out" },
        ]);
      }
    } finally {
      if (originalAnimate) {
        Object.defineProperty(
          HTMLElement.prototype,
          "animate",
          originalAnimate,
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "animate");
      }
    }
  });

  it("prioritizes a new wish at the bottom of the next rotating column, without redistributing existing cards", () => {
    const messages = wishes();
    const { rerender } = render(<FloatingWishes messages={messages} />);
    const cards = screen.getAllByRole("article");
    rerender(
      <FloatingWishes
        messages={[{ ...wish("new"), name: "New sender" }, ...messages]}
      />,
    );
    expect(screen.queryByText("✨ New")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3750));
    const column = screen.getByRole("region", { name: "Wish column 1" });
    const last = within(column).getAllByRole("article").at(-1)!;
    expect(idOf(last)).toBe("new");
    expect(screen.getAllByText("✨ New")).toHaveLength(1);
    expect(last.querySelector("footer")!.textContent).toBe("— New senderCDC");
    for (const card of cards.slice(1)) expect(card).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.queryByText("✨ New")).not.toBeInTheDocument();
  });

  it("never rebalances existing cards after a height change, message edit or new arrival", () => {
    let resized = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const messages = wishes(8);
    const { rerender } = render(<FloatingWishes messages={messages} />);
    const cards = screen.getAllByRole("article");
    const columns = cards.map(columnFor);
    rerender(
      <FloatingWishes
        messages={[
          ...messages.map((item) =>
            item.id === "0"
              ? {
                  ...item,
                  message: "May everyone find lasting hope and peace. ".repeat(
                    100,
                  ),
                }
              : item,
          ),
          wish("new"),
        ]}
      />,
    );
    act(() => resized());
    cards.forEach((card, index) => {
      expect(card).toBeInTheDocument();
      expect(columnFor(card)).toBe(columns[index]);
    });
    expect(screen.getAllByRole("article")).toHaveLength(9);
  });

  it("applies moderation removals immediately and never resurrects an item removed during its exit", () => {
    const messages = wishes();
    const { rerender } = render(<FloatingWishes messages={messages} />);
    const cards = screen.getAllByRole("article");
    const columns = cards.map(columnFor);
    act(() => vi.advanceTimersByTime(3000));
    rerender(
      <FloatingWishes messages={messages.filter((item) => item.id !== "0")} />,
    );
    expect(cards[0]).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(750));
    expect(
      document.querySelector('[data-wish-id="0"]'),
    ).not.toBeInTheDocument();
    cards.slice(1).forEach((card, index) => {
      expect(card).toBeInTheDocument();
      expect(columnFor(card)).toBe(columns[index + 1]);
    });
    expect(screen.getAllByRole("article")).toHaveLength(14);
    rerender(<FloatingWishes messages={[]} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it.each([1, 4, 8, 14])(
    "never replays or duplicates wishes when all %i approved wishes are visible",
    (count) => {
      const messages = wishes(count);
      render(
        <FloatingWishes
          messages={[
            ...messages,
            messages[0]!,
            { ...wish("pending"), status: "pending" },
            { ...wish("rejected"), status: "rejected" },
          ]}
        />,
      );
      const cards = screen.getAllByRole("article");
      expect(cards).toHaveLength(count);
      act(() => vi.advanceTimersByTime(60000));
      expect(screen.getAllByRole("article")).toEqual(cards);
      expect(
        document.querySelector(".kanote-card-exiting"),
      ).not.toBeInTheDocument();
      expect(new Set(cards.map(idOf)).size).toBe(count);
    },
  );

  it("cancels an in-flight exit if moderation removes the only off-screen replacement", () => {
    const messages = wishes(15);
    const { rerender } = render(<FloatingWishes messages={messages} />);
    const cards = screen.getAllByRole("article");
    act(() => vi.advanceTimersByTime(3000));
    expect(cards[0]).toHaveClass("kanote-card-exiting");
    rerender(<FloatingWishes messages={messages.slice(0, 14)} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getAllByRole("article")).toEqual(cards);
    expect(
      document.querySelector(".kanote-card-exiting"),
    ).not.toBeInTheDocument();
  });

  it.each([
    [1, 1, "centered"],
    [2, 2, "centered"],
    [4, 4, "centered"],
    [5, 3, "expanded"],
    [6, 3, "expanded"],
    [8, 4, "expanded"],
    [9, 4, "full"],
    [18, 4, "full"],
  ] as const)(
    "adapts %i wishes to %i columns in the %s stage",
    (count, columns, mode) => {
      const { container } = render(<FloatingWishes messages={wishes(count)} />);
      expect(
        screen.getAllByRole("region", { name: /Wish column/ }),
      ).toHaveLength(columns);
      expect(
        container.querySelector(`.wish-field-${mode}`),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("article")).toHaveLength(Math.min(count, 14));
    },
  );

  it("adapts on arrivals and moderation without counting duplicate or unapproved wishes", () => {
    const { container, rerender } = render(
      <FloatingWishes messages={wishes(1)} />,
    );
    expect(container.querySelector(".wish-field-centered")).toBeInTheDocument();
    rerender(<FloatingWishes messages={wishes(5)} />);
    expect(container.querySelector(".wish-field-expanded")).toBeInTheDocument();
    rerender(<FloatingWishes messages={wishes(9)} />);
    expect(container.querySelector(".wish-field-full")).toBeInTheDocument();
    rerender(<FloatingWishes messages={wishes(2)} />);
    expect(container.querySelector(".wish-field-centered")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("adapts the number of independent columns only on a responsive breakpoint change", () => {
    const messages = wishes(8);
    render(<FloatingWishes messages={messages} />);
    const cards = screen.getAllByRole("article");
    vi.stubGlobal("innerWidth", 1600);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(screen.getAllByRole("article")).toEqual(cards);
    vi.stubGlobal("innerWidth", 800);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(screen.getAllByRole("region", { name: /Wish column/ })).toHaveLength(
      2,
    );
    vi.stubGlobal("innerWidth", 390);
    act(() => window.dispatchEvent(new Event("resize")));
    const column = screen.getByRole("region", { name: "Wish column 1" });
    expect(within(column).getAllByRole("article")).toHaveLength(8);
    expect(getWishLayout(390)).toEqual({
      columns: 1,
      capacity: 14,
      mode: "full",
    });
  });

  it("selects newly fetched wishes before older candidates", () => {
    expect(
      selectNextWishes(
        [wish("new"), wish("old"), wish("older")],
        2,
        new Set(["old", "older"]),
        1,
      ).map((item) => item.id),
    ).toEqual(["new", "old"]);
  });
});
