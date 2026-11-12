import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Lantern } from "@/lib/lanterns";

export function getWishLayout(width: number) {
  return {
    columns: width < 600 ? 2 : 3,
    rows: width < 600 ? 3 : 2,
    capacity: 6,
  };
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
  position: number;
  newUntil: number;
  cycleKey: number;
  exiting: boolean;
  enteredAt: number;
  floatDuration: number;
}

function cardGroup(position: number, columns: number) {
  return columns === 3 ? position % 3 : Math.floor(position / 2);
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
      <div className="kanote-message-area">
        <p className="kanote-message">{wish.message}</p>
      </div>
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
  const [layout, setLayout] = useState(() =>
    getWishLayout(typeof window === "undefined" ? 1440 : window.innerWidth),
  );
  const [cards, setCards] = useState<Card[]>([]);
  const cardsRef = useRef<Card[]>([]);
  const latest = useRef<Lantern[]>([]);
  const known = useRef<Set<string> | null>(null);
  const arrivals = useRef(new Set<string>());
  const seen = useRef(new Set<string>());
  const cursor = useRef(0);
  const nextGroup = useRef(0);
  const nextRotationAt = useRef(Date.now() + 3000);
  const generation = useRef(0);
  const previousColumns = useRef(layout.columns);
  const commit = useCallback((next: Card[]) => {
    cardsRef.current = next;
    setCards(next);
  }, []);

  useEffect(() => {
    const resize = () => setLayout(getWishLayout(window.innerWidth));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    latest.current = messages;
    if (!known.current && messages.length) {
      // The first snapshot is existing data, not a burst of newly submitted wishes.
      known.current = new Set(messages.map((wish) => wish.id));
    } else if (known.current) {
      for (const wish of messages) {
        if (!known.current.has(wish.id)) arrivals.current.add(wish.id);
        known.current.add(wish.id);
      }
    }
    const now = Date.now();
    const resized = previousColumns.current !== layout.columns;
    previousColumns.current = layout.columns;
    if (resized) {
      nextGroup.current = 0;
      nextRotationAt.current = now + 3000;
    }
    const byId = new Map(messages.map((wish) => [wish.id, wish]));
    const next = cardsRef.current.flatMap((card) => {
      const wish = byId.get(card.wish.id);
      return wish
        ? [
            {
              ...card,
              wish,
            },
          ]
        : [];
    });
    const occupied = new Set(next.map((card) => card.wish.id));
    for (let position = 0; position < 6; position++) {
      if (next.some((card) => card.position === position)) continue;
      const wish = messages.find((candidate) => !occupied.has(candidate.id));
      if (!wish) break;
      occupied.add(wish.id);
      seen.current.add(wish.id);
      next.push({
        wish,
        position,
        newUntil: arrivals.current.delete(wish.id) ? now + 9000 : 0,
        cycleKey: ++generation.current,
        exiting: false,
        enteredAt: now,
        floatDuration: 7500,
      });
    }
    const changedGroups = new Set(
      next
        .filter(
          (card) =>
            resized ||
            cardsRef.current.find((old) => old.position === card.position)?.wish
              .id !== card.wish.id,
        )
        .map((card) => cardGroup(card.position, layout.columns)),
    );
    for (const card of next) {
      const group = cardGroup(card.position, layout.columns);
      if (!changedGroups.has(group)) continue;
      card.cycleKey = ++generation.current;
      card.exiting = false;
      card.enteredAt = now;
      card.floatDuration = Math.max(
        1,
        nextRotationAt.current -
          now +
          ((group - nextGroup.current + 3) % 3) * 3000 -
          750,
      );
    }
    // Apply edits and removals immediately, rather than waiting for the rotation timer.
    commit(next.sort((a, b) => a.position - b.position));
  }, [messages, layout.columns, commit]);

  useEffect(() => {
    let transitionTimer: number | undefined;
    nextRotationAt.current = Date.now() + 3000;
    const timer = window.setInterval(() => {
      const now = Date.now();
      nextRotationAt.current = now + 3000;
      const next = cardsRef.current.map((card) => ({
        ...card,
        newUntil: card.newUntil <= now ? 0 : card.newUntil,
      }));
      const group = nextGroup.current;
      nextGroup.current = (group + 1) % 3;
      const leaving = next.filter(
        (card) =>
          cardGroup(card.position, layout.columns) === group &&
          now - card.enteredAt >= 750,
      );
      if (leaving.length) {
        // Aligned desktop cards move together, preserving their compact vertical gap.
        const keys = new Set(leaving.map((card) => card.cycleKey));
        for (const card of leaving) card.exiting = true;
        transitionTimer = window.setTimeout(() => {
          const current = cardsRef.current;
          const finishing = current.filter(
            (card) => keys.has(card.cycleKey) && card.exiting,
          );
          if (!finishing.length) return;
          const occupied = new Set(current.map((card) => card.wish.id));
          const candidates = latest.current.filter(
            (wish) => !occupied.has(wish.id),
          );
          const fresh = candidates.filter((wish) =>
            arrivals.current.has(wish.id),
          );
          const chosen = [
            ...fresh,
            ...selectNextWishes(
              candidates.filter((wish) => !arrivals.current.has(wish.id)),
              finishing.length - fresh.slice(0, finishing.length).length,
              seen.current,
              cursor.current % Math.max(candidates.length, 1),
            ),
          ].slice(0, finishing.length);
          cursor.current += chosen.length;
          let index = 0;
          commit(
            current.map((card) => {
              if (!keys.has(card.cycleKey) || !card.exiting) return card;
              const wish = chosen[index++] ?? card.wish;
              seen.current.add(wish.id);
              return {
                ...card,
                wish,
                cycleKey: ++generation.current,
                exiting: false,
                enteredAt: Date.now(),
                floatDuration: 7500,
                newUntil: arrivals.current.delete(wish.id)
                  ? Date.now() + 9000
                  : wish.id === card.wish.id
                    ? card.newUntil
                    : 0,
              };
            }),
          );
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
      className="wish-field"
      style={
        {
          "--wish-columns": layout.columns,
          "--wish-rows": layout.rows,
        } as CSSProperties
      }
    >
      {cards.map(
        ({ wish, position, newUntil, cycleKey, exiting, floatDuration }) => (
          <div
            key={position}
            className="wish-slot"
            style={
              {
                gridColumn: (position % layout.columns) + 1,
                gridRow: Math.floor(position / layout.columns) + 1,
              } as CSSProperties
            }
          >
            <article
              key={`${wish.id}-${cycleKey}`}
              className={`kanote-card${exiting ? " kanote-card-exiting" : ""}${newUntil ? " kanote-card-new" : ""}`}
              data-wish-id={wish.id}
              style={
                { "--float-duration": `${floatDuration}ms` } as CSSProperties
              }
            >
              {[0, 1, 2, 3].map((corner) => (
                <Kanote key={corner} corner={corner} />
              ))}
              <WishCopy wish={wish} />
              {newUntil > 0 && <span className="kanote-new-badge">✨ New</span>}
            </article>
          </div>
        ),
      )}
    </div>
  );
}
