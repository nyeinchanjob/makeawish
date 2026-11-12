import { loadEnv, type Plugin } from "vite";
import { createLocalState, handleLocalRequest } from "../../shared/local-api";

export function localApiPlugin(): Plugin {
  return {
    name: "share-light-local-api",
    apply: "serve",
    configureServer(server) {
      const state = createLocalState();
      const env = loadEnv(server.config.mode, server.config.envDir, "");
      const pin = process.env["ADMIN_PIN"] || env["ADMIN_PIN"] || "2026";
      server.config.logger.info(
        "Share the Light: in-memory local API enabled. No Cosmos DB writes.",
      );
      server.middlewares.use(async (req, res, next) => {
        if (
          !req.url ||
          !/^\/api\/(?:wishes(?:\/[^/?]+)?|settings)(?:\?|$)/.test(req.url)
        ) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Share-Light-Mode", "local-dev");
        try {
          let text = "";
          for await (const chunk of req) {
            text += chunk.toString();
          }
          let data: unknown;
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              res.statusCode = 400;
              res.end(
                JSON.stringify({ error: "A valid JSON object is required." }),
              );
              return;
            }
          }
          const provided = req.headers["x-admin-pin"];
          const result = handleLocalRequest(
            state,
            {
              path: req.url.slice(4),
              method: req.method || "GET",
              data,
              ...(typeof provided === "string" ? { pin: provided } : {}),
            },
            pin,
          );
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (error) {
          server.config.logger.error(
            `Local festival API failed: ${error instanceof Error ? error.message : String(error)}`,
          );
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error:
                "The local festival API failed. Check the development console.",
            }),
          );
        }
      });
    },
  };
}
