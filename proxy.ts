import { NextResponse, type NextRequest } from 'next/server';
import aliases from './lib/report-image-aliases.json';

// Run before the framework's public-file manifest so removed copies keep working.
export function proxy(request: NextRequest) {
  let pathname: string;
  try { pathname = decodeURIComponent(request.nextUrl.pathname); }
  catch { return new Response('Not found', { status: 404 }); }
  const target = (aliases as Record<string, string>)[pathname];
  if (!target) return NextResponse.next();
  return NextResponse.redirect(new URL(target + request.nextUrl.search, request.url), 302);
}
export const config = { matcher: ["/research-deliveries/:path*","/home-prototype/:path*","/proposal-fusion/:path*","/community-design/:path*","/proposal-options/:path*","/retained/:path*","/proposal-one/:path*","/product-concepts/:path*"] };
