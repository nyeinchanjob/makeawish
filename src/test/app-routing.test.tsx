import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  rootRouteId,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as LandingRoute } from "@/routes/index";
import { Route as DisplayRoute } from "@/routes/display";
import { Display } from "@/components/Display";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each(["/", "/display", "/submit", "/admin"])(
    "matches a page for %s instead of falling back to not found",
    (path) => {
      const router = createRouter({
        routeTree,
        context: { queryClient: new QueryClient() },
      });

      const matches = router.matchRoutes(path);

      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    },
  );

  it("uses the submission page at root and reserves the TV display for /display", () => {
    expect(LandingRoute.options.component).toBeTypeOf("function");
    expect(LandingRoute.options.component).not.toBe(Display);
    expect(LandingRoute.options.beforeLoad).toBeUndefined();
    expect(DisplayRoute.options.component).toBe(Display);
  });

  it("redirects legacy submission links to root without adding a history entry", async () => {
    const history = createMemoryHistory({ initialEntries: ["/submit"] });
    const router = createRouter({
      routeTree,
      history,
      context: { queryClient: new QueryClient() },
      isServer: false,
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/");
    expect(history.length).toBe(1);
  });
});
