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
  it.each([
    ["GET", "/wishes?status=approved"],
    ["POST", "/wishes"],
    ["DELETE", "/wishes/all"],
    ["PATCH", "/wishes/wish-1"],
    ["GET", "/settings"],
    ["PATCH", "/settings"],
  ] as const)("returns Forbidden for %s /api%s", async (method, path) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status).toBe(403);
    expect(response.headers.get("X-Share-Light-Mode")).toBe("local-dev");
    expect(await response.json()).toEqual({ error: "Forbidden" });
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
