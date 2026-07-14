/**
 * api/update-proto.js — Vercel serverless function
 *
 * Mirrors the local server.js /api/update-proto endpoint.
 * Fetches protos.js from GitHub, patches the target entry, and commits it back.
 *
 * Required Vercel env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
 * Optional: GITHUB_BRANCH (default: main), GITHUB_PATH_PREFIX (default: 00_portal)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).end();

  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_OWNER        || 'mnizinski79';
  const repo   = process.env.GITHUB_REPO         || 'lux-template-components';
  const branch = process.env.GITHUB_BRANCH       || 'main';
  const prefix = process.env.GITHUB_PATH_PREFIX  || '00_portal';

  if (!token) {
    return res.status(500).json({ ok: false, error: 'GITHUB_TOKEN not set in Vercel env vars' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { id, status, section, subsection, tags } = JSON.parse(Buffer.concat(chunks).toString());

    const ghHeaders = {
      Authorization:          `token ${token}`,
      'Content-Type':         'application/json',
      Accept:                 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const ghBase     = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const protosPath = `${prefix}/app/protos.js`;

    // 1 — Fetch current protos.js
    const getRes = await fetch(`${ghBase}/${protosPath}?ref=${branch}`, { headers: ghHeaders });
    if (!getRes.ok) throw new Error('Could not fetch protos.js from GitHub');
    const getJson = await getRes.json();

    let content = Buffer.from(getJson.content, 'base64').toString('utf8');
    const sha   = getJson.sha;

    // 2 — Locate the entry block by id
    const idPattern = new RegExp(`id:\\s*'${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`);
    const idMatch   = idPattern.exec(content);
    if (!idMatch) throw new Error(`Entry '${id}' not found in protos.js`);

    let start = idMatch.index;
    while (start > 0 && content[start] !== '{') start--;
    let depth = 0, end = start;
    while (end < content.length) {
      if      (content[end] === '{') depth++;
      else if (content[end] === '}') { depth--; if (depth === 0) { end++; break; } }
      end++;
    }

    function replaceField(block, field, val) {
      const serialized = val === null   ? 'null'
        : Array.isArray(val)            ? `[${val.map(v => `'${v}'`).join(', ')}]`
        :                                 `'${val}'`;
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

    // 3 — Commit the patched protos.js
    const putRes = await fetch(`${ghBase}/${protosPath}`, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Update prototype: ${id}`,
        content: Buffer.from(updated).toString('base64'),
        sha,
        branch,
      }),
    });
    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(`GitHub error: ${err.message}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[update-proto]', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
