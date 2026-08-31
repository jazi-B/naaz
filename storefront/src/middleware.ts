import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Static files or internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Root redirect to /pk
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL("/pk", request.url))
  }

  // If path doesn't start with 2-letter country code (e.g. /account -> /pk/account)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && segments[0].length !== 2) {
    return NextResponse.redirect(new URL(`/pk${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

