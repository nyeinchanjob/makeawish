// @vitest-environment node
import { HttpRequest, InvocationContext } from "@azure/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearWishes,
  settings,
  wishById,
  wishes,
  withErrors,
} from "../src/handlers";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  create: vi.fn(),
  upsert: vi.fn(),
  item: vi.fn(),
  read: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  getContainer: vi.fn(),
}));
vi.mock("../src/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/store")>();
  return {
    ...original,
    getContainer: mocks.getContainer,
  };
});

const record = {
  id: "wish-1",
  employee_name: "Aye",
  email: "aye@coca-cola.com.mm",
  plant: "HB",
  message: "Let our lights shine",
  status: "approved",
  created_on: "2026-11-10T00:00:00Z",
};
const settingsRecord = {
  id: "app-settings",
  plant: "SYSTEM",
  autoApprove: true,
  updatedAt: "2026-11-10T00:00:00.000Z",
};
function request(method: string, path: string, value?: unknown, pin?: string) {
  return new HttpRequest({
    method,
    url: `http://localhost/api/${path}`,
    headers: {
      "content-type": "application/json",
      ...(pin ? { "x-admin-pin": pin } : {}),
    },
    params: { id: path.split("/")[1] || "" },
    ...(value === undefined ? {} : { body: { string: JSON.stringify(value) } }),
  });
}
const context = new InvocationContext();
const invoke = (handler: typeof wishes, req: HttpRequest) =>
  withErrors(handler)(req, context);

