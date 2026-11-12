export interface PrototypeAdminSession {
  readonly username: string;
}

interface SessionResponse {
  username: string | null;
}

async function readError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return `Admin authentication failed (${response.status}).`;
}

export async function getPrototypeAdminSession(): Promise<PrototypeAdminSession | null> {
  const response = await fetch("/api/admin/session", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as SessionResponse;
  if (body.username === null) return null;
  if (typeof body.username !== "string") {
    throw new Error("The admin session response was invalid.");
  }
  return Object.freeze({ username: body.username });
}

export async function signInPrototypeAdmin(
  username: string,
  password: string,
): Promise<PrototypeAdminSession> {
  if (!username.trim() || !password) {
    throw new Error("Enter both a username and password.");
  }

  const response = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), password }),
  });
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as SessionResponse;
  if (typeof body.username !== "string") {
    throw new Error("The admin login response was invalid.");
  }
  return Object.freeze({ username: body.username });
}

export async function signOutPrototypeAdmin(): Promise<void> {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error(await readError(response));
}
