// src/middleware.ts
//
// WHY THIS EXISTS:
// next.config.ts rewrites() is evaluated at BUILD TIME in standalone mode.
// So process.env.API_URL inside rewrites() always reads the build-time value
// (which was localhost:3000 since no env var was set during docker build).
//
// Next.js Middleware runs at TRUE RUNTIME on every request — it can read
// environment variables that are injected by Azure at container start time.
//
// This middleware intercepts /api/* and /ml/* requests and proxies them
// to the real backend/ML service URLs set via Azure env vars.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Read env vars at runtime (injected by Azure Container App)
  const apiUrl =
    process.env.API_URL ||
    'http://localhost:8085';

  const mlUrl =
    process.env.ML_URL ||
    'http://localhost:8000';

  // Proxy /api/* → backend
  if (pathname.startsWith('/api/')) {
    const target = `${apiUrl}${pathname}${search}`;
    return NextResponse.rewrite(new URL(target));
  }

  // Proxy /ml/* → ML service (strip /ml prefix — ML routes are at /external, /predict, etc.)
  if (pathname.startsWith('/ml/')) {
    const mlPath = pathname.replace(/^\/ml/, '');
    const target = `${mlUrl}${mlPath}${search}`;
    return NextResponse.rewrite(new URL(target));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/ml/:path*'],
};