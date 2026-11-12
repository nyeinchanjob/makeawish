import { n as __toESM } from "../_runtime.mjs";
import { n as appTitle, t as appSubtitle } from "./app-config-AaiJ7Xjz.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as useLanterns } from "./lanterns-ydilub2n.mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as Cog } from "../_libs/lucide-react.mjs";
import { n as LanternSky, r as Stars, t as LanternShape } from "./Sky-DM4dxHgx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display-PoC_WKWv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function hashString(value) {
	let hash = 2166136261;
	for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
	return hash >>> 0;
}
function getTargetCount(width, height) {
	if (height < 560) return 1;
	if (width < 700) return 2;
	if (width < 1e3) return 3;
	if (width < 1400) return 4;
	if (width < 1800) return 5;
	return 6;
}
function getWishSize(message) {
	if (message.message.length > 130) return "small";
	const size = hashString(message.id) % 3;
	return size === 0 ? "small" : size === 1 ? "medium" : "large";
}
function FloatingWishes({ messages }) {
	const [targetCount, setTargetCount] = (0, import_react.useState)(() => typeof window === "undefined" ? 4 : getTargetCount(window.innerWidth, window.innerHeight));
	const [slots, setSlots] = (0, import_react.useState)([]);
	const nextMessageRef = (0, import_react.useRef)(0);
	const swapTimersRef = (0, import_react.useRef)([]);
	const slotsRef = (0, import_react.useRef)([]);
	const positionsByMessageRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const columns = targetCount <= 2 ? 2 : 3;
	const layout = (0, import_react.useMemo)(() => {
		const result = /* @__PURE__ */ new Map();
		slots.forEach((slot) => {
			result.set(slot.position, {
				column: slot.position % columns,
				row: Math.floor(slot.position / columns)
			});
		});
		return result;
	}, [columns, slots]);
	(0, import_react.useEffect)(() => {
		slotsRef.current = slots;
	}, [slots]);
	(0, import_react.useEffect)(() => {
		const resize = () => setTargetCount(getTargetCount(window.innerWidth, window.innerHeight));
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!messages.length) {
			setSlots([]);
			return;
		}
		const count = Math.min(targetCount, messages.length);
		const createSlot = (message, occupied) => {
			const capacity = columns * 2;
			const start = hashString(message.id) % capacity;
			const occupiedRows = Array.from({ length: 2 }, (_, row) => [...occupied].filter((position) => Math.floor(position / columns) === row).length);
			const available = Array.from({ length: capacity }, (_, position) => position).filter((position) => !occupied.has(position)).sort((left, right) => {
				const rowDifference = occupiedRows[Math.floor(left / columns)] - occupiedRows[Math.floor(right / columns)];
				if (rowDifference) return rowDifference;
				return (left - start + capacity) % capacity - (right - start + capacity) % capacity;
			});
			const remembered = positionsByMessageRef.current.get(message.id);
			const position = remembered !== void 0 && !occupied.has(remembered) ? remembered : available[0] ?? start;
			positionsByMessageRef.current.set(message.id, position);
			occupied.add(position);
			return {
				message,
				position,
				size: getWishSize(message),
				phase: "entering"
			};
		};
		nextMessageRef.current = Math.max(nextMessageRef.current, count);
		setSlots((current) => {
			if (!current.length) {
				const occupied = /* @__PURE__ */ new Set();
				return messages.slice(0, count).map((message) => createSlot(message, occupied));
			}
			const currentIds = new Set(messages.map((message) => message.id));
			const retained = current.filter((slot) => currentIds.has(slot.message.id)).slice(0, count).map((slot) => ({
				...slot,
				phase: "visible"
			}));
			const visibleIds = new Set(retained.map((slot) => slot.message.id));
			const occupied = new Set(retained.map((slot) => slot.position));
			for (const message of messages) {
				if (retained.length >= count) break;
				if (visibleIds.has(message.id)) continue;
				retained.push(createSlot(message, occupied));
				visibleIds.add(message.id);
			}
			return retained;
		});
		if (messages.length <= count) return;
		let nextPosition = 0;
		if (count < 1) return;
		const timer = window.setInterval(() => {
			const current = slotsRef.current;
			if (!current.length) return;
			const index = nextPosition++ % current.length;
			let candidate = messages[nextMessageRef.current++ % messages.length];
			while (current.some((slot) => slot.message.id === candidate.id)) candidate = messages[nextMessageRef.current++ % messages.length];
			const position = current[index].position;
			const exiting = current.map((slot, slotIndex) => slotIndex === index ? {
				...slot,
				phase: "exiting"
			} : slot);
			slotsRef.current = exiting;
			setSlots(exiting);
			const phaseTimer = window.setTimeout(() => {
				const occupiedPositions = new Set(slotsRef.current.filter((slot) => slot.position !== position).map((slot) => slot.position));
				const nextSlot = createSlot(candidate, occupiedPositions);
				const entering = slotsRef.current.map((slot) => slot.position === position ? {
					...slot,
					message: nextSlot.message,
					position: nextSlot.position,
					size: nextSlot.size,
					phase: "entering"
				} : slot);
				slotsRef.current = entering;
				setSlots(entering);
				const visibleTimer = window.setTimeout(() => {
					const visible = slotsRef.current.map((slot) => slot.position === nextSlot.position ? {
						...slot,
						phase: "visible"
					} : slot);
					slotsRef.current = visible;
					setSlots(visible);
				}, 1400);
				swapTimersRef.current.push(visibleTimer);
			}, 700);
			swapTimersRef.current.push(phaseTimer);
		}, 7500);
		return () => {
			window.clearInterval(timer);
			swapTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
			swapTimersRef.current = [];
		};
	}, [
		columns,
		messages,
		targetCount
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "wish-field",
		style: {
			"--wish-columns": columns,
			"--wish-rows": 2
		},
		"aria-live": "polite",
		children: slots.map((slot, index) => {
			const position = layout.get(slot.position);
			if (!position) return null;
			const isLong = slot.message.message.length > 130;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: `floating-wish floating-wish-${slot.size}${isLong ? " floating-wish-long" : ""} floating-wish-${slot.phase}`,
				style: {
					gridColumn: String(position.column + 1),
					gridRow: String(position.row + 1),
					animationDelay: `${index % 4 * .25}s`
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "floating-wish-message",
					children: slot.message.message
				}), slot.message.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "floating-wish-author",
					children: ["— ", slot.message.name]
				})]
			}, `${slot.position}-${slot.message.id}`);
		})
	});
}
var MILESTONES = [
	1e3,
	3e3,
	5e3
];
function Display() {
	const { lanterns: all, error: loadError } = useLanterns();
	const approved = (0, import_react.useMemo)(() => all.filter((lantern) => lantern.status === "approved").sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)), [all]);
	const count = approved.length;
	const [celebrate, setCelebrate] = (0, import_react.useState)(null);
	const [qrAvailable, setQrAvailable] = (0, import_react.useState)(false);
	const [tcccFontAvailable, setTcccFontAvailable] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		fetch("/assets/qr.png", { method: "HEAD" }).then((response) => {
			if (active) setQrAvailable(response.ok);
		}).catch(() => {
			if (active) setQrAvailable(false);
		});
		Promise.all([fetch("/assets/fonts/TCCC-UnityText-Regular.woff2", { method: "HEAD" }), fetch("/assets/fonts/TCCC-UnityText-Bold.woff2", { method: "HEAD" })]).then((responses) => {
			if (active) setTcccFontAvailable(responses.every((response) => response.ok));
		}).catch(() => {
			if (active) setTcccFontAvailable(false);
		});
		return () => {
			active = false;
		};
	}, []);
	const prev = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (prev.current !== null) {
			const hit = MILESTONES.find((m) => prev.current < m && count >= m);
			if (hit) {
				setCelebrate(hit);
				setTimeout(() => setCelebrate(null), 8e3);
			}
		}
		prev.current = count;
	}, [count]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `display-main bg-sky${tcccFontAvailable ? " has-tccc-unity-font" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "display-decor",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { count: 48 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternSky, {
					lanterns: approved,
					max: 14,
					scale: .72,
					interactive: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin",
				"aria-label": "Open festival display settings",
				title: "Display settings",
				className: "display-settings rounded-full border border-gold/40 bg-black/30 p-3 text-gold transition hover:bg-gold/15 focus:outline-none focus:ring-2 focus:ring-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, {
					className: "h-6 w-6",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "display-header",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display-title font-display text-foreground text-glow",
						children: appTitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display-subtitle font-serif text-gold",
						children: appSubtitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display-tagline font-serif text-foreground/80",
						children: "EVERY LIGHT TELLS A STORY"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "display-stage",
				"aria-live": "polite",
				children: [loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display-empty font-serif text-destructive",
					role: "alert",
					children: "Festival wishes could not be loaded. Please contact the event team."
				}), approved.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingWishes, { messages: approved }) : !loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display-empty font-serif text-gold",
					children: "Your festival wishes will shine here."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "display-footer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "display-counter",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "display-count font-display font-bold text-gold text-glow tabular-nums",
							children: count.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternShape, {
							className: "display-counter-lantern",
							size: 30,
							hue: 12
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "display-count-label text-foreground/80",
							children: "lanterns illuminated"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "display-qr-section",
					children: [qrAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "Go to the festival wish submission page",
						title: "Share your light",
						className: "cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							className: "display-qr-image",
							src: "/assets/qr.png",
							alt: "Click to share your light",
							onError: () => setQrAvailable(false)
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "Go to the festival wish submission page",
						title: "Share your light",
						className: "cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "display-qr-placeholder",
							role: "img",
							"aria-label": "QR code asset placeholder",
							children: [
								"QR CODE ASSET",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"COMING SOON",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Place the event QR image at public/assets/qr.png" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display-qr-instruction",
						children: "SCAN TO SHARE YOUR LIGHT"
					})]
				})]
			}),
			celebrate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Celebration, { value: celebrate })
		]
	});
}
function Celebration({ value }) {
	const sparks = (0, import_react.useMemo)(() => Array.from({ length: 6 }).flatMap((_, b) => Array.from({ length: 24 }, (_, i) => {
		const a = i / 24 * Math.PI * 2;
		const r = 120 + Math.random() * 120;
		return {
			k: `${b}-${i}`,
			x: 15 + b * 14,
			y: 20 + b % 2 * 25,
			dx: Math.cos(a) * r,
			dy: Math.sin(a) * r,
			d: b * .5
		};
	})), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-30 animate-in fade-in",
		children: [sparks.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "firework",
			style: {
				left: `${s.x}%`,
				top: `${s.y}%`,
				["--dx"]: `${s.dx}px`,
				["--dy"]: `${s.dy}px`,
				animationDelay: `${s.d}s`
			}
		}, s.k)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-[10vw] font-bold text-gold text-glow",
				children: value.toLocaleString()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-[2.5vw] tracking-widest text-foreground",
				children: "LANTERNS LIGHT UP THASAUNG TAING!"
			})]
		})]
	});
}
//#endregion
export { Display as component };
