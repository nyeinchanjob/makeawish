// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import { localApiPlugin } from "../server/local-api-plugin";
import { createLocalState, handleLocalRequest } from "../../shared/local-api";

let server: ViteDevServer;
let base: string;
beforeAll(async () => {
  vi.stubEnv("ADMIN_PIN", "local-test-pin");
  server = await createServer({
    configFile: false,
    plugins: [localApiPlugin()],
    appType: "custom",
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string")
    throw new Error("Dev API test server did not start.");
  base = `http://127.0.0.1:${address.port}/api`;
});
afterAll(async () => {
  await server?.close();
  vi.unstubAllEnvs();
});

describe("dev-only Vite middleware", () => {
  it("serves projected approved wishes directly from Vite", async () => {
    const response = await fetch(`${base}/wishes?status=approved`);
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Share-Light-Mode")).toBe("local-dev");
    const data = await response.json();
    expect(data.counts).toEqual({ HTY: 2, HB: 2, CDC: 2, JC: 2 });
    expect(JSON.stringify(data.wishes)).not.toContain("email");
  });

  it("authenticates mutations, validates data and clears wishes without resetting settings", async () => {
    expect((await fetch(`${base}/wishes?status=all`)).status).toBe(401);
    const pin = process.env["ADMIN_PIN"] || "2026";
    const send = (path: string, method: string, body?: unknown) =>
      fetch(`${base}${path}`, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    await send("/settings", "PATCH", { autoApprove: false });
    expect(
      (
        await send("/wishes", "POST", {
          employee_name: "Test",
          email: "bad@external.com",
          plant: "CDC",
          message: "Let the light shine",
        })
      ).status,
    ).toBe(400);
    const created = await (
      await send("/wishes", "POST", {
        employee_name: "Test",
        email: "test@coca-cola.com.mm",
        plant: "CDC",
        message: "Let the light shine",
      })
    ).json();
    expect(created.status).toBe("pending");
    expect(
      (
        await send(`/wishes/${created.id}`, "PATCH", {
          plant: "CDC",
          status: "approved",
          message: "A joyous festival for everyone",
        })
      ).status,
    ).toBe(200);
    expect(
      (await send(`/wishes/${created.id}`, "DELETE", { plant: "CDC" })).status,
    ).toBe(200);
    expect((await send("/wishes/all", "DELETE")).status).toBe(200);
    expect(
      await (await fetch(`${base}/wishes?status=approved`)).json(),
    ).toEqual({ wishes: [], counts: { HTY: 0, HB: 0, CDC: 0, JC: 0 } });
    expect(await (await fetch(`${base}/settings`)).json()).toEqual({
      autoApprove: false,
    });
  });

  it("does not partially update a status when an edited message is invalid", () => {
    const state = createLocalState();
    const wish = state.wishes[0]!;
    const result = handleLocalRequest(state, {
      path: `/wishes/${wish.id}`,
      method: "PATCH",
      pin: "2026",
      data: { plant: wish.plant, status: "rejected", message: "aaaaaa" },
    });
    expect(result.status).toBe(400);
    expect(wish.status).toBe("approved");
  });

  it("supports PUT settings with the same authentication and validation as PATCH", () => {
    const state = createLocalState();
    expect(
      handleLocalRequest(state, {
        path: "/settings",
        method: "PUT",
        data: { autoApprove: false },
      }).status,
    ).toBe(401);
    expect(state.autoApprove).toBe(true);
    expect(
      handleLocalRequest(state, {
        path: "/settings",
        method: "PUT",
        pin: "2026",
        data: { autoApprove: "false" },
      }).status,
    ).toBe(400);
    expect(
      handleLocalRequest(state, {
        path: "/settings",
        method: "PUT",
        pin: "2026",
        data: { autoApprove: false },
      }),
    ).toEqual({ status: 200, body: { autoApprove: false } });
    expect(
      handleLocalRequest(state, {
        path: "/settings",
        method: "GET",
      }).body,
    ).toEqual({ autoApprove: false });
  });

  it("accepts and edits wishes larger than the former 16 KB request cap", async () => {
    const message =
      "May this festival bring light and lasting joy to every colleague. ".repeat(
        1000,
      );
    const response = await fetch(`${base}/wishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_name: "Test",
        email: "test@coca-cola.com.mm",
        plant: "HB",
        message,
      }),
    });
    expect(response.status).toBe(201);
    const wish = await response.json();
    expect(wish.message).toBe(message.trim());
    const edited = await fetch(`${base}/wishes/${wish.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": "local-test-pin",
      },
      body: JSON.stringify({
        plant: "HB",
        message: `${message} Peace to everyone.`,
      }),
    });
    expect(edited.status).toBe(200);
    expect((await edited.json()).message).toBe(`${message} Peace to everyone.`);
  });

  it("migrates only old seeded names without removing plant words from real employee names", async () => {
    const { parseLocalState } = await import("../../shared/local-api");
    const state = createLocalState();
    state.wishes[0]!.employee_name = "Sample Light · HTY";
    state.wishes[1]!.employee_name = "Aye · HB";
    const migrated = parseLocalState(state);
    expect(migrated.wishes[0]!.employee_name).toBe("Sample Light 1");
    expect(migrated.wishes[1]!.employee_name).toBe("Aye · HB");
  });
});
