import { n as __toESM } from "../_runtime.mjs";
import { n as appTitle, t as appSubtitle } from "./app-config-AaiJ7Xjz.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as useAdminAuth } from "./use-admin-auth-OtQK6SEN.mjs";
import { i as useLanterns, r as lanternService } from "./lanterns-ydilub2n.mjs";
import { S as useNavigate, _ as Outlet, m as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Flame, c as Clock, d as Check, i as LogOut, l as CircleX, o as Download, r as RotateCcw, t as X, u as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as zipSync, t as strToU8 } from "../_libs/fflate.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-N0kJzTZc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var columnNames = [
	"A",
	"B",
	"C",
	"D"
];
var headers = [
	"Name",
	"Employee ID",
	"Office Location",
	"Wish"
];
function escapeXml(value) {
	return Array.from(value).filter((character) => {
		const codePoint = character.codePointAt(0);
		return codePoint === 9 || codePoint === 10 || codePoint === 13 || codePoint >= 32 && (codePoint < 55296 || codePoint > 57343);
	}).join("").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function createWorksheetXml(lanterns) {
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${[headers, ...lanterns.filter((lantern) => lantern.status === "approved").map((lantern) => [
		lantern.name,
		lantern.employeeId ?? "",
		lantern.officeLocation,
		lantern.message
	])].map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${columnNames[columnIndex]}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`;
}
function createApprovedLanternWorkbook(lanterns) {
	const files = {
		"[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
		"_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
		"xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Approved Wishes" sheetId="1" r:id="rId1"/></sheets></workbook>`,
		"xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
		"xl/worksheets/sheet1.xml": createWorksheetXml(lanterns)
	};
	return zipSync(Object.fromEntries(Object.entries(files).map(([path, contents]) => [path, strToU8(contents)])), { level: 6 });
}
function downloadApprovedLanterns(lanterns) {
	const workbook = createApprovedLanternWorkbook(lanterns);
	const blob = new Blob([workbook], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "share-the-light-approved-wishes.xlsx";
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function Admin() {
	const { session, loading: authLoading, signOut } = useAdminAuth();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isLoginRoute = pathname === "/admin/login";
	const { lanterns: all, error: loadError } = useLanterns();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const [officeFilter, setOfficeFilter] = (0, import_react.useState)("all");
	const [actionError, setActionError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!authLoading && !session && pathname === "/admin") navigate({
			to: "/admin/login",
			replace: true
		});
	}, [
		authLoading,
		navigate,
		pathname,
		session
	]);
	const stats = (0, import_react.useMemo)(() => ({
		total: all.length,
		approved: all.filter((l) => l.status === "approved").length,
		rejected: all.filter((l) => l.status === "rejected").length,
		pending: all.filter((l) => l.status === "pending").length
	}), [all]);
	const rows = [...all].reverse().filter((lantern) => filter === "all" || lantern.status === filter).filter((lantern) => officeFilter === "all" || lantern.officeLocation === officeFilter).slice(0, 200);
	const cards = [
		{
			label: "Total submissions",
			v: stats.total,
			icon: Flame
		},
		{
			label: "Approved",
			v: stats.approved,
			icon: CircleCheck
		},
		{
			label: "Rejected",
			v: stats.rejected,
			icon: CircleX
		},
		{
			label: "Pending",
			v: stats.pending,
			icon: Clock
		}
	];
	if (isLoginRoute) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	if (authLoading || !session) return null;
	const changeStatus = async (id, status) => {
		setActionError(null);
		try {
			await lanternService.setStatus(id, status);
		} catch (reason) {
			setActionError(reason instanceof Error ? reason.message : "Message status could not be updated.");
		}
	};
	const exportMessages = async () => {
		setActionError(null);
		try {
			downloadApprovedLanterns(await lanternService.exportAll());
		} catch (reason) {
			setActionError(reason instanceof Error ? reason.message : "Submissions could not be exported.");
		}
	};
	const resetSamples = async () => {
		if (!confirm("Reset all messages to the sample collection?")) return;
		setActionError(null);
		try {
			await lanternService.resetDemoData();
		} catch (reason) {
			setActionError(reason instanceof Error ? reason.message : "Sample messages could not be restored.");
		}
	};
	const logout = async () => {
		setActionError(null);
		try {
			await signOut();
			await navigate({
				to: "/admin/login",
				replace: true
			});
		} catch (reason) {
			setActionError(reason instanceof Error ? reason.message : "Logout failed.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-sky px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl font-bold text-foreground",
						children: [appTitle, " · Admin"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [appSubtitle, ". Only approved lanterns appear on the festival display."]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => void exportMessages(),
								className: "flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export Excel"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => void resetSamples(),
								className: "flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Reset sample data"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: logout,
								className: "flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Log out"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-gold",
					children: "Local prototype only. Replace this development API with company-managed authentication before deployment."
				}),
				actionError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					role: "alert",
					children: actionError
				}),
				loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					role: "alert",
					children: loadError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-2 gap-3 md:grid-cols-4",
					children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-5 w-5 text-gold" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-bold tabular-nums text-foreground",
								children: c.v.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-wider text-muted-foreground",
								children: c.label
							})
						]
					}, c.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex gap-2",
					children: [
						"pending",
						"approved",
						"rejected",
						"all"
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setFilter(f),
						className: `rounded-full px-4 py-1.5 text-sm capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`,
						children: f
					}, f))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
					children: ["Office location", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: officeFilter,
						onChange: (event) => setOfficeFilter(event.target.value),
						className: "rounded-full border border-border bg-background/70 px-4 py-2 text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All offices"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "HTY",
								children: "HTY"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "HmweBe",
								children: "HmweBe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "CDC",
								children: "CDC"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Other Regions",
								children: "Other Regions"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass mt-4 divide-y divide-border overflow-hidden rounded-2xl",
					children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-6 text-center text-muted-foreground",
						children: "No submissions here."
					}), rows.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-foreground",
								children: [
									"\"",
									l.message,
									"\""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									l.name || "Anonymous",
									" · ",
									l.officeLocation,
									" · ",
									new Date(l.createdAt).toLocaleString(),
									" ·",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: l.status === "approved" ? "text-success" : l.status === "rejected" ? "text-destructive" : "text-gold",
										children: l.status
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => void changeStatus(l.id, "approved"),
								disabled: l.status === "approved",
								"aria-label": "Approve",
								className: "flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-sm text-success hover:bg-success/25 disabled:opacity-30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Approve"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => void changeStatus(l.id, "rejected"),
								disabled: l.status === "rejected",
								"aria-label": "Reject",
								className: "flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/25 disabled:opacity-30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Reject"]
							})]
						})]
					}, l.id))]
				})
			]
		})
	});
}
//#endregion
export { Admin as component };
