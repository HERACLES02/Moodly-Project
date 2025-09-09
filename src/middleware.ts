import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
 
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") ||
                           nextUrl.pathname.startsWith("/firstmoodselection")||
                           nextUrl.pathname.startsWith("/livestream")||
                           nextUrl.pathname.startsWith("/radio")||
                           nextUrl.pathname.startsWith("/movie")||
                           nextUrl.pathname.startsWith("/song")||
                           nextUrl.pathname.startsWith("/themes") ||
                           nextUrl.pathname.startsWith("/userpage")
                           
 
  // If not logged in and trying to access protected route
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
 
  // If logged in and trying to access login/register
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }
 
  // For admin routes, check if user is admin
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || !req.auth?.user?.isAdmin) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
  }

  

 
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
}