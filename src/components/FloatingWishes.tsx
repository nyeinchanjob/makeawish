import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Lantern } from "@/lib/lanterns";

export function getWishLayout(width: number, count = 14) {
  const mode = count <= 4 ? "centered" : count <= 8 ? "expanded" : "full";
  const desiredColumns = count <= 4 ? Math.max(1, count) : count <= 6 ? 3 : 4;
  return {
    columns: Math.min(width < 600 ? 1 : width < 1100 ? 2 : 4, desiredColumns),
    capacity: 14,
    mode,
  };
}

export function distributeMasonryCards(
  heights: number[],
  columns: number,
  fullStage = true,
) {
  const bottoms: number[] = Array.from({ length: columns }, (_, column) =>
    fullStage
      ? columns === 4 && column === 3
        ? 210
        : column === 1
          ? 48
          : 24
      : 0,
  );
  return heights.map((height, index) => {
    const column =
      index < columns ? index : bottoms.indexOf(Math.min(...bottoms));
    bottoms[column] = bottoms[column]! + height + 16;
    return column;
  });
}

export function selectNextWishes(
  messages: Lantern[],
  count: number,
  seen: Set<string>,
  cursor: number,
) {
  const fresh = messages.filter((message) => !seen.has(message.id));
  const rotated = [...messages.slice(cursor), ...messages.slice(0, cursor)];
  const chosen = [
    ...fresh,
    ...rotated.filter((message) => seen.has(message.id)),
  ].slice(0, count);
  chosen.forEach((message) => seen.add(message.id));
  return chosen;
}

