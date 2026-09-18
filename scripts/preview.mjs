import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
http
  .createServer(async (req, res) => {
    try {
      const path = resolve(
        root,
        "." +
          decodeURIComponent(
            (req.url || "/").split("?")[0] === "/"
              ? "/index.html"
              : (req.url || "/").split("?")[0],
          ),
      );
      if (!path.startsWith(root + "\\") && !path.startsWith(root + "/")) {
        res.writeHead(403).end();
        return;
      }
      const body = await readFile(path);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".map": "application/json",
          }[extname(path)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Preview: http://127.0.0.1:4173"),
  );
