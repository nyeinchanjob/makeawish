// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  construct: vi.fn(),
  database: vi.fn(),
  container: vi.fn(),
}));
vi.mock("@azure/cosmos", () => ({
  CosmosClient: vi.fn(function () {
    mocks.construct();
    return { databases: { createIfNotExists: mocks.database } };
  }),
}));

describe("Cosmos initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.stubEnv("COSMOS_ENDPOINT", "https://example.documents.azure.com:443/");
    vi.stubEnv("COSMOS_KEY", "test-key");
    vi.stubEnv("COSMOS_DATABASE", "");
    vi.stubEnv("COSMOS_CONTAINER", "");
    mocks.database.mockResolvedValue({
      database: { containers: { createIfNotExists: mocks.container } },
    });
    mocks.container.mockResolvedValue({
      container: { id: "wishes" },
      resource: { partitionKey: { paths: ["/plant"] } },
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("provisions once across concurrent requests and reuses the initialized container", async () => {
    const { getContainer } = await import("../src/store");
    const [first, second] = await Promise.all([getContainer(), getContainer()]);
    expect(second).toBe(first);
    expect(await getContainer()).toBe(first);
    expect(mocks.construct).toHaveBeenCalledOnce();
    expect(mocks.database).toHaveBeenCalledExactlyOnceWith({
      id: "makeawish-db",
    });
    expect(mocks.container).toHaveBeenCalledExactlyOnceWith({
      id: "wishes",
      partitionKey: { paths: ["/plant"] },
    });
  });

  it("uses the configured database and container names", async () => {
    vi.stubEnv("COSMOS_DATABASE", "festival");
    vi.stubEnv("COSMOS_CONTAINER", "lights");
    const { getContainer } = await import("../src/store");
    await getContainer();
    expect(mocks.database).toHaveBeenCalledWith({ id: "festival" });
    expect(mocks.container).toHaveBeenCalledWith({
      id: "lights",
      partitionKey: { paths: ["/plant"] },
    });
  });

  it.each(["COSMOS_ENDPOINT", "COSMOS_KEY"])(
    "loads the module without crashing when %s is missing, and reports the request failure",
    async (setting) => {
      vi.stubEnv(setting, "");
      const { getContainer } = await import("../src/store");
      expect(mocks.construct).not.toHaveBeenCalled();
      await expect(getContainer()).rejects.toMatchObject({
        message: "Cosmos DB initialization failed.",
        cause: {
          message: expect.stringContaining(
            "Azure Static Web Apps application settings",
          ),
        },
      });
      expect(mocks.database).not.toHaveBeenCalled();
    },
  );

  it("contains client-construction errors inside the request boundary", async () => {
    mocks.construct.mockImplementation(() => {
      throw new Error("Invalid endpoint URL");
    });
    const { getContainer } = await import("../src/store");
    await expect(getContainer()).rejects.toMatchObject({
      cause: { message: "Invalid endpoint URL" },
    });
  });

  it("retries failed provisioning without constructing another client", async () => {
    mocks.container.mockRejectedValueOnce(new Error("Temporary Cosmos outage"));
    const { getContainer } = await import("../src/store");
    await expect(getContainer()).rejects.toMatchObject({
      cause: { message: "Temporary Cosmos outage" },
    });
    await expect(getContainer()).resolves.toEqual({ id: "wishes" });
    expect(mocks.construct).toHaveBeenCalledOnce();
    expect(mocks.container).toHaveBeenCalledTimes(2);
  });

  it("reports an incompatible existing partition key rather than silently using it", async () => {
    mocks.container.mockResolvedValue({
      container: { id: "wishes" },
      resource: { partitionKey: { paths: ["/id"] } },
    });
    const { getContainer } = await import("../src/store");
    await expect(getContainer()).rejects.toMatchObject({
      cause: {
        message: "The wishes container must use the /plant partition key.",
      },
    });
  });
});
