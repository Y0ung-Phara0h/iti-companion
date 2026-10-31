// Local visual-QA server: serves the injected stylesheet at
// http://127.0.0.1:8787/mobile.css so the in-app browser can preview it on the
// live site without shipping a debug build. Also serves DOM mocks from
// tools/mock for pages that need a login (progress, dashboard).
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mockDir = join(root, 'mock');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

async function mobileCss() {
  const source = await readFile(new URL('../src/lib/mobile-css.ts', import.meta.url), 'utf8');
  const marker = 'export const MOBILE_CSS = `';
  const start = source.indexOf(marker) + marker.length;
  const end = source.lastIndexOf('`');
  return source.slice(start, end);
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (url.pathname === '/mobile.css') {
    res.writeHead(200, {
      'content-type': TYPES['.css'],
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    });
    res.end(await mobileCss());
    return;
  }

  if (url.pathname.startsWith('/mock/')) {
    const rel = normalize(url.pathname.slice('/mock/'.length)).replace(/^(\.\.[/\\])+/, '');
    const file = join(mockDir, rel);
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
    return;
  }

  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('ok');
}).listen(8787, '127.0.0.1', () => {
  console.log('QA stylesheet: http://127.0.0.1:8787/mobile.css');
  console.log('Progress mock: http://127.0.0.1:8787/mock/progress.html');
});
