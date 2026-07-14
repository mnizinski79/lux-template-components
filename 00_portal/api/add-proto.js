/**
 * api/add-proto.js — Vercel serverless function
 *
 * Mirrors the local server.js /api/add-proto endpoint.
 * Instead of writing to disk, commits directly to GitHub via the Contents API.
 *
 * Required Vercel env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   GITHUB_TOKEN       Personal Access Token with repo write scope
 *   GITHUB_OWNER       mnizinski79
 *   GITHUB_REPO        lux-template-components
 *   GITHUB_BRANCH      main  (optional, defaults to main)
 *   GITHUB_PATH_PREFIX 00_portal  (optional, defaults to 00_portal)
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
    const { entry, filename, fileContent } = JSON.parse(Buffer.concat(chunks).toString());

    const ghHeaders = {
      Authorization:          `token ${token}`,
      'Content-Type':         'application/json',
      Accept:                 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const ghBase = `https://api.github.com/repos/${owner}/${repo}/contents`;

    // 1 — Create the prototype HTML file in _prototype/
    const protoPath = `${prefix}/_prototype/${filename}`;
    const protoRes  = await fetch(`${ghBase}/${protoPath}`, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Add prototype: ${filename}`,
        content: Buffer.from(fileContent).toString('base64'),
        branch,
      }),
    });
    if (!protoRes.ok) {
      const err = await protoRes.json();
      throw new Error(`GitHub error writing ${filename}: ${err.message}`);
    }

    // 2 — Fetch protos.js so we have its current content + SHA
    const protosPath = `${prefix}/app/protos.js`;
    const getRes     = await fetch(`${ghBase}/${protosPath}?ref=${branch}`, { headers: ghHeaders });
    if (!getRes.ok) throw new Error('Could not fetch protos.js from GitHub');
    const getJson    = await getRes.json();

    let protosContent = Buffer.from(getJson.content, 'base64').toString('utf8');
    const protosSHA   = getJson.sha;

    // 3 — Inject new entry before the closing ];
    const insertBefore = '\n];';
    const idx = protosContent.lastIndexOf(insertBefore);
    if (idx === -1) throw new Error('Could not find closing ]; in protos.js');
    protosContent = protosContent.slice(0, idx) + '\n\n' + entry + insertBefore;

    // 4 — Commit the updated protos.js
    const putRes = await fetch(`${ghBase}/${protosPath}`, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Register prototype: ${filename}`,
        content: Buffer.from(protosContent).toString('base64'),
        sha: protosSHA,
        branch,
      }),
    });
    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(`GitHub error updating protos.js: ${err.message}`);
    }

    res.status(200).json({ ok: true, filename, protoPath: `/_prototype/${filename}` });
  } catch (err) {
    console.error('[add-proto]', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
