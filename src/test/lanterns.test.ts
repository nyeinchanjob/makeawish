import { beforeEach, describe, expect, it, vi } from "vitest";
import seedRecords from "@/lib/mock-lanterns.json";
import { lanternService, type Lantern } from "@/lib/lanterns";

describe("lanternService API repository", () => {
  let records: Lantern[];

  beforeEach(() => {
    records = seedRecords.map((record) => ({ ...record })) as Lantern[];
    const stored = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
      },
    });
    let id = 0;
    vi.stubGlobal(
      "crypto",
      Object.assign(Object.create(crypto), {
        randomUUID: () => `request-key-${++id}`,
      }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
        const path = String(input);
        const method = init.method || "GET";
        const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};

        if (path === "/api/lanterns" && method === "GET") {
          return Response.json(records);
        }
        if (path === "/api/lanterns" && method === "POST") {
          const created: Lantern = {
            id: `message-${records.length}`,
            name: String(body["name"]),
            employeeId: String(body["employeeId"]),
            message: String(body["message"]),
            officeLocation: body["officeLocation"] as Lantern["officeLocation"],
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          records = [...records, created];
          return Response.json(created, { status: 201 });
        }
        if (path.endsWith("/status") && method === "PATCH") {
          const id = decodeURIComponent(path.split("/").at(-2) || "");
          const record = records.find((item) => item.id === id);
          if (!record)
            return Response.json({ error: "Festival message was not found." }, { status: 404 });
          const updated = { ...record, status: body["status"] as Lantern["status"] };
          records = records.map((item) => (item.id === id ? updated : item));
          return Response.json(updated);
        }
        if (path === "/api/lanterns/export") return Response.json(records);
        return Response.json({ error: "Not found." }, { status: 404 });
      }),
    );
  });

  it("loads the JSON-backed records and appends submissions with office locations", async () => {
    const initial = await lanternService.getAll();
    const first = await lanternService.submit({
      name: "Aung Aung",
      employeeId: "EMP-1024",
      message: "ပျော်ရွှင်သော တန်ဆောင်တိုင် ဖြစ်ပါစေ",
      officeLocation: "HTY",
    });
    const second = await lanternService.submit({
      name: "Su Su",
      employeeId: "EMP-2048",
      message: "A second wish",
      officeLocation: "HmweBe",
    });
    const persisted = await lanternService.getAll();

    expect(initial).toEqual(seedRecords);
    expect(first).toMatchObject({
      id: `message-${initial.length}`,
      name: "Aung Aung",
      employeeId: "EMP-1024",
      message: "ပျော်ရွှင်သော တန်ဆောင်တိုင် ဖြစ်ပါစေ",
      officeLocation: "HTY",
      status: "pending",
      createdAt: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(first.createdAt))).toBe(false);
    expect(persisted).toHaveLength(initial.length + 2);
    expect(persisted.slice(-2)).toEqual([first, second]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/lanterns",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("updates approval and exports the same shared records", async () => {
    const [record] = await lanternService.getAll();
    if (!record) throw new Error("Expected seeded festival message.");

    await expect(lanternService.setStatus(record.id, "rejected")).resolves.toMatchObject({
      id: record.id,
      status: "rejected",
    });
    const exported = await lanternService.exportAll();
    expect(exported).toHaveLength(records.length);
    expect(records[0]?.status).toBe("rejected");
  });

  it("surfaces API errors instead of showing an unsaved submission as successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "The lantern data could not be read or saved." }, { status: 500 }),
        ),
    );

    await expect(
      lanternService.submit({
        name: "Visitor",
        employeeId: "EMP-1",
        message: "A wish",
        officeLocation: "CDC",
      }),
    ).rejects.toThrow("The lantern data could not be read or saved.");
  });

  it("does not send a submission without an employee ID", async () => {
    await expect(
      lanternService.submit({
        name: "Visitor",
        employeeId: "   ",
        message: "A wish",
        officeLocation: "CDC",
      }),
    ).rejects.toThrow("Please enter your employee ID.");
    expect(fetch).not.toHaveBeenCalled();
  });
});