function Kanote({ corner }: { corner: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`kanote kanote-${corner}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 58V17Q3 3 17 3H58M9 49Q30 46 27 27Q25 12 13 16Q6 20 13 28Q19 33 23 25M9 39Q13 35 18 37Q29 42 39 28Q45 18 37 10Q32 17 25 17M32 6Q42 3 48 10Q41 13 39 22M6 57Q15 53 18 44M57 6Q53 15 44 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M9 9Q14 5 19 9Q14 14 9 19Q5 14 9 9Z" fill="currentColor" />
    </svg>
  );
}

interface Card {
  wish: Lantern;
  column: number;
  newUntil: number;
  cycleKey: number;
  exiting: boolean;
  enteredAt: number;
  floatDuration: number;
}

function estimatedHeight(wish: Lantern) {
  const lines = wish.message
    .split("\n")
    .reduce(
      (total, line) => total + Math.max(1, Math.ceil(line.length / 30)),
      0,
    );
  return 66 + lines * 26;
}

function WishCopy({ wish }: { wish: Lantern }) {
  return (
    <div
      className="kanote-copy"
      style={
        {
          "--message-scale":
            wish.message.length > 600
              ? 0.8
              : wish.message.length > 200
                ? 0.9
                : 1,
        } as CSSProperties
      }
    >
      <p className="kanote-message">{wish.message}</p>
      <footer className="kanote-sender flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">— {wish.name}</span>
        <span className="shrink-0 rounded-full border border-current/50 px-2 py-0.5">
          {wish.officeLocation}
        </span>
      </footer>
    </div>
  );
}

export function FloatingWishes({ messages }: { messages: Lantern[] }) {
  const approvedWishes = useMemo(
    () => [
      ...new Map(
        messages
          .filter((wish) => wish.status === "approved")
          .map((wish) => [wish.id, wish]),
      ).values(),
    ],
    [messages],
  );
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const layout = getWishLayout(width, approvedWishes.length);
  const [cards, setCards] = useState<Card[]>([]);
  const cardsRef = useRef<Card[]>([]);
  const slots = useRef(new Map<number, HTMLDivElement>());
  const offsets = useRef(new Map<number, { top: number; column: number }>());
  const latest = useRef<Lantern[]>([]);
  const known = useRef<Set<string> | null>(null);
  const arrivals = useRef(new Set<string>());
  const seen = useRef(new Set<string>());
  const cursor = useRef(0);
  const nextColumn = useRef(0);
  const generation = useRef(0);
  const previousColumns = useRef(layout.columns);
  const commit = useCallback((next: Card[]) => {
    cardsRef.current = next;
    setCards(next);
  }, []);

  useEffect(() => {
    const resize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const glide = useCallback(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const next = new Map<number, { top: number; column: number }>();
    for (const card of cardsRef.current) {
      const slot = slots.current.get(card.cycleKey);
      if (!slot) continue;
      const previous = offsets.current.get(card.cycleKey);
      const top = slot.offsetTop;
      if (
        previous?.column === card.column &&
        previous.top !== top &&
        !reducedMotion &&
        typeof slot.animate === "function"
      ) {
        // FLIP moves only the layout wrapper; the inner full-card float remains independent.
        slot.animate(
          [
            { transform: `translateY(${previous.top - top}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 700, easing: "ease-in-out" },
        );
      }
      next.set(card.cycleKey, { top, column: card.column });
    }
    offsets.current = next;
  }, []);

  useLayoutEffect(() => {
    glide();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(glide);
    for (const slot of slots.current.values()) observer.observe(slot);
    return () => observer.disconnect();
  }, [cards, glide, layout.columns, layout.mode]);

  useEffect(() => {
    latest.current = approvedWishes;
    if (!known.current && approvedWishes.length) {
      known.current = new Set(approvedWishes.map((wish) => wish.id));
    } else if (known.current) {
      for (const wish of approvedWishes) {
        if (!known.current.has(wish.id)) arrivals.current.add(wish.id);
        known.current.add(wish.id);
      }
    }
    const now = Date.now();
    const resized = previousColumns.current !== layout.columns;
    previousColumns.current = layout.columns;
    if (resized) nextColumn.current = 0;
    const byId = new Map(approvedWishes.map((wish) => [wish.id, wish]));
    const next = cardsRef.current.flatMap((card) => {
      const wish = byId.get(card.wish.id);
      return wish
        ? [
            {
              ...card,
              wish,
              exiting:
                approvedWishes.length <= layout.capacity ? false : card.exiting,
            },
          ]
        : [];
    });
    if (resized) {
      const columns = distributeMasonryCards(
        next.map((card) => estimatedHeight(card.wish)),
        layout.columns,
        layout.mode === "full",
      );
      next.forEach((card, index) => {
        card.column = columns[index]!;
        card.cycleKey = ++generation.current;
        card.exiting = false;
        card.enteredAt = now;
      });
    }
    const occupied = new Set(next.map((card) => card.wish.id));
    const bottoms: number[] = Array.from(
      { length: layout.columns },
      (_, column) =>
        layout.mode === "full"
          ? layout.columns === 4 && column === 3
            ? 210
            : column === 1
              ? 48
              : 24
          : 0,
    );
    const counts = Array.from({ length: layout.columns }, () => 0);
    for (const card of next) {
      if (resized) {
        card.floatDuration =
          (counts[card.column]! * layout.columns + card.column + 1) * 3000 -
          750;
      }
      bottoms[card.column] =
        bottoms[card.column]! +
        (slots.current.get(card.cycleKey)?.offsetHeight ||
          estimatedHeight(card.wish)) +
        16;
      counts[card.column] = counts[card.column]! + 1;
    }
    for (const wish of approvedWishes) {
      if (next.length >= layout.capacity) break;
      if (occupied.has(wish.id)) continue;
      const empty = counts.indexOf(0);
      const column = empty >= 0 ? empty : bottoms.indexOf(Math.min(...bottoms));
      const indexInColumn = counts[column]!;
      seen.current.add(wish.id);
      occupied.add(wish.id);
      next.push({
        wish,
        column,
        cycleKey: ++generation.current,
        exiting: false,
        enteredAt: now,
        floatDuration: Math.max(
          1,
          (indexInColumn * layout.columns +
            ((column - nextColumn.current + layout.columns) % layout.columns) +
            1) *
            3000 -
            750,
        ),
        newUntil: arrivals.current.delete(wish.id) ? now + 9000 : 0,
      });
      bottoms[column] = bottoms[column]! + estimatedHeight(wish) + 16;
      counts[column] = indexInColumn + 1;
    }
    // Existing cards retain their column and key through edits, removals and arrivals.
    commit(next);
  }, [approvedWishes, layout.columns, layout.capacity, layout.mode, commit]);

  useEffect(() => {
    let transitionTimer: number | undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      const next = cardsRef.current.map((card) => ({
        ...card,
        newUntil: card.newUntil <= now ? 0 : card.newUntil,
      }));
      const column = nextColumn.current;
      nextColumn.current = (column + 1) % layout.columns;
      const leaving = next.find((card) => card.column === column);
      const occupied = new Set(next.map((card) => card.wish.id));
      const hasReplacement = latest.current.some(
        (wish) => !occupied.has(wish.id),
      );
      if (leaving && hasReplacement && now - leaving.enteredAt >= 750) {
        leaving.exiting = true;
        const key = leaving.cycleKey;
        transitionTimer = window.setTimeout(() => {
          const current = cardsRef.current;
          const exiting = current.find(
            (card) => card.cycleKey === key && card.exiting,
          );
          if (!exiting) return;
          const occupied = new Set(current.map((card) => card.wish.id));
          const candidates = latest.current.filter(
            (wish) => !occupied.has(wish.id),
          );
          const wish =
            candidates.find((candidate) =>
              arrivals.current.has(candidate.id),
            ) ??
            selectNextWishes(
              candidates,
              1,
              seen.current,
              cursor.current % Math.max(candidates.length, 1),
            )[0];
          if (!wish) {
            commit(
              current.map((card) =>
                card.cycleKey === key ? { ...card, exiting: false } : card,
              ),
            );
            return;
          }
          cursor.current++;
          seen.current.add(wish.id);
          const remaining = current.filter((card) => card.cycleKey !== key);
          const length = remaining.filter(
            (card) => card.column === column,
          ).length;
          // Append to the same column, never rebalance neighboring stacks.
          commit([
            ...remaining,
            {
              ...exiting,
              wish,
              cycleKey: ++generation.current,
              exiting: false,
              enteredAt: Date.now(),
              floatDuration: (length + 1) * layout.columns * 3000 - 1500,
              newUntil: arrivals.current.delete(wish.id)
                ? Date.now() + 9000
                : 0,
            },
          ]);
        }, 750);
      }
      commit(next);
    }, 3000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(transitionTimer);
    };
  }, [layout.columns, commit]);

  return (
    <div
      className={`wish-field wish-field-${layout.mode}`}
      role="region"
      aria-label="Scrollable festival wish wall"
      tabIndex={0}
      style={{ "--wish-columns": layout.columns } as CSSProperties}
    >
      <div className="wish-masonry">
        {Array.from({ length: layout.columns }, (_, column) => (
          <div
            className="wish-column"
            key={column}
            role="region"
            aria-label={`Wish column ${column + 1}`}
          >
            {cards
              .filter((card) => card.column === column)
              .map((card) => (
                <div
                  key={`${card.wish.id}-${card.cycleKey}`}
                  className="wish-slot"
                  ref={(element) => {
                    if (element) slots.current.set(card.cycleKey, element);
                    else slots.current.delete(card.cycleKey);
                  }}
                >
                  <article
                    className={`kanote-card${card.exiting ? " kanote-card-exiting" : ""}${card.newUntil ? " kanote-card-new" : ""}`}
                    data-wish-id={card.wish.id}
                    style={
                      {
                        "--float-duration": `${card.floatDuration}ms`,
                      } as CSSProperties
                    }
                  >
                    {[0, 1, 2, 3].map((corner) => (
                      <Kanote key={corner} corner={corner} />
                    ))}
                    <WishCopy wish={card.wish} />
                    {card.newUntil > 0 && (
                      <span className="kanote-new-badge">✨ New</span>
                    )}
                  </article>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
