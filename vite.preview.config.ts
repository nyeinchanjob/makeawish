import { defineConfig } from "vite";

export default defineConfig({
  appType: "spa",
  build: { outDir: ".output/public" },
  plugins: [
    {
      name: "share-light-static-preview",
      configurePreviewServer(server) {
        server.middlewares.use("/api", (_req, res) => {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(
            JSON.stringify({
              error: "No Azure Functions are running in static preview.",
            }),
          );
        });
      },
    },
  ],
});
