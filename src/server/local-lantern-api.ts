import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";

type LanternStatus = "pending" | "approved" | "rejected";
type OfficeLocation = "HTY" | "HmweBe" | "CDC" | "Other Regions";

interface LanternRecord {
  id: string;
  name: string;
  employeeId?: string;
  message: string;
  officeLocation: OfficeLocation;
  status: LanternStatus;
  createdAt: string;
}

interface AdminSession {
  username: string;
  expiresAt: number;
}

const dataFile = resolve(process.cwd(), "src/lib/mock-lanterns.json");
const sessionCookie = "share_light_admin";
const sessionDurationMs = 8 * 60 * 60 * 1000;
const adminCredentials = {
  username: process.env["SHARE_LIGHT_ADMIN_USERNAME"] || "itadmin",
  password: process.env["SHARE_LIGHT_ADMIN_PASSWORD"] || "123456",
};
const locations = new Set<OfficeLocation>(["HTY", "HmweBe", "CDC", "Other Regions"]);
const statuses = new Set<LanternStatus>(["pending", "approved", "rejected"]);
const sessions = new Map<string, AdminSession>();
const idempotentSubmissions = new Map<string, LanternRecord>();

let storageQueue: Promise<void> = Promise.resolve();
let initialRecords: LanternRecord[] | undefined;
let maxWishLength = 500;

function withStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(operation);
  storageQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function normalizeLantern(value: unknown): LanternRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Lantern data contains an invalid record.");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record["id"] !== "string" ||
    typeof record["name"] !== "string" ||
    typeof record["message"] !== "string" ||
    typeof record["officeLocation"] !== "string" ||
    !locations.has(record["officeLocation"] as OfficeLocation) ||
    (record["employeeId"] !== undefined &&
      (typeof record["employeeId"] !== "string" ||
        !record["employeeId"].trim() ||
        record["employeeId"].length > 64)) ||
    typeof record["status"] !== "string" ||
    !statuses.has(record["status"] as LanternStatus) ||
    typeof record["createdAt"] !== "string" ||
    Number.isNaN(Date.parse(record["createdAt"]))
  ) {
    throw new Error("Lantern data contains an invalid record.");
  }
  const normalized: LanternRecord = {
    id: record["id"],
    name: record["name"],
    message: record["message"],
    officeLocation: record["officeLocation"] as OfficeLocation,
    status: record["status"] as LanternStatus,
    createdAt: record["createdAt"],
  };
  if (typeof record["employeeId"] === "string") {
    normalized.employeeId = record["employeeId"];
  }
  return normalized;
}

async function readRecords(): Promise<LanternRecord[]> {
  const contents = await readFile(dataFile, "utf8");
  const parsed: unknown = JSON.parse(contents);
  if (!Array.isArray(parsed)) {
    throw new Error("Lantern data must be a JSON array.");
  }
  const records = parsed.map(normalizeLantern);
  if (!initialRecords) initialRecords = records.map((record) => ({ ...record }));
  return records;
}

