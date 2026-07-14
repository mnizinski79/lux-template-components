/**
 * server.js — Local dev server for the Regent prototype portal
 *
 * Replaces `npx serve` with file-writing capability.
 * Run: node server.js
 * Portal: http://localhost:3333/app/portal.html
 * Add proto: http://localhost:3333/app/add.html
 */

import http from 'http';
import fs   from 'fs';
import path from 'path';
import url  from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = 3333;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.ico':  'image/x-icon',
  '.md':   'text/plain',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed  = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(parsed.pathname);

  // ── CORS for local fetch calls ──────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/add-proto ─────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/add-proto') {
    try {
      const body      = await readBody(req);
      const { entry, filename, fileContent } = JSON.parse(body.toString());

      // Write prototype HTML file
      const protoDir  = path.join(__dirname, '_prototype');
      const protoPath = path.join(protoDir, filename);
      if (!fs.existsSync(protoDir)) fs.mkdirSync(protoDir);
      fs.writeFileSync(protoPath, fileContent, 'utf8');

      // Append entry to protos.js (inject before the closing ];)
      const protosPath    = path.join(__dirname, 'app', 'protos.js');
      let   protosContent = fs.readFileSync(protosPath, 'utf8');
      const insertBefore  = '\n];';
      const idx           = protosContent.lastIndexOf(insertBefore);
      if (idx === -1) throw new Error('Could not find closing ]; in protos.js');
      const updated = protosContent.slice(0, idx) + '\n\n' + entry + insertBefore;
      fs.writeFileSync(protosPath, updated, 'utf8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, filename, protoPath: `/_prototype/${filename}` }));
    } catch (err) {
      console.error('add-proto error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // ── POST /api/update-proto ─────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/update-proto') {
    try {
      const body = await readBody(req);
      const { id, status, section, subsection, tags } = JSON.parse(body.toString());

      const protosPath = path.join(__dirname, 'app', 'protos.js');
      let content = fs.readFileSync(protosPath, 'utf8');

      // Find the entry block by id
      const idPattern = new RegExp(`id:\\s*'${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`);
      const idMatch = idPattern.exec(content);
      if (!idMatch) throw new Error(`Entry '${id}' not found in protos.js`);

      let start = idMatch.index;
      while (start > 0 && content[start] !== '{') start--;
      let depth = 0, end = start;
      while (end < content.length) {
        if (content[end] === '{') depth++;
        else if (content[end] === '}') { depth--; if (depth === 0) { end++; break; } }
        end++;
      }

      function replaceField(block, field, val) {
        const serialized = val === null ? 'null'
          : Array.isArray(val) ? `[${val.map(v => `'${v}'`).join(', ')}]`
          : `'${val}'`;
        const re = new RegExp(
          `(${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*)(?:'[^']*'|null|\\[[^\\]]*\\])`, 'g'
        );
        return block.replace(re, `$1${serialized}`);
      }

      let block = content.slice(start, end);
      block = replaceField(block, 'status',     status);
      block = replaceField(block, 'section',    section);
      block = replaceField(block, 'subsection', subsection);
      block = replaceField(block, 'tags',       tags);

      const updated = content.slice(0, start) + block + content.slice(end);
      fs.writeFileSync(protosPath, updated, 'utf8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('update-proto error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // ── GET /api/ping — lets the form detect if local server is running ─────────
  if (pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }


  // ── Static file serving ─────────────────────────────────────────────────────
  let filePath = path.join(__dirname, pathname === '/' ? '/index.html' : pathname);

  // Directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext      = path.extname(filePath).toLowerCase();
  const mimeType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mimeType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  Regent Prototype Portal`);
  console.log(`  ────────────────────────────────`);
  console.log(`  Portal  →  http://localhost:${PORT}/app/portal.html`);
  console.log(`  Add     →  http://localhost:${PORT}/app/add.html`);
  console.log(`  Guide   →  http://localhost:${PORT}/app/guide.html`);
  console.log(`  ────────────────────────────────\n`);
});
