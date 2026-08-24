import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/astrorank') {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/astrorank', request.url), 308);
}

export const config = {
  matcher: [
    '/((?!admin|llms\.txt|robots\.txt|sitemap\.xml|_next|favicon\.ico|icon\.svg|og-default\.png).*)',
  ],
};
