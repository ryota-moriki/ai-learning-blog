import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login はスキップ（認証不要）
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // /admin 配下と /api/admin 配下を保護
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = process.env.ADMIN_SECRET;
      if (!secret) {
        throw new Error('ADMIN_SECRET is not set');
      }
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      // 無効なトークン → ログインページへ
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'トークンが無効です' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
