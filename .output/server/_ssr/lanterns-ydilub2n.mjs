import { n as __toESM } from "../_runtime.mjs";
import { r as maxWishLength } from "./app-config-AaiJ7Xjz.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lanterns-ydilub2n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var OFFICE_LOCATIONS = [
	"HTY",
	"HmweBe",
	"CDC",
	"Other Regions"
];
var MAX_WISH = maxWishLength;
var legacyMigrationComplete = false;
var CHANGE_EVENT = "lut:update";
var LEGACY_STORAGE_KEY = "lut.lanterns.v1";
var LEGACY_MIGRATION_KEY = "lut.lanterns.api-migrated";
async function request(path, init = {}) {
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/json");
	if (init.body !== void 0) headers.set("Content-Type", "application/json");
	const response = await fetch(path, {
		...init,
		headers,
		credentials: "same-origin"
	});
	if (response.status === 204) return void 0;
	let body;
	try {
		body = await response.json();
	} catch {
		throw new Error("The lantern API returned an invalid response.");
	}
	if (!response.ok) {
		const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : `The request failed (${response.status}).`;
		throw new Error(message);
	}
	return body;
}
var apiRepository = {
	async list() {
		await migrateLegacyBrowserRecords();
		return request("/api/lanterns");
	},
	async create(input) {
		return request("/api/lanterns", {
			method: "POST",
			headers: { "Idempotency-Key": crypto.randomUUID() },
			body: JSON.stringify(input)
		});
	},
	async updateStatus(id, status) {
		return request(`/api/lanterns/${encodeURIComponent(id)}/status`, {
			method: "PATCH",
			body: JSON.stringify({ status })
		});
	},
	async reset() {
		await request("/api/lanterns/reset", {
			method: "POST",
			body: "{}"
		});
	},
	async exportAll() {
		return request("/api/lanterns/export");
	}
};
async function migrateLegacyBrowserRecords() {
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
	let records;
	try {
		records = JSON.parse(saved);
	} catch {
		throw new Error("Previous browser-stored submissions contain invalid JSON and were not changed.");
	}
	if (!Array.isArray(records)) throw new Error("Previous browser-stored submissions are not a record list.");
	await request("/api/lanterns/migrate", {
		method: "POST",
		body: JSON.stringify({ records })
	});
	try {
		window.localStorage.setItem(LEGACY_MIGRATION_KEY, "true");
	} catch (error) {
		console.error("Could not save the legacy-import marker; the server will deduplicate retries.", error);
	}
	legacyMigrationComplete = true;
}
function notifyChange() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}
var lanternService = {
	async getAll() {
		return apiRepository.list();
	},
	async submit(input) {
		const name = input.name.trim();
		const employeeId = input.employeeId.trim();
		if (!name) throw new Error("Please enter your name.");
		if (name.length > 24) throw new Error(`Name must be 24 characters or fewer.`);
		if (!employeeId) throw new Error("Please enter your employee ID.");
		if (employeeId.length > 64) throw new Error(`Employee ID must be 64 characters or fewer.`);
		const error = validateWish(input.message);
		if (error) throw new Error(error);
		const record = await apiRepository.create({
			...input,
			name,
			employeeId,
			message: input.message.trim()
		});
		notifyChange();
		return record;
	},
	async setStatus(id, status) {
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
	}
};
function validateWish(wish) {
	const trimmed = wish.trim();
	if (!trimmed) return "Please write a wish for Taunggyi.";
	if (trimmed.length > MAX_WISH) return `Keep it under ${MAX_WISH} characters.`;
	return null;
}
function useLanterns() {
	const [records, setRecords] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const refresh = (0, import_react.useCallback)(async () => {
		try {
			const next = await lanternService.getAll();
			setRecords((current) => JSON.stringify(current) === JSON.stringify(next) ? current : next);
			setError(null);
		} catch (reason) {
			const message = reason instanceof Error ? reason.message : "Festival messages could not be loaded.";
			setError(message);
			console.error("Unable to load festival messages.", reason);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const onChange = () => void refresh();
		refresh();
		window.addEventListener(CHANGE_EVENT, onChange);
		const timer = window.setInterval(onChange, 3e3);
		return () => {
			window.removeEventListener(CHANGE_EVENT, onChange);
			window.clearInterval(timer);
		};
	}, [refresh]);
	return {
		lanterns: records,
		error,
		loading
	};
}
//#endregion
export { validateWish as a, useLanterns as i, OFFICE_LOCATIONS as n, lanternService as r, MAX_WISH as t };
