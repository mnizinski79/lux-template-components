export const config = {
  matcher: ['/_prototype/:path*'],
}

export default function middleware(request) {
  const url = new URL(request.url)

  // Allow through on localhost — no gate in development
  const hostname = url.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return

  const cookieHeader = request.headers.get('cookie') || ''
  const isAuthed = cookieHeader
    .split(';')
    .some(c => c.trim().startsWith('prototype-auth=granted'))

  if (isAuthed) return

  // Not authenticated — redirect to login
  const loginUrl = new URL('/login.html', url)
  loginUrl.searchParams.set('next', url.pathname)
  return Response.redirect(loginUrl, 302)
}
