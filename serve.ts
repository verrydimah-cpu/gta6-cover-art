// serve.ts — tiny local static server for trying the app during development.
// Run: node serve.ts  →  open the printed local address in a desktop browser.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "app");
const types: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".ttf": "font/ttf", ".txt": "text/plain", ".png": "image/png", ".jpg": "image/jpeg" };
const port = Number(process.env.PORT || 4173);
createServer((req, res) => {
  let path = decodeURIComponent((req.url || "/").split("?")[0]);
  if (path === "/") path = "/index.html";
  const file = join(root, path);
  if (!existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Vice Cover Studio at http://localhost:${port}`));
