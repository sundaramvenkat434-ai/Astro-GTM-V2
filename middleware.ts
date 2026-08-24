import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/astrorank', request.url), 308);
}

export const config = {
  matcher: [
    '/((?!admin|astrorank|llms\.txt|robots\.txt|sitemap\.xml|_next|favicon\.ico|icon\.svg|og-default\.png).*)',
  ],
};
