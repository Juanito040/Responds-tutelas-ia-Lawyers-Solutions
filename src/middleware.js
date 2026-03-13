// Middleware de protección de rutas — api-quality: 401 para no autenticados
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Rutas protegidas — todo excepto login, register y API pública
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/casos/:path*",
    "/contestacion/:path*",
  ],
};