async function writeRecords(records: LanternRecord[]): Promise<void> {
  const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryFile, `${JSON.stringify(records, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryFile, dataFile);
  } catch (error) {
    try {
      await unlink(temporaryFile);
    } catch (cleanupError) {
      console.error("Could not remove temporary lantern data file.", cleanupError);
    }
    throw error;
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function sendError(response: ServerResponse, status: number, message: string): void {
  sendJson(response, status, { error: message });
}

async function readBody(request: IncomingMessage, maxBytes = 16_384): Promise<unknown> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += data.length;
    if (length > maxBytes) throw new Error("Request body is too large.");
    chunks.push(data);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new Error("Request body must contain valid JSON.");
  }
}

function getCookie(request: IncomingMessage, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function getSession(request: IncomingMessage): AdminSession | undefined {
  const token = getCookie(request, sessionCookie);
  if (!token) return undefined;
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return undefined;
  }
  return session;
}

function requireSession(request: IncomingMessage, response: ServerResponse): AdminSession | null {
  const session = getSession(request);
  if (!session) sendError(response, 401, "Please sign in to manage festival wishes.");
  return session ?? null;
}

function matchesCredential(candidate: string, expected: string): boolean {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return (
    candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function handleApiError(error: unknown, response: ServerResponse): void {
  if (response.headersSent || response.writableEnded) return;
  if (error instanceof SyntaxError) {
    sendError(response, 400, "Lantern JSON is malformed; no changes were saved.");
    return;
  }
  const message = error instanceof Error ? error.message : "The lantern API request failed.";
  if (message === "Request body is too large.") {
    sendError(response, 413, message);
    return;
  }
  if (message === "Request body must contain valid JSON.") {
    sendError(response, 400, message);
    return;
  }
  console.error("Local lantern API error:", error);
  sendError(response, 500, "The lantern data could not be read or saved.");
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url || "/", "http://localhost");
  const { pathname } = url;
  const method = request.method || "GET";

  if (pathname === "/api/admin/session" && method === "GET") {
    const session = getSession(request);
    sendJson(response, 200, { username: session?.username ?? null });
    return;
  }

  if (pathname === "/api/admin/login" && method === "POST") {
    const body = await readBody(request);
    if (
      !isObject(body) ||
      typeof body["username"] !== "string" ||
      typeof body["password"] !== "string"
    ) {
      sendError(response, 400, "Enter both a username and password.");
      return;
    }
    const username = body["username"].trim();
    const password = body["password"];
    if (
      !matchesCredential(username, adminCredentials.username) ||
      !matchesCredential(password, adminCredentials.password)
    ) {
      sendError(response, 401, "Incorrect username or password.");
      return;
    }
    const token = randomBytes(32).toString("base64url");
    const session = { username, expiresAt: Date.now() + sessionDurationMs };
    sessions.set(token, session);
    response.setHeader(
      "Set-Cookie",
      `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${sessionDurationMs / 1000}`,
    );
    sendJson(response, 200, { username });
    return;
  }

  if (pathname === "/api/admin/logout" && method === "POST") {
    const token = getCookie(request, sessionCookie);
    if (token) sessions.delete(token);
    response.setHeader(
      "Set-Cookie",
      `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0`,
    );
    response.statusCode = 204;
    response.end();
    return;
  }

  if (pathname === "/api/lanterns" && method === "GET") {
    const records = await withStorageLock(readRecords);
    sendJson(
      response,
      200,
      records.map((record) => {
        const publicRecord = { ...record };
        delete publicRecord.employeeId;
        return publicRecord;
      }),
    );
    return;
  }

  if (pathname === "/api/lanterns/migrate" && method === "POST") {
    const body = await readBody(request, 1_048_576);
    const legacyValues = isObject(body) ? body["records"] : undefined;
    if (!Array.isArray(legacyValues) || legacyValues.length > 500) {
      sendError(response, 400, "Legacy lantern data must be an array of up to 500 records.");
      return;
    }
    const imported = await withStorageLock(async () => {
      const records = await readRecords();
      const ids = new Set(records.map((record) => record.id));
      const additions: LanternRecord[] = [];
      for (const value of legacyValues) {
        if (!isObject(value)) {
          sendError(response, 400, "Legacy lantern data contains an invalid record.");
          return null;
        }
        const oldId = value["id"];
        const name = typeof value["name"] === "string" ? value["name"] : value["nickname"];
        const message = typeof value["message"] === "string" ? value["message"] : value["wish"];
        const createdAt =
          typeof value["createdAt"] === "number"
            ? new Date(value["createdAt"]).toISOString()
            : value["createdAt"];
        const oldLocation = value["officeLocation"] ?? value["location"];
        if (
          typeof oldId !== "string" ||
          !oldId ||
          oldId.length > 128 ||
          typeof name !== "string" ||
          typeof message !== "string" ||
          !message.trim() ||
          message.length > maxWishLength ||
          typeof createdAt !== "string" ||
          Number.isNaN(Date.parse(createdAt))
        ) {
          sendError(response, 400, "Legacy lantern data contains an invalid record.");
          return null;
        }
        const id = `legacy-${oldId}`;
        if (ids.has(id)) continue;
        if (
          oldId.startsWith("seed-") &&
          records.some((record) => record.name === name && record.message === message)
        ) {
          ids.add(id);
          continue;
        }
        const officeLocation: OfficeLocation =
          oldLocation === "Hmawbi"
            ? "HmweBe"
            : oldLocation === "HTY" ||
                oldLocation === "HmweBe" ||
                oldLocation === "CDC" ||
                oldLocation === "Other Regions"
              ? oldLocation
              : "Other Regions";
        additions.push({
          id,
          name: name.trim().slice(0, 24),
          ...(typeof value["employeeId"] === "string" && value["employeeId"].trim()
            ? { employeeId: value["employeeId"].trim().slice(0, 64) }
            : {}),
          message: message.trim(),
          officeLocation,
          status: "pending",
          createdAt,
        });
        ids.add(id);
      }
      if (additions.length) await writeRecords([...records, ...additions]);
      return additions.length;
    });
    if (imported === null) return;
    sendJson(response, 200, { imported });
    return;
  }

  if (pathname === "/api/lanterns" && method === "POST") {
    const body = await readBody(request);
    if (
      !isObject(body) ||
      typeof body["name"] !== "string" ||
      !body["name"].trim() ||
      body["name"].trim().length > 24 ||
      typeof body["employeeId"] !== "string" ||
      !body["employeeId"].trim() ||
      body["employeeId"].trim().length > 64 ||
      typeof body["message"] !== "string" ||
      typeof body["officeLocation"] !== "string" ||
      !locations.has(body["officeLocation"] as OfficeLocation)
    ) {
      sendError(
        response,
        400,
        "A name, employee ID, wish, and valid office location are required.",
      );
      return;
    }
    const name = body["name"].trim().slice(0, 24);
    const message = body["message"].trim();
    if (!message || message.length > maxWishLength) {
      sendError(response, 400, `Write a wish between 1 and ${maxWishLength} characters.`);
      return;
    }
    const idempotencyKey = request.headers["idempotency-key"];
    if (
      typeof idempotencyKey !== "string" ||
      idempotencyKey.length < 8 ||
      idempotencyKey.length > 128
    ) {
      sendError(response, 400, "A valid submission identifier is required.");
      return;
    }
    const record = await withStorageLock(async () => {
      const previous = idempotentSubmissions.get(idempotencyKey);
      if (previous) return previous;
      const records = await readRecords();
      const created: LanternRecord = {
        id: randomUUID(),
        name,
        employeeId: (body["employeeId"] as string).trim(),
        message,
        officeLocation: body["officeLocation"] as OfficeLocation,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await writeRecords([...records, created]);
      idempotentSubmissions.set(idempotencyKey, created);
      return created;
    });
    sendJson(response, 201, record);
    return;
  }

  if (pathname === "/api/lanterns/export" && method === "GET") {
    if (!requireSession(request, response)) return;
    const records = await withStorageLock(readRecords);
    sendJson(response, 200, records);
    return;
  }

  if (pathname === "/api/lanterns/reset" && method === "POST") {
    if (!requireSession(request, response)) return;
    await withStorageLock(async () => {
      const resetRecords = (initialRecords ?? (await readRecords())).map((record) => ({
        ...record,
      }));
      await writeRecords(resetRecords);
      initialRecords = resetRecords.map((record) => ({ ...record }));
      idempotentSubmissions.clear();
    });
    response.statusCode = 204;
    response.end();
    return;
  }

  const statusMatch = pathname.match(/^\/api\/lanterns\/([^/]+)\/status$/);
  if (statusMatch && method === "PATCH") {
    if (!requireSession(request, response)) return;
    const body = await readBody(request);
    if (
      !isObject(body) ||
      typeof body["status"] !== "string" ||
      !statuses.has(body["status"] as LanternStatus)
    ) {
      sendError(response, 400, "A valid message status is required.");
      return;
    }
    const id = decodeURIComponent(statusMatch[1]!);
    const updated = await withStorageLock(async () => {
      const records = await readRecords();
      const existing = records.find((record) => record.id === id);
      if (!existing) return null;
      const record = { ...existing, status: body["status"] as LanternStatus };
      await writeRecords(records.map((item) => (item.id === id ? record : item)));
      return record;
    });
    if (!updated) {
      sendError(response, 404, "Festival message was not found.");
      return;
    }
    sendJson(response, 200, updated);
    return;
  }

  sendError(response, 404, "Local API endpoint not found.");
}

export function localLanternApi(): Plugin {
  return {
    name: "share-the-light-local-lantern-api",
    apply: "serve",
    config(_config, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");
      const configuredLength = Number(env["VITE_MAX_WISH_LENGTH"]);
      if (Number.isSafeInteger(configuredLength) && configuredLength > 0) {
        maxWishLength = configuredLength;
      }
      adminCredentials.username =
        process.env["SHARE_LIGHT_ADMIN_USERNAME"] || env["SHARE_LIGHT_ADMIN_USERNAME"] || "itadmin";
      adminCredentials.password =
        process.env["SHARE_LIGHT_ADMIN_PASSWORD"] || env["SHARE_LIGHT_ADMIN_PASSWORD"] || "123456";
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/api/")) {
          next();
          return;
        }
        void handleRequest(request, response).catch((error: unknown) =>
          handleApiError(error, response),
        );
      });
    },
  };
}
