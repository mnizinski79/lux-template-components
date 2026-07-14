export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const correctPassword = process.env.PROTOTYPE_PASSWORD
  if (!correctPassword) {
    return res.status(500).send('PROTOTYPE_PASSWORD environment variable is not set.')
  }

  // Parse application/x-www-form-urlencoded body
  const buffers = []
  for await (const chunk of req) buffers.push(chunk)
  const rawBody = Buffer.concat(buffers).toString()
  const params = new URLSearchParams(rawBody)

  const password = params.get('password')
  const next = params.get('next') || '/_prototype/'

  if (password === correctPassword) {
    res.setHeader(
      'Set-Cookie',
      `prototype-auth=granted; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
    )
    return res.redirect(302, next)
  }

  return res.redirect(302, `/login.html?error=1&next=${encodeURIComponent(next)}`)
}
