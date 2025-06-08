import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/flashcards/:path*',
    '/api/flashcard-sets/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  console.log('Middleware - Token:', token ? 'Present' : 'Missing');
  console.log('Middleware - Path:', request.nextUrl.pathname);

  if (!token) {
    console.log('Middleware - No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    console.log('Middleware - Token verified successfully', { payload });

    // Clone the request and add the user's DID to the headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-did', payload.did as string);

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('Middleware - Token verification failed:', error);
    // Token is invalid or expired
    return NextResponse.redirect(new URL('/login', request.url));
  }
} 