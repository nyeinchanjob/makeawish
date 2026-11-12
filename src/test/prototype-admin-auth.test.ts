import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPrototypeAdminSession,
  signInPrototypeAdmin,
  signOutPrototypeAdmin,
} from "@/lib/prototype-admin-auth";

describe("local prototype admin authentication", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects incorrect credentials with a clear message", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "Incorrect username or password." }, { status: 401 }),
        ),
    );

    await expect(signInPrototypeAdmin("wrong", "credentials")).rejects.toThrow(
      "Incorrect username or password.",
    );
  });

  it("uses the server session cookie for login, refresh, and logout", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ username: "itadmin" }))
      .mockResolvedValueOnce(Response.json({ username: "itadmin" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(signInPrototypeAdmin("itadmin", "123456")).resolves.toEqual({
      username: "itadmin",
    });
    await expect(getPrototypeAdminSession()).resolves.toEqual({ username: "itadmin" });
    await expect(signOutPrototypeAdmin()).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/login");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "same-origin",
      body: JSON.stringify({ username: "itadmin", password: "123456" }),
    });
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/admin/session");
    expect(fetchMock.mock.calls[2]?.[0]).toBe("/api/admin/logout");
  });
});
