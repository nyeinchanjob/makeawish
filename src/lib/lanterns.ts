import { useCallback, useEffect, useState } from "react";
import { maxWishLength } from "./app-config";

export type LanternStatus = "pending" | "approved" | "rejected";
export const OFFICE_LOCATIONS = ["HTY", "HmweBe", "CDC", "Other Regions"] as const;
export type LanternLocation = (typeof OFFICE_LOCATIONS)[number];

export interface Lantern {
  id: string;
  name: string;
  employeeId?: string;
  message: string;
  officeLocation: LanternLocation;
  status: LanternStatus;
  createdAt: string;
}

export type MessageRecord = Lantern;

export interface CreateLanternInput {
  name: string;
  employeeId: string;
  message: string;
  officeLocation: LanternLocation;
}

export interface LanternRepository {
  list(): Promise<Lantern[]>;
  create(input: CreateLanternInput): Promise<Lantern>;
  updateStatus(id: string, status: LanternStatus): Promise<Lantern>;
  reset(): Promise<void>;
  exportAll(): Promise<Lantern[]>;
}

export const MAX_WISH = maxWishLength;
export const MAX_NICK = 24;
export const MAX_EMPLOYEE_ID = 64;
let legacyMigrationComplete = false;
const CHANGE_EVENT = "lut:update";
const LEGACY_STORAGE_KEY = "lut.lanterns.v1";
const LEGACY_MIGRATION_KEY = "lut.lanterns.api-migrated";

interface ApiError {
  error?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...init, headers, credentials: "same-origin" });

  if (response.status === 204) return undefined as T;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The lantern API returned an invalid response.");
  }
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as ApiError).error === "string"
        ? (body as ApiError).error!
        : `The request failed (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

const apiRepository: LanternRepository = {
  async list() {
    await migrateLegacyBrowserRecords();
    return request<Lantern[]>("/api/lanterns");
  },
  async create(input) {
    return request<Lantern>("/api/lanterns", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(input),
    });
  },
  async updateStatus(id, status) {
    return request<Lantern>(`/api/lanterns/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  async reset() {
    await request<void>("/api/lanterns/reset", { method: "POST", body: "{}" });
  },
  async exportAll() {
    return request<Lantern[]>("/api/lanterns/export");
  },
};

async function migrateLegacyBrowserRecords(): Promise<void> {
  if (legacyMigrationComplete || typeof window === "undefined") return;
  if (window.localStorage.getItem(LEGACY_MIGRATION_KEY) === "true") {
    legacyMigrationComplete = true;
    return;
  }
  const saved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved === null) {
    legacyMigrationComplete = true;
    return;
  }

  let records: unknown;
  try {
    records = JSON.parse(saved) as unknown;
  } catch {
    throw new Error(
      "Previous browser-stored submissions contain invalid JSON and were not changed.",
    );
  }
  if (!Array.isArray(records)) {
    throw new Error("Previous browser-stored submissions are not a record list.");
  }
  await request<{ imported: number }>("/api/lanterns/migrate", {
    method: "POST",
    body: JSON.stringify({ records }),
  });
  try {
    window.localStorage.setItem(LEGACY_MIGRATION_KEY, "true");
  } catch (error) {
    console.error(
      "Could not save the legacy-import marker; the server will deduplicate retries.",
      error,
    );
  }
  legacyMigrationComplete = true;
}

function notifyChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const lanternService = {
  async getAll() {
    return apiRepository.list();
  },
  async submit(input: CreateLanternInput) {
    const name = input.name.trim();
    const employeeId = input.employeeId.trim();
    if (!name) throw new Error("Please enter your name.");
    if (name.length > MAX_NICK) throw new Error(`Name must be ${MAX_NICK} characters or fewer.`);
    if (!employeeId) throw new Error("Please enter your employee ID.");
    if (employeeId.length > MAX_EMPLOYEE_ID) {
      throw new Error(`Employee ID must be ${MAX_EMPLOYEE_ID} characters or fewer.`);
    }
    const error = validateWish(input.message);
    if (error) throw new Error(error);
    const record = await apiRepository.create({
      ...input,
      name,
      employeeId,
      message: input.message.trim(),
    });
    notifyChange();
    return record;
  },
  async setStatus(id: string, status: LanternStatus) {
    const updated = await apiRepository.updateStatus(id, status);
    notifyChange();
    return updated;
  },
  async resetDemoData() {
    await apiRepository.reset();
    notifyChange();
  },
  async exportAll() {
    return apiRepository.exportAll();
  },
};

export function validateWish(wish: string): string | null {
  const trimmed = wish.trim();
  if (!trimmed) return "Please write a wish for Taunggyi.";
  if (trimmed.length > MAX_WISH) return `Keep it under ${MAX_WISH} characters.`;
  return null;
}

export function useLanterns() {
  const [records, setRecords] = useState<Lantern[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await lanternService.getAll();
      setRecords((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      setError(null);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Festival messages could not be loaded.";
      setError(message);
      console.error("Unable to load festival messages.", reason);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onChange = () => void refresh();
    void refresh();
    window.addEventListener(CHANGE_EVENT, onChange);
    const timer = window.setInterval(onChange, 3000);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return { lanterns: records, error, loading };
}