describe("Cosmos-backed Functions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.ADMIN_PIN;
    mocks.getContainer.mockResolvedValue({
      items: { query: mocks.query, create: mocks.create, upsert: mocks.upsert },
      item: mocks.item,
    });
    mocks.item.mockReturnValue({
      read: mocks.read,
      patch: mocks.patch,
      delete: mocks.delete,
    });
    mocks.read.mockResolvedValue({ resource: settingsRecord });
  });

  it("uses projected public queries and returns aggregate counts above the 120-wish limit", async () => {
    mocks.query
      .mockReturnValueOnce({
        fetchAll: async () => ({
          resources: [
            {
              id: record.id,
              employee_name: record.employee_name,
              plant: record.plant,
              message: record.message,
              created_on: record.created_on,
            },
          ],
        }),
      })
      .mockReturnValueOnce({
        fetchAll: async () => ({ resources: [{ plant: "HB", count: 250 }] }),
      });
    const result = await invoke(
      wishes,
      request("GET", "wishes?status=approved"),
    );
    expect(result.status).toBe(200);
    expect(result.jsonBody).toMatchObject({
      counts: { HTY: 0, HB: 250, CDC: 0, JC: 0 },
    });
    expect(JSON.stringify(result.jsonBody)).not.toContain("email");
    expect(mocks.query.mock.calls[0]?.[0]).toContain(
      "SELECT TOP 120 c.id, c.employee_name, c.plant, c.message, c.created_on",
    );
  });

  it.each([
    ["GET", "wishes?status=all", wishes],
    ["PATCH", "wishes/wish-1", wishById],
    ["DELETE", "wishes/wish-1", wishById],
    ["DELETE", "wishes/all", clearWishes],
    ["PATCH", "settings", settings],
    ["PUT", "settings", settings],
  ] as const)(
    "protects %s %s before touching data",
    async (method, path, handler) => {
      const result = await invoke(
        handler,
        request(method, path, { plant: "HB" }, "wrong"),
      );
      expect(result.status).toBe(401);
      expect(mocks.getContainer).not.toHaveBeenCalled();
      expect(mocks.query).not.toHaveBeenCalled();
      expect(mocks.item).not.toHaveBeenCalled();
      expect(mocks.upsert).not.toHaveBeenCalled();
    },
  );

  it("returns emails only to authenticated admins", async () => {
    process.env.ADMIN_PIN = "custom-pin";
    mocks.query.mockReturnValue({
      fetchAll: async () => ({ resources: [record] }),
    });
    expect(
      (
        await invoke(
          wishes,
          request("GET", "wishes?status=all", undefined, "2026"),
        )
      ).status,
    ).toBe(401);
    const result = await invoke(
      wishes,
      request("GET", "wishes?status=all", undefined, "custom-pin"),
    );
    expect(result.jsonBody).toEqual({ wishes: [record] });
  });

  it.each([true, false])(
    "creates a UUID wish according to autoApprove=%s",
    async (autoApprove) => {
      mocks.read.mockResolvedValue({
        resource: { ...settingsRecord, autoApprove },
      });
      const result = await invoke(wishes, request("POST", "wishes", record));
      expect(result.status).toBe(201);
      expect(result.jsonBody).toMatchObject({
        email: record.email,
        status: autoApprove ? "approved" : "pending",
      });
      expect(result.jsonBody.id).toMatch(/^[a-f0-9-]{14}4[a-f0-9-]{21}$/);
      expect(mocks.create).toHaveBeenCalledOnce();
    },
  );

  it("upserts complete default settings when the singleton is missing", async () => {
    mocks.read.mockRejectedValueOnce({ code: 404 });
    const result = await invoke(settings, request("GET", "settings"));
    expect(result.jsonBody).toEqual({ autoApprove: true });
    expect(mocks.item).toHaveBeenCalledWith("app-settings", "SYSTEM");
    expect(mocks.upsert).toHaveBeenCalledWith({
      id: "app-settings",
      plant: "SYSTEM",
      autoApprove: true,
      updatedAt: expect.any(String),
    });
    expect(
      Number.isNaN(Date.parse(mocks.upsert.mock.calls[0]![0].updatedAt)),
    ).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    null,
    {},
    { ...settingsRecord, autoApprove: "true" },
    { ...settingsRecord, autoApprove: null },
    { ...settingsRecord, plant: "HTY" },
    { ...settingsRecord, id: "incorrect" },
  ])(
    "repairs malformed settings %j before saving an approved wish",
    async (resource) => {
      mocks.read.mockResolvedValue({ resource });
      const result = await invoke(wishes, request("POST", "wishes", record));
      expect(result.status).toBe(201);
      expect(result.jsonBody.status).toBe("approved");
      expect(mocks.upsert).toHaveBeenCalledWith({
        id: "app-settings",
        plant: "SYSTEM",
        autoApprove: true,
        updatedAt: expect.any(String),
      });
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "approved" }),
      );
    },
  );

  it("upgrades legacy timestamp metadata without enabling a valid disabled toggle", async () => {
    mocks.read.mockResolvedValue({
      resource: { id: "app-settings", plant: "SYSTEM", autoApprove: false },
    });
    const result = await invoke(wishes, request("POST", "wishes", record));
    expect(result.status).toBe(201);
    expect(result.jsonBody.status).toBe("pending");
    expect(mocks.upsert).toHaveBeenCalledWith({
      id: "app-settings",
      plant: "SYSTEM",
      autoApprove: false,
      updatedAt: expect.any(String),
    });
  });

  it("persists repaired defaults and subsequent PATCH/PUT toggle changes for GET and submissions", async () => {
    mocks.read.mockResolvedValue({ resource: {} });
    mocks.upsert.mockImplementation(async (document) => {
      mocks.read.mockResolvedValue({ resource: document });
    });
    expect(
      (await invoke(settings, request("GET", "settings"))).jsonBody,
    ).toEqual({ autoApprove: true });
    expect(
      (await invoke(wishes, request("POST", "wishes", record))).jsonBody.status,
    ).toBe("approved");
    expect(mocks.upsert).toHaveBeenCalledOnce();
    expect(
      (
        await invoke(
          settings,
          request("PATCH", "settings", { autoApprove: false }, "2026"),
        )
      ).jsonBody,
    ).toEqual({ autoApprove: false });
    expect(
      (await invoke(settings, request("GET", "settings"))).jsonBody,
    ).toEqual({ autoApprove: false });
    expect(
      (await invoke(wishes, request("POST", "wishes", record))).jsonBody.status,
    ).toBe("pending");
    expect(
      (
        await invoke(
          settings,
          request("PUT", "settings", { autoApprove: true }, "2026"),
        )
      ).jsonBody,
    ).toEqual({ autoApprove: true });
    expect(
      (await invoke(settings, request("GET", "settings"))).jsonBody,
    ).toEqual({ autoApprove: true });
    expect(mocks.upsert).toHaveBeenCalledTimes(3);
  });

  it("does not save a wish or report successful settings repair when the upsert fails", async () => {
    mocks.read.mockResolvedValue({ resource: {} });
    mocks.upsert.mockRejectedValue(new Error("Settings write failed"));
    const result = await invoke(wishes, request("POST", "wishes", record));
    expect(result.status).toBe(500);
    expect(result.jsonBody.details).toBe("Settings write failed");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("saves long wishes and permits long admin edits without truncation", async () => {
    const message = "May this festival bring light and kindness to everyone. "
      .repeat(1000)
      .trim();
    const created = await invoke(
      wishes,
      request("POST", "wishes", { ...record, message }),
    );
    expect(created.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ message }),
    );
    mocks.patch.mockResolvedValue({ resource: { ...record, message } });
    expect(
      (
        await invoke(
          wishById,
          request("PATCH", "wishes/wish-1", { plant: "HB", message }, "2026"),
        )
      ).status,
    ).toBe(200);
    expect(mocks.patch).toHaveBeenCalledWith([
      { op: "set", path: "/message", value: message },
    ]);
  });

  it("reports the Cosmos document size limit rather than pretending it is an outage", async () => {
    mocks.create.mockRejectedValue({ code: 413 });
    const result = await invoke(wishes, request("POST", "wishes", record));
    expect(result.status).toBe(413);
    expect(result.jsonBody.error).toContain("2 MB");
  });

  it("does not default to approval when Cosmos settings cannot be read", async () => {
    mocks.read.mockRejectedValue(new Error("Database offline"));
    const result = await invoke(wishes, request("POST", "wishes", record));
    expect(result.status).toBe(500);
    expect(result.jsonBody.details).toBe("Database offline");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns initialization diagnostics rather than a generic 503", async () => {
    mocks.getContainer.mockRejectedValue(
      new Error("Cosmos DB initialization failed.", {
        cause: new Error("COSMOS_ENDPOINT and COSMOS_KEY must be configured."),
      }),
    );
    const result = await invoke(wishes, request("POST", "wishes", record));
    expect(result.status).toBe(500);
    expect(result.jsonBody).toEqual({
      error: "The festival service could not complete the request.",
      details:
        "Cosmos DB initialization failed. COSMOS_ENDPOINT and COSMOS_KEY must be configured.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("does not misreport a missing database during initialization as a missing wish", async () => {
    mocks.getContainer.mockRejectedValue(
      new Error("Cosmos DB initialization failed.", {
        cause: Object.assign(new Error("Database not found"), { code: 404 }),
      }),
    );
    const result = await invoke(settings, request("GET", "settings"));
    expect(result.status).toBe(500);
    expect(result.jsonBody.details).toContain("Database not found");
  });

  it("redacts server secrets from diagnostic error messages", async () => {
    vi.stubEnv("COSMOS_KEY", "private-cosmos-key");
    vi.stubEnv("ADMIN_PIN", "private-admin-pin");
    try {
      mocks.read.mockRejectedValue(
        new Error("Failure: private-cosmos-key private-admin-pin"),
      );
      const result = await invoke(wishes, request("POST", "wishes", record));
      expect(result.status).toBe(500);
      expect(result.jsonBody.details).toBe("Failure: [redacted] [redacted]");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each([
    { email: "aye@external.com" },
    { message: "ha ha ha ha" },
    { message: "aa" },
    { message: "a \n b" },
    { message: "a".repeat(151) },
    { employee_name: "" },
    { plant: "SYSTEM" },
  ])("rejects invalid submissions %j", async (invalid) => {
    expect(
      (
        await invoke(
          wishes,
          request("POST", "wishes", { ...record, ...invalid }),
        )
      ).status,
    ).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("patches and deletes by exact ID and partition key, and protects system config", async () => {
    mocks.patch.mockResolvedValue({
      resource: { ...record, status: "rejected" },
    });
    const updated = await invoke(
      wishById,
      request(
        "PATCH",
        "wishes/wish-1",
        { plant: "HB", status: "rejected", message: "A brighter tomorrow" },
        "2026",
      ),
    );
    expect(updated.status).toBe(200);
    expect(mocks.item).toHaveBeenCalledWith("wish-1", "HB");
    expect(mocks.patch).toHaveBeenCalledWith([
      { op: "set", path: "/status", value: "rejected" },
      { op: "set", path: "/message", value: "A brighter tomorrow" },
    ]);
    expect(
      (
        await invoke(
          wishById,
          request("DELETE", "wishes/wish-1", { plant: "HB" }, "2026"),
        )
      ).status,
    ).toBe(200);
    expect(mocks.delete).toHaveBeenCalledOnce();
    expect(
      (
        await invoke(
          wishById,
          request("DELETE", "wishes/app-settings", { plant: "SYSTEM" }, "2026"),
        )
      ).status,
    ).toBe(400);
  });

  it("clears multiple query pages while excluding the settings document", async () => {
    const pages = [
      [{ id: "one", plant: "HTY" }],
      [{ id: "two", plant: "CDC" }],
    ];
    mocks.query.mockReturnValue({
      hasMoreResults: () => pages.length > 0,
      fetchNext: async () => ({ resources: pages.shift()! }),
    });
    const result = await invoke(
      clearWishes,
      request("DELETE", "wishes/all", undefined, "2026"),
    );
    expect(result.jsonBody).toEqual({ deleted: 2 });
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.id != 'app-settings'");
    expect(mocks.item.mock.calls).toEqual([
      ["one", "HTY"],
      ["two", "CDC"],
    ]);
  });

  it("reports failed deletes instead of claiming reset succeeded", async () => {
    mocks.query.mockReturnValue({
      hasMoreResults: () => true,
      fetchNext: async () => ({ resources: [{ id: "one", plant: "HB" }] }),
    });
    mocks.delete.mockRejectedValue({ code: 429 });
    expect(
      (
        await invoke(
          clearWishes,
          request("DELETE", "wishes/all", undefined, "2026"),
        )
      ).status,
    ).toBe(429);
  });

  it.each(["PATCH", "PUT"])(
    "validates and persists a boolean autoApprove flag using %s",
    async (method) => {
      expect(
        (
          await invoke(
            settings,
            request(method, "settings", { autoApprove: "false" }, "2026"),
          )
        ).status,
      ).toBe(400);
      expect(
        (
          await invoke(
            settings,
            request(method, "settings", { autoApprove: false }, "2026"),
          )
        ).jsonBody,
      ).toEqual({ autoApprove: false });
      expect(mocks.upsert).toHaveBeenCalledWith({
        id: "app-settings",
        plant: "SYSTEM",
        autoApprove: false,
        updatedAt: expect.any(String),
      });
    },
  );
});
