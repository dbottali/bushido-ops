import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { handleApi, type Environment } from "../server/api";

/** Local API transport only; Cloudflare uses functions/api/[[path]].ts in deployment. */
export function cloudDevPlugin(projectRoot: string): Plugin {
  return {
    name: "bushido-local-api", apply: "serve",
    configureServer(server) {
      const values = { ...loadEnv(server.config.mode, projectRoot, ""), ...process.env } as Environment;
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        try {
          const chunks: Buffer[] = []; let size = 0;
          for await (const chunk of req) {
            const bytes = Buffer.from(chunk); size += bytes.length;
            if (size > 1024 * 1024) { res.statusCode = 413; res.end('{"error":{"code":"TOO_LARGE","message":"Maximum request size: 1 MB."}}'); return; }
            chunks.push(bytes);
          }
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(",") : value);
          const payload = Buffer.concat(chunks);
          const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url}`, { method: req.method, headers, ...(payload.length ? { body: new Uint8Array(payload).buffer } : {}) });
          const response = await handleApi(request, values);
          res.statusCode = response.status; response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch { res.statusCode = 503; res.end('{"error":{"code":"SERVICE_UNAVAILABLE","message":"Local API unavailable."}}'); }
      });
    },
  };
}
