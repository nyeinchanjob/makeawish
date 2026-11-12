import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DisplayData, Wish } from "../../shared/wishes";

let client: typeof import("@/lib/api-client");
const input = {
  employee_name: "Test Light",
  email: "test.light@coca-cola.com.mm",
  plant: "HB",
  message: "May everyone shine with joy",
};

describe("isolated browser API fallback", () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    client = await import("@/lib/api-client");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each(["404", "network"])(
    "supports display, settings and all moderation actions after %s",
    async (failure) => {
      const fetcher = vi.fn();
      if (failure === "404")
        fetcher.mockImplementation(
          async () => new Response("Not Found", { status: 404 }),
        );
      else fetcher.mockRejectedValue(new TypeError("Failed to fetch"));
      vi.stubGlobal("fetch", fetcher);
      const data = await client.apiRequest<DisplayData>(
        "/wishes?status=approved",
      );
      expect(data.counts).toEqual({ HTY: 2, HB: 2, CDC: 2, JC: 2 });
      expect(
        data.wishes.some((wish) => /[\u1000-\u109f]/.test(wish.message)),
      ).toBe(true);
      expect(JSON.stringify(data)).not.toContain("email");
      expect(client.getApiMode()).toBe("browser");
      await expect(
        client.apiRequest("/wishes?status=all", "GET", undefined, "wrong"),
      ).rejects.toThrow("PIN");
      await client.apiRequest(
        "/settings",
        "PATCH",
        { autoApprove: false },
        "2026",
      );
      const created = await client.apiRequest<Wish>("/wishes", "POST", input);
      expect(created.status).toBe("pending");
      await client.apiRequest(
        `/wishes/${created.id}`,
        "PATCH",
        {
          plant: "HB",
          message: "An even brighter tomorrow",
          status: "approved",
        },
        "2026",
      );
      const all = await client.apiRequest<{ wishes: Wish[] }>(
        "/wishes?status=all",
        "GET",
        undefined,
        "2026",
      );
      expect(all.wishes[0]).toMatchObject({
        id: created.id,
        email: input.email,
        message: "An even brighter tomorrow",
        status: "approved",
      });
      await client.apiRequest(
        `/wishes/${created.id}`,
        "DELETE",
        { plant: "HB" },
        "2026",
      );
      await client.apiRequest("/wishes/all", "DELETE", undefined, "2026");
      expect(await client.apiRequest("/wishes?status=approved")).toEqual({
        wishes: [],
        counts: { HTY: 0, HB: 0, CDC: 0, JC: 0 },
      });
      expect(await client.apiRequest("/settings")).toEqual({
        autoApprove: false,
      });
      expect(
        JSON.parse(localStorage.getItem(client.LOCAL_API_STORAGE_KEY)!),
      ).toEqual({ wishes: [], autoApprove: false });
      expect(fetcher).toHaveBeenCalledTimes(1);
      // Reloading the module simulates a page reload: an intentionally cleared store stays empty.
      vi.resetModules();
      const reloaded = await import("@/lib/api-client");
      expect(
        await reloaded.apiRequest("/wishes?status=approved"),
      ).toMatchObject({ wishes: [] });
    },
  );

  it("uses the public configured PIN only for browser-demo authorization", async () => {
    vi.stubEnv("VITE_ADMIN_PIN", "public-demo-pin");
    vi.resetModules();
    const configured = await import("@/lib/api-client");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 })),
    );
    await expect(
      configured.apiRequest("/wishes?status=all", "GET", undefined, "2026"),
    ).rejects.toThrow("PIN");
    expect(
      await configured.apiRequest<{ wishes: Wish[] }>(
        "/wishes?status=all",
        "GET",
        undefined,
        "public-demo-pin",
      ),
    ).toHaveProperty("wishes");
    expect(configured.getApiMode()).toBe("browser");
  });

  it.each([400, 401, 403, 413, 429, 500, 503])(
    "does not bypass a real API's %s response",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ error: "Real API error" }), {
            status,
          }),
        ),
      );
      await expect(
        client.apiRequest("/wishes?status=all", "GET", undefined, "wrong"),
      ).rejects.toThrow("Real API error");
      expect(client.getApiMode()).toBe("live");
      expect(localStorage.getItem(client.LOCAL_API_STORAGE_KEY)).toBeNull();
    },
  );

  it("preserves a real missing-wish error instead of changing stores", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Wish not found." }), {
          status: 404,
        }),
      ),
    );
    await expect(
      client.apiRequest("/wishes/missing", "DELETE", { plant: "HB" }, "2026"),
    ).rejects.toThrow("Wish not found");
    expect(client.getApiMode()).toBe("live");
  });

  it("never activates a fallback after cancellation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
    );
    await expect(client.apiRequest("/settings")).rejects.toThrow("Aborted");
    expect(localStorage.getItem(client.LOCAL_API_STORAGE_KEY)).toBeNull();
  });

  it("reports blocked storage and preserves malformed stored data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 })),
    );
    localStorage.setItem(client.LOCAL_API_STORAGE_KEY, "broken");
    await expect(client.apiRequest("/settings")).rejects.toThrow();
    expect(localStorage.getItem(client.LOCAL_API_STORAGE_KEY)).toBe("broken");
    localStorage.removeItem(client.LOCAL_API_STORAGE_KEY);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage is full");
    });
    await expect(client.apiRequest("/wishes", "POST", input)).rejects.toThrow(
      "Storage is full",
    );
  });

  it("only switches back after explicit successful retry, without uploading local wishes", async () => {
    const live = { wishes: [], counts: { HTY: 0, HB: 0, CDC: 0, JC: 0 } };
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Offline"))
      .mockImplementation(async () => new Response(JSON.stringify(live)));
    vi.stubGlobal("fetch", fetcher);
    await client.apiRequest("/wishes", "POST", input);
    const stored = localStorage.getItem(client.LOCAL_API_STORAGE_KEY);
    await client.retryLiveApi();
    expect(client.getApiMode()).toBe("live");
    expect(await client.apiRequest("/wishes?status=approved")).toEqual(live);
    expect(localStorage.getItem(client.LOCAL_API_STORAGE_KEY)).toBe(stored);
    expect(
      fetcher.mock.calls
        .slice(1)
        .every(
          ([path, options]) =>
            path === "/api/wishes?status=approved" && !options?.body,
        ),
    ).toBe(true);
  });
});
