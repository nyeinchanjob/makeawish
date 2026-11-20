import type { Plugin } from "vite";

export function localApiPlugin(): Plugin {
  return {
    name: "share-light-local-api",
    apply: "serve",
    configureServer(server) {
      server.config.logger.info("Share the Light: local API lockdown enabled.");
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !/^\/api(?:\/|\?|$)/.test(req.url)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Share-Light-Mode", "local-dev");
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Forbidden" }));
      });
    },
  };
}
