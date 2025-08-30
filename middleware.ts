import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 프록시 접근 감지 (resume.dantehub.com 또는 기타 프록시 도메인)
  const hostname = request.nextUrl.hostname
  const host = request.headers.get('host')
  
  const isProxyAccess = hostname === 'resume.dantehub.com' || 
                       host === 'resume.dantehub.com'
  
  if (isProxyAccess) {
    // 서버 컴포넌트에서 사용할 헤더 설정
    response.headers.set('x-proxy-access', 'true')
    response.headers.set('x-proxy-domain', hostname)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
