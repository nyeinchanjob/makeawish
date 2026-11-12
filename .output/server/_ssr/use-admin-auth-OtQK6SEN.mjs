import { n as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as AdminAuthContext } from "./admin-auth-context-BDTjzi4U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-admin-auth-OtQK6SEN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAdminAuth() {
	const context = (0, import_react.useContext)(AdminAuthContext);
	if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider.");
	return context;
}
//#endregion
export { useAdminAuth as t };
