import {
  createLocalState,
  handleLocalRequest,
  parseLocalState,
  type LocalRequest,
} from "../../shared/local-api";

export const LOCAL_API_STORAGE_KEY = "share-light.local-api.v1";
export const BROWSER_DEMO_PIN = import.meta.env["VITE_ADMIN_PIN"] || "2026";
export type ApiMode = "live" | "dev" | "browser";
let mode: ApiMode = "live";
const listeners = new Set<() => void>();
export const getApiMode = () => mode;
export function subscribeApiMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setMode(next: ApiMode) {
  if (mode === next) return;
  mode = next;
  listeners.forEach((listener) => listener());
}

function localRequest<T>(request: LocalRequest): T {
  const raw = window.localStorage.getItem(LOCAL_API_STORAGE_KEY);
  const state =
    raw === null ? createLocalState() : parseLocalState(JSON.parse(raw));
  const result = handleLocalRequest(state, request, BROWSER_DEMO_PIN);
  if (result.status >= 400) {
    const body = result.body as { error: string };
    throw new Error(body.error);
  }
  // Persist before returning success; blocked/full storage must fail visibly.
  if (raw === null || request.method !== "GET") {
    window.localStorage.setItem(LOCAL_API_STORAGE_KEY, JSON.stringify(state));
  }
  return result.body as T;
}

function fallback<T>(request: LocalRequest, reason: string): T {
  if (mode !== "browser") {
    console.warn(
      `Festival API unavailable (${reason}). Using isolated browser demo data; nothing is synced to Cosmos DB.`,
    );
    setMode("browser");
  }
  return localRequest<T>(request);
}

function errorMessage(text: string, status: number): string {
  let detail: unknown;
  try {
    detail = JSON.parse(text);
  } catch {
    detail = null;
  }
  return detail &&
    typeof detail === "object" &&
    "error" in detail &&
    typeof detail.error === "string"
    ? detail.error
    : `Festival service returned ${status}.`;
}

export async function apiRequest<T>(
  path: string,
  method = "GET",
  data?: unknown,
  pin?: string,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted();
  const request: LocalRequest = { path, method, data, ...(pin ? { pin } : {}) };
  if (mode === "browser") return localRequest<T>(request);
  const headers: Record<string, string> = {};
  if (data !== undefined) headers["Content-Type"] = "application/json";
  if (pin) headers["x-admin-pin"] = pin;
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      cache: "no-store",
      ...(signal ? { signal } : {}),
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
  } catch (error) {
    if (
      signal?.aborted ||
      (error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AbortError")
    )
      throw error;
    return fallback<T>(request, "network connection failed");
  }
  if (response.status === 404) {
    const text = await response.text();
    // A real API's missing-record error is not a missing backend.
    if (
      /^\/wishes\/[^/?]+$/.test(path) &&
      path !== "/wishes/all" &&
      errorMessage(text, 404) === "Wish not found."
    ) {
      throw new Error("Wish not found.");
    }
    return fallback<T>(request, "endpoint returned 404");
  }
  if (!response.ok)
    throw new Error(errorMessage(await response.text(), response.status));
  // Concurrent public/admin reads must not mix a cloud response with a newly activated demo store.
  if (getApiMode() === "browser" && method === "GET")
    return localRequest<T>(request);
  if (getApiMode() !== "browser") {
    setMode(
      response.headers.get("X-Share-Light-Mode") === "local-dev"
        ? "dev"
        : "live",
    );
  }
  return response.json() as Promise<T>;
}

export async function retryLiveApi(): Promise<void> {
  const response = await fetch("/api/wishes?status=approved", {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(errorMessage(await response.text(), response.status));
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("wishes" in data) ||
    !Array.isArray(data.wishes) ||
    !("counts" in data)
  ) {
    throw new Error("The live endpoint did not return valid festival data.");
  }
  setMode(
    response.headers.get("X-Share-Light-Mode") === "local-dev" ? "dev" : "live",
  );
  window.dispatchEvent(new Event("share-light:update"));
}
