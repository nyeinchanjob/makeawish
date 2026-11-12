import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Sky-DM4dxHgx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rand(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
	return () => {
		h = Math.imul(h ^ h >>> 15, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		return ((h ^= h >>> 16) >>> 0) / 4294967296;
	};
}
function LanternShape({ size = 28, hue = 25, className = "" }) {
	const gradientId = `lantern-${(0, import_react.useId)().replace(/:/g, "")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `lantern-wrap ${className}`,
		style: {
			width: size,
			height: size * 1.5
		},
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "lantern",
			viewBox: "0 0 60 90",
			width: size,
			height: size * 1.5,
			role: "presentation",
			style: { filter: `hue-rotate(${hue}deg)` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: gradientId,
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "0.8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0",
							stopColor: "#9f1625"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0.4",
							stopColor: "#f04a23"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0.72",
							stopColor: "#ff9d27"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "#ffd879"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
					id: `${gradientId}-glow`,
					cx: "50%",
					cy: "68%",
					r: "52%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0",
							stopColor: "#fff4b1",
							stopOpacity: ".95"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: ".45",
							stopColor: "#ffb332",
							stopOpacity: ".55"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "#ff5c21",
							stopOpacity: "0"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M30 2v8",
					stroke: "#f8d889",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M13 11 Q30 5 47 11 L51 17 Q30 23 9 17 Z",
					fill: "#9f1625",
					stroke: "#ffd879",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M9 17 Q7 40 14 56 Q19 68 23 72 L37 72 Q41 68 46 56 Q53 40 51 17 Q30 23 9 17 Z",
					fill: `url(#${gradientId})`,
					stroke: "#ffd879",
					strokeWidth: "1.3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M9 17 Q30 23 51 17 Q53 40 46 56 Q41 68 37 72 L23 72 Q19 68 14 56 Q7 40 9 17 Z",
					fill: `url(#${gradientId}-glow)`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 20 Q15 48 25 68 M44 20 Q45 48 35 68",
					fill: "none",
					stroke: "#ffe29a",
					strokeOpacity: ".55",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M22 73 Q30 77 38 73 L36 78 Q30 81 24 78 Z",
					fill: "#8f1b20",
					stroke: "#f6c75d",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M26 84 Q25 79 30 75 Q35 80 34 84 Q32 88 30 88 Q27 87 26 84 Z",
					fill: "#ffb62e",
					className: "lantern-flame"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M29 85 Q29 82 30 80 Q32 83 31 85 Z",
					fill: "#fff3b0"
				})
			]
		})
	});
}
function Stars({ count = 80 }) {
	const stars = (0, import_react.useMemo)(() => {
		const r = rand("stars" + count);
		return Array.from({ length: count }, (_, i) => ({
			i,
			x: r() * 100,
			y: r() * 85,
			s: r() * 2 + .5,
			d: r() * 5
		}));
	}, [count]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0",
		children: stars.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "star",
			style: {
				left: `${s.x}%`,
				top: `${s.y}%`,
				width: s.s,
				height: s.s,
				animationDelay: `${s.d}s`
			}
		}, s.i))
	});
}
function LanternSky({ lanterns, max = 120, scale = 1, interactive = true, highlightId }) {
	const [open, setOpen] = (0, import_react.useState)(null);
	const shown = lanterns.slice(-max);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `absolute inset-0 overflow-hidden ${interactive ? "" : "pointer-events-none"}`,
		children: [shown.map((l) => {
			const r = rand(l.id);
			const size = (16 + r() * 26) * scale;
			const dur = 32 + r() * 30;
			const delay = -r() * dur;
			const x = 4 + r() * 88;
			const isNew = l.id === highlightId;
			const lantern = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sway block",
				style: { animationDuration: `${4 + r() * 4}s` },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternShape, {
					size: isNew ? size * 1.4 : size,
					hue: Math.round(r() * 35)
				})
			});
			return interactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setOpen(l),
				"aria-label": `Lantern: ${l.message}`,
				className: `absolute bottom-0 ${isNew ? "float-new" : "float-up"} cursor-pointer`,
				style: {
					left: `${x}%`,
					animationDuration: isNew ? "9s" : `${dur}s`,
					animationDelay: isNew ? "0s" : `${delay}s`
				},
				children: lantern
			}, l.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: `absolute bottom-0 ${isNew ? "float-new" : "float-up"}`,
				style: {
					left: `${x}%`,
					animationDuration: isNew ? "9s" : `${dur}s`,
					animationDelay: isNew ? "0s" : `${delay}s`
				},
				children: lantern
			}, l.id);
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-4 top-1/3 z-20 mx-auto max-w-xs animate-in fade-in zoom-in-95",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wish-card relative p-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen(null),
						className: "absolute right-2 top-2 text-muted-foreground hover:text-foreground",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg leading-snug text-foreground",
						children: [
							"\"",
							open.message,
							"\""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-gold",
						children: ["— ", open.name || "A friend of Ta Saung Tine"]
					})
				]
			})
		})]
	});
}
//#endregion
export { LanternSky as n, Stars as r, LanternShape as t };
