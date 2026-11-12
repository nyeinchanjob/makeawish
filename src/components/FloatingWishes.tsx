import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Lantern } from "@/lib/lanterns";

interface FloatingWishesProps {
  messages: Lantern[];
}

interface WishSlot {
  message: Lantern;
  position: number;
  size: "small" | "medium" | "large";
  phase: "visible" | "entering" | "exiting";
}

interface WishPosition {
  column: number;
  row: number;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function getTargetCount(width: number, height: number) {
  if (height < 560) return 1;
  if (width < 700) return 2;
  if (width < 1000) return 3;
  if (width < 1400) return 4;
  if (width < 1800) return 5;
  return 6;
}

function getWishSize(message: Lantern): WishSlot["size"] {
  if (message.message.length > 130) return "small";
  const size = hashString(message.id) % 3;
  return size === 0 ? "small" : size === 1 ? "medium" : "large";
}

export function FloatingWishes({ messages }: FloatingWishesProps) {
  const [targetCount, setTargetCount] = useState(() =>
    typeof window === "undefined" ? 4 : getTargetCount(window.innerWidth, window.innerHeight),
  );
  const [slots, setSlots] = useState<WishSlot[]>([]);
  const nextMessageRef = useRef(0);
  const swapTimersRef = useRef<number[]>([]);
  const slotsRef = useRef<WishSlot[]>([]);
  const positionsByMessageRef = useRef(new Map<string, number>());
  const columns = targetCount <= 2 ? 2 : 3;
  const layout = useMemo(() => {
    const result = new Map<number, WishPosition>();
    slots.forEach((slot) => {
      result.set(slot.position, {
        column: slot.position % columns,
        row: Math.floor(slot.position / columns),
      });
    });
    return result;
  }, [columns, slots]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    const resize = () => setTargetCount(getTargetCount(window.innerWidth, window.innerHeight));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!messages.length) {
      setSlots([]);
      return;
    }

    const count = Math.min(targetCount, messages.length);
    const createSlot = (
      message: Lantern,
      occupied: Set<number>,
    ): WishSlot => {
      const capacity = columns * 2;
      const start = hashString(message.id) % capacity;
      const occupiedRows = Array.from({ length: 2 }, (_, row) =>
        [...occupied].filter((position) => Math.floor(position / columns) === row).length,
      );
      const available = Array.from({ length: capacity }, (_, position) => position)
        .filter((position) => !occupied.has(position))
        .sort((left, right) => {
          const rowDifference =
            occupiedRows[Math.floor(left / columns)]! -
            occupiedRows[Math.floor(right / columns)]!;
          if (rowDifference) return rowDifference;
          return (left - start + capacity) % capacity - (right - start + capacity) % capacity;
        });
      const remembered = positionsByMessageRef.current.get(message.id);
      const position =
        remembered !== undefined && !occupied.has(remembered)
          ? remembered
          : (available[0] ?? start);
      positionsByMessageRef.current.set(message.id, position);
      occupied.add(position);
      return {
        message,
        position,
        size: getWishSize(message),
        phase: "entering",
      };
    };

    nextMessageRef.current = Math.max(nextMessageRef.current, count);
    setSlots((current) => {
      if (!current.length) {
        const occupied = new Set<number>();
        return messages.slice(0, count).map((message) => createSlot(message, occupied));
      }

      const currentIds = new Set(messages.map((message) => message.id));
      const retained: WishSlot[] = current
        .filter((slot) => currentIds.has(slot.message.id))
        .slice(0, count)
        .map((slot) => ({
          ...slot,
          phase: "visible" as const,
        }));
      const visibleIds = new Set(retained.map((slot) => slot.message.id));
      const occupied = new Set(retained.map((slot) => slot.position));
      for (const message of messages) {
        if (retained.length >= count) break;
        if (visibleIds.has(message.id)) continue;
        retained.push(createSlot(message, occupied));
        visibleIds.add(message.id);
      }
      return retained;
    });

    if (messages.length <= count) return;
    let nextPosition = 0;

    if (count < 1) return;
    const timer = window.setInterval(() => {
      const current = slotsRef.current;
      if (!current.length) return;
      const index = nextPosition++ % current.length;
      let candidate = messages[nextMessageRef.current++ % messages.length]!;
      while (current.some((slot) => slot.message.id === candidate.id)) {
        candidate = messages[nextMessageRef.current++ % messages.length]!;
      }
      const position = current[index]!.position;
      const exiting = current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, phase: "exiting" as const } : slot,
      );
      slotsRef.current = exiting;
      setSlots(exiting);

      const phaseTimer = window.setTimeout(() => {
        const occupiedPositions = new Set(
          slotsRef.current
            .filter((slot) => slot.position !== position)
            .map((slot) => slot.position),
        );
        const nextSlot = createSlot(candidate, occupiedPositions);
        const entering = slotsRef.current.map((slot) =>
          slot.position === position
            ? {
                ...slot,
                message: nextSlot.message,
                position: nextSlot.position,
                size: nextSlot.size,
                phase: "entering" as const,
              }
            : slot,
        );
        slotsRef.current = entering;
        setSlots(entering);

        const visibleTimer = window.setTimeout(() => {
          const visible = slotsRef.current.map((slot) =>
            slot.position === nextSlot.position ? { ...slot, phase: "visible" as const } : slot,
          );
          slotsRef.current = visible;
          setSlots(visible);
        }, 1400);
        swapTimersRef.current.push(visibleTimer);
      }, 700);
      swapTimersRef.current.push(phaseTimer);
    }, 7500);

    return () => {
      window.clearInterval(timer);
      swapTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      swapTimersRef.current = [];
    };
  }, [columns, messages, targetCount]);

  const gridStyle = {
    "--wish-columns": columns,
    "--wish-rows": 2,
  } as CSSProperties;

  return (
    <div className="wish-field" style={gridStyle} aria-live="polite">
      {slots.map((slot, index) => {
        const position = layout.get(slot.position);
        if (!position) return null;
        const isLong = slot.message.message.length > 130;
        return (
          <p
            key={`${slot.position}-${slot.message.id}`}
            className={`floating-wish floating-wish-${slot.size}${isLong ? " floating-wish-long" : ""} floating-wish-${slot.phase}`}
            style={{
              gridColumn: String(position.column + 1),
              gridRow: String(position.row + 1),
              animationDelay: `${(index % 4) * 0.25}s`,
            }}
          >
            <span className="floating-wish-message">{slot.message.message}</span>
            {slot.message.name && (
              <span className="floating-wish-author">— {slot.message.name}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}
