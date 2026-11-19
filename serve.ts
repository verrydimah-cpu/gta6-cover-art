// VICE COVER STUDIO — tiny local static server for trying the app.
// Run: node serve.ts  (then open the printed address in a desktop browser)
// Set PORT to serve on a different port; paths cannot escape app/.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), 'app');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};
const port = Number(process.env.PORT || 8080);
createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url || '/').split('?')[0]));
  const rel = path === '/' ? 'index.html' : path.replace(/^\/+/, '');
  const file = join(root, rel);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const ext = rel.slice(rel.lastIndexOf('.'));
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Vice Cover Studio at http://localhost:${port}`));
