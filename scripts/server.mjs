import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep) || pathname.includes('/.git') || pathname.includes('/node_modules')) {
      res.writeHead(403); res.end(); return;
    }
    const content = await readFile(target);
    res.writeHead(200, { 'Content-Type': (types[path.extname(target)] || 'application/octet-stream') + (['.html', '.js', '.css', '.json', '.svg'].includes(path.extname(target)) ? '; charset=utf-8' : ''), 'Cache-Control': 'no-store' });
    res.end(content);
  } catch {
    res.writeHead(404); res.end('Archivo no encontrado');
  }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('http://127.0.0.1:' + (process.env.PORT || 4173)));
