import { n as __toESM } from "../_runtime.mjs";
import { n as appTitle } from "./app-config-AaiJ7Xjz.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as validateWish, i as useLanterns, n as OFFICE_LOCATIONS, r as lanternService, t as MAX_WISH } from "./lanterns-ydilub2n.mjs";
import { d as require_react_dom, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Sparkles, u as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as LanternSky, r as Stars, t as LanternShape } from "./Sky-DM4dxHgx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dz2-qtg1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function VisitorWishForm({ onSubmit, onSuccess }) {
	const [name, setName] = (0, import_react.useState)("");
	const [employeeId, setEmployeeId] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [launchOrigin, setLaunchOrigin] = (0, import_react.useState)(null);
	const submittingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!launchOrigin) return;
		const timer = window.setTimeout(() => setLaunchOrigin(null), 2600);
		return () => window.clearTimeout(timer);
	}, [launchOrigin]);
	const submit = async (event) => {
		event.preventDefault();
		if (submittingRef.current) return;
		if (!name.trim()) {
			setError("Please enter your name.");
			return;
		}
		if (!employeeId.trim()) {
			setError("Please enter your employee ID.");
			return;
		}
		if (!location) {
			setError("Please select your office location.");
			return;
		}
		const wishError = validateWish(message);
		if (wishError) {
			setError(wishError);
			return;
		}
		submittingRef.current = true;
		setSubmitting(true);
		setError(null);
		const buttonBounds = event.currentTarget.querySelector("button[type=\"submit\"]")?.getBoundingClientRect();
		try {
			await onSubmit({
				name,
				employeeId,
				message,
				officeLocation: location
			});
			if (buttonBounds) setLaunchOrigin({
				left: buttonBounds.left + buttonBounds.width / 2,
				top: buttonBounds.top + buttonBounds.height / 2
			});
			setSubmitted(true);
			onSuccess();
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Your wish could not be saved.");
		} finally {
			submittingRef.current = false;
			setSubmitting(false);
		}
	};
	const launchEffect = launchOrigin ? typeof document === "undefined" ? null : (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "wish-launch-lantern",
		style: {
			left: launchOrigin.left,
			top: launchOrigin.top
		},
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternShape, { size: 38 })
	}), document.body) : null;
	if (submitted) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "visitor-success wish-card p-6 text-center animate-in fade-in zoom-in-95",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-10 w-10 text-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-serif text-xl font-bold text-foreground",
				children: "Your wish has joined the festival collection!"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "It will appear on the festival sky after admin approval."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/display",
				className: "visitor-success-link inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow",
				children: "VIEW THE FESTIVAL SKY"
			}),
			launchEffect
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "wish-card space-y-4 p-5",
		noValidate: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "nick",
				className: "text-sm font-medium text-foreground",
				children: "Name"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "nick",
				value: name,
				maxLength: 24,
				required: true,
				onChange: (event) => setName(event.target.value),
				placeholder: "e.g. Aye Aye",
				className: "mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "employeeId",
				className: "text-sm font-medium text-foreground",
				children: "Employee ID"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "employeeId",
				value: employeeId,
				maxLength: 64,
				required: true,
				onChange: (event) => {
					setEmployeeId(event.target.value);
					if (error) setError(null);
				},
				placeholder: "Enter your employee ID",
				className: "mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "location",
				className: "text-sm font-medium text-foreground",
				children: "Office Location"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				id: "location",
				value: location,
				required: true,
				onChange: (event) => {
					const selected = event.target.value;
					if (OFFICE_LOCATIONS.includes(selected)) setLocation(selected);
					else setLocation("");
					if (error) setError(null);
				},
				className: "mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: "Select your office location"
				}), OFFICE_LOCATIONS.map((office) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: office,
					children: office
				}, office))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "wish",
						className: "text-sm font-medium text-foreground",
						children: "Your festival wish"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-xs text-muted-foreground",
						children: [
							message.length,
							"/",
							MAX_WISH
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "wish",
					value: message,
					rows: 4,
					maxLength: MAX_WISH,
					required: true,
					onChange: (event) => {
						setMessage(event.target.value);
						if (error) setError(null);
					},
					placeholder: "May our town shine bright…",
					"aria-invalid": !!error,
					className: "mt-1.5 w-full resize-y rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-destructive",
					role: "alert",
					children: error
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "submit",
				disabled: submitting,
				className: "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-sans text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "h-5 w-5",
					"aria-hidden": "true"
				}), submitting ? "SENDING YOUR WISH…" : "LIGHT MY LANTERN"]
			}),
			launchEffect
		]
	});
}
function Index() {
	const { lanterns, error: loadError } = useLanterns();
	const visible = lanterns.filter((lantern) => lantern.status !== "rejected");
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen overflow-hidden bg-sky",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { count: 70 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternSky, {
					lanterns: visible,
					max: 18,
					scale: .8,
					interactive: false
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto flex max-w-2xl flex-col px-5 pb-12 pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold",
						children: "Coca-Cola · Coke Chill Festival"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-title mt-5 text-center font-display text-4x11 leading-tight text-foreground text-glow sm:text-6xl",
						children: appTitle
					}),
					!submitted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/display",
						className: "visitor-display-link mt-8 self-center rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10",
						children: "VIEW THE FESTIVAL SKY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-8",
						children: [loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-center text-sm text-destructive",
							role: "alert",
							children: loadError
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorWishForm, {
							onSubmit: async (input) => {
								await lanternService.submit(input);
							},
							onSuccess: () => setSubmitted(true)
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { Index as component };
