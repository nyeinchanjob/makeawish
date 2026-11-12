import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DISPLAY_CACHE_KEY,
  lanternService,
  normalizeEmail,
  parseDisplayData,
  useLanterns,
  validateWish,
} from "@/lib/lanterns";

const data = {
  wishes: [
    {
      id: "wish-1",
      employee_name: "Aye",
      plant: "CDC",
      message: "Let hope shine",
      created_on: "2026-11-10T00:00:00Z",
    },
  ],
  counts: { HTY: 9, HB: 4, CDC: 132, JC: 2 },
};

describe("API lantern service and instant display cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders cached wishes synchronously while a fresh request is unresolved", () => {
    localStorage.setItem(DISPLAY_CACHE_KEY, JSON.stringify(data));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    const { result } = renderHook(() => useLanterns());
    expect(result.current.lanterns[0]?.message).toBe("Let hope shine");
    expect(result.current.counts.CDC).toBe(132);
  });

  it("refreshes every 5 seconds and caches fresh counts rather than the limited wish count", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(data)));
    vi.stubGlobal("fetch", fetcher);
    const { result } = renderHook(() => useLanterns());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.counts.CDC).toBe(132);
    expect(JSON.parse(localStorage.getItem(DISPLAY_CACHE_KEY)!)).toEqual(data);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps stale data visible on errors and surfaces the failed refresh", async () => {
    localStorage.setItem(DISPLAY_CACHE_KEY, JSON.stringify(data));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Database unavailable" }), {
          status: 503,
        }),
      ),
    );
    const { result } = renderHook(() => useLanterns());
    await waitFor(() =>
      expect(result.current.error).toBe("Database unavailable"),
    );
    expect(result.current.lanterns).toHaveLength(1);
  });

  it("never persists email or private fields in the public cache", () => {
    expect(
      parseDisplayData({
        ...data,
        wishes: [
          {
            ...data.wishes[0],
            email: "private@example.com",
            status: "approved",
          },
        ],
      }),
    ).toEqual(data);
  });

  it("sends a normalized company email and propagates save failures", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "Save failed" }), { status: 503 }),
      );
    vi.stubGlobal("fetch", fetcher);
    await expect(
      lanternService.submit({
        employee_name: " Aye ",
        email: "AYE@COCA-COLA.COM.MM",
        plant: "HB",
        message: " Let hope shine ",
      }),
    ).rejects.toThrow("Save failed");
    expect(JSON.parse(fetcher.mock.calls[0]![1].body)).toEqual({
      employee_name: "Aye",
      email: "aye@coca-cola.com.mm",
      plant: "HB",
      message: "Let hope shine",
    });
  });

  it("normalizes either email form and rejects foreign or doubled domains", () => {
    expect(normalizeEmail(" AYE ")).toBe("aye@coca-cola.com.mm");
    expect(normalizeEmail("Aye@coca-cola.com.mm")).toBe("aye@coca-cola.com.mm");
    expect(() => normalizeEmail("aye@gmail.com")).toThrow("@coca-cola.com.mm");
    expect(() =>
      normalizeEmail("aye@coca-cola.com.mm@coca-cola.com.mm"),
    ).toThrow();
  });

  it.each([
    "",
    "ab",
    "a \n b",
    "aaaaaa",
    "ha ha ha ha",
    "!!!!!!!!",
    "a".repeat(151),
  ])("rejects spam or invalid wish %s", (message) => {
    expect(validateWish(message)).not.toBeNull();
  });

  it("accepts meaningful Burmese and long wishes with no character maximum", () => {
    expect(validateWish("ပျော်ရွှင်ပါစေ")).toBeNull();
    const message = "May we shine together with hope and kindness! ".repeat(
      1000,
    );
    expect(message.length).toBeGreaterThan(16_384);
    expect(validateWish(message)).toBeNull();
    expect(validateWish("a \n b \t c")).toBeNull();
  });
});
