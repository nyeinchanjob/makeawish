import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as useAdminAuth } from "./use-admin-auth-OtQK6SEN.mjs";
import { S as useNavigate, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.login-DsYd8dQ7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const { session, signIn } = useAdminAuth();
	const navigate = useNavigate();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const submittingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (session) navigate({
			to: "/admin",
			replace: true
		});
	}, [navigate, session]);
	const submit = async (event) => {
		event.preventDefault();
		if (submittingRef.current) return;
		submittingRef.current = true;
		setSubmitting(true);
		setError(null);
		try {
			await signIn(username, password);
			await navigate({
				to: "/admin",
				replace: true
			});
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Unable to start prototype session.");
		} finally {
			submittingRef.current = false;
			setSubmitting(false);
		}
	};
	if (session) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-screen items-center justify-center bg-sky px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "wish-card w-full max-w-md p-6 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold",
					children: "Coca-Cola · Coke Chill Festival"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-center font-display text-4xl text-foreground text-glow",
					children: "Admin Login"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm text-muted-foreground",
					children: "Sign in to manage festival wishes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-4",
					onSubmit: submit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "admin-username",
							className: "text-sm font-medium text-foreground",
							children: "Username"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "admin-username",
							name: "username",
							autoComplete: "username",
							required: true,
							value: username,
							onChange: (event) => setUsername(event.target.value),
							className: "mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "admin-password",
							className: "text-sm font-medium text-foreground",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "admin-password",
							name: "password",
							type: "password",
							autoComplete: "current-password",
							required: true,
							value: password,
							onChange: (event) => setPassword(event.target.value),
							className: "mt-1.5 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-destructive",
							role: "alert",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: submitting,
							className: "w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60",
							children: submitting ? "Signing in…" : "SIGN IN"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/display",
					className: "mt-6 flex w-full items-center justify-center rounded-full border border-gold/40 px-5 py-3 text-center text-sm font-semibold text-gold transition hover:bg-gold/10",
					children: "BACK TO LIGHT DISPLAY"
				})
			]
		})
	});
}
//#endregion
export { AdminLogin as component };
