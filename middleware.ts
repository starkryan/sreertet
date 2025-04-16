import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/history(.*)'
])

// Define auth pages
const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

// Define public routes (landing page, etc.)
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about'
])

export default clerkMiddleware(async (auth, req) => {
  try {
    // If the request is for a protected route, run auth.protect()
    if (isProtectedRoute(req)) {
      try {
        await auth.protect();
      } catch (e) {
        // Redirect to sign-in if auth.protect() fails
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }
    }
    
    // For auth pages (sign-in, sign-up) or home page, check if user is authenticated
    // If authenticated, redirect to dashboard
    if (isAuthPage(req) || req.nextUrl.pathname === '/') {
      // Check authentication status without throwing error
      const authState = await auth.protect().catch(() => null);
      
      // If auth.protect didn't throw, user is authenticated
      if (authState !== null) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}