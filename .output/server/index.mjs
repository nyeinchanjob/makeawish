globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/TCCC-UnityText-Regular.ttf": {
		"type": "font/ttf",
		"etag": "\"1ddec-bRpHuEuoYdFI5TSx/rBI3czf4xI\"",
		"mtime": "2026-11-20T02:36:20.201Z",
		"size": 122348,
		"path": "../public/TCCC-UnityText-Regular.ttf"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-11-20T02:36:20.211Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/qr-code.png": {
		"type": "image/png",
		"etag": "\"1006e-STpMzsIVvHKiw+jfs5ypo/h31HM\"",
		"mtime": "2026-11-20T02:36:20.211Z",
		"size": 65646,
		"path": "../public/qr-code.png"
	},
	"/staticwebapp.config.json": {
		"type": "application/json",
		"etag": "\"e1-Y2rpUkz+Wt+YsrUIoolJx1QBGK0\"",
		"mtime": "2026-11-20T02:36:20.211Z",
		"size": 225,
		"path": "../public/staticwebapp.config.json"
	},
	"/font.ttf": {
		"type": "font/ttf",
		"etag": "\"1ddec-bRpHuEuoYdFI5TSx/rBI3czf4xI\"",
		"mtime": "2026-11-20T02:36:20.201Z",
		"size": 122348,
		"path": "../public/font.ttf"
	},
	"/assets/ApiModeNotice-ZdC8TUKA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a5-MlLowWi+ebO2TIx+SiljMyheMAU\"",
		"mtime": "2026-11-20T02:36:19.559Z",
		"size": 1189,
		"path": "../public/assets/ApiModeNotice-ZdC8TUKA.js"
	},
	"/assets/README.md": {
		"type": "text/markdown; charset=utf-8",
		"etag": "\"233-jY9oWKFKoFnVZY0RPm/cbLSUDas\"",
		"mtime": "2026-11-20T02:36:20.212Z",
		"size": 563,
		"path": "../public/assets/README.md"
	},
	"/assets/admin-Bsl9oODp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174c0-UbsYbUlY2ryFkqouCA2d/oFh+nU\"",
		"mtime": "2026-11-20T02:36:19.562Z",
		"size": 95424,
		"path": "../public/assets/admin-Bsl9oODp.js"
	},
	"/assets/Sky-CPUpbYpn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1025-kACcFRSr/aPQlrYSpCJ6PFq6314\"",
		"mtime": "2026-11-20T02:36:19.561Z",
		"size": 4133,
		"path": "../public/assets/Sky-CPUpbYpn.js"
	},
	"/assets/display-DCVUuAUa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27b7-YdSwa9Kvbw3mjQqe3Fq0+rM1nRM\"",
		"mtime": "2026-11-20T02:36:19.562Z",
		"size": 10167,
		"path": "../public/assets/display-DCVUuAUa.js"
	},
	"/assets/routes-Dw7BMo7D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19f3-vdKyxp8wHXBZDpa2hAaMIVthy3I\"",
		"mtime": "2026-11-20T02:36:19.562Z",
		"size": 6643,
		"path": "../public/assets/routes-Dw7BMo7D.js"
	},
	"/assets/x-CHAnhn8C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3106-Fk7UDfjxCxcn7zaCS5xsVUDbjZw\"",
		"mtime": "2026-11-20T02:36:19.562Z",
		"size": 12550,
		"path": "../public/assets/x-CHAnhn8C.js"
	},
	"/assets/styles-DPsmuQnO.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"15b23-oVziQcuCWYN1k/sR9uZwfqebp1w\"",
		"mtime": "2026-11-20T02:36:19.562Z",
		"size": 88867,
		"path": "../public/assets/styles-DPsmuQnO.css"
	},
	"/assets/index-DmU0tl02.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ae86-xVYJv2JsHK01QSz5z1cttt40SRs\"",
		"mtime": "2026-11-20T02:36:19.555Z",
		"size": 372358,
		"path": "../public/assets/index-DmU0tl02.js"
	},
	"/background.png": {
		"type": "image/png",
		"etag": "\"1d68e0-EQg59Yhjx+4hPc/syDVtq9iOP20\"",
		"mtime": "2026-11-20T02:36:20.212Z",
		"size": 1927392,
		"path": "../public/background.png"
	},
	"/logo.png": {
		"type": "image/png",
		"etag": "\"1e61c3-g7h9UG0RputBISEb0lv+QwJEN3A\"",
		"mtime": "2026-11-20T02:36:20.212Z",
		"size": 1991107,
		"path": "../public/logo.png"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_TyJZzq = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_TyJZzq
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
