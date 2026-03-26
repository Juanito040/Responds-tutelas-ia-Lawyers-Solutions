// Middleware de protección de rutas + rate limiting — security-audit: OWASP A07
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Rate limiter en memoria — simple, para instancia única
// En producción multi-instancia usar Redis (Upstash)
const rateMap = new Map();

function rateLimit(ip, windowMs = 60_000, max = 10) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateMap.set(ip, entry);

  return entry.count > max;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Rate limiting para rutas de autenticación — 10 intentos/minuto por IP
    if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/casos")) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")
        || "unknown";

      // Límite más estricto en login/registro
      const isAuthRoute = pathname.includes("callback") || pathname.includes("register");
      const maxReq = isAuthRoute ? 10 : 60;

      if (rateLimit(ip, 60_000, maxReq)) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMIT", message: "Demasiadas solicitudes. Espera un minuto." } },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rutas de API de auth son públicas
        if (req.nextUrl.pathname.startsWith("/api/auth/")) return true;
        // El resto requiere token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Aplicar middleware a rutas protegidas Y rutas de API que necesitan rate limiting
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/casos/:path*",
    "/contestacion/:path*",
    "/api/auth/callback/:path*",
    "/api/auth/register",
    "/api/casos/:path*",
    "/api/contestaciones/:path*",
  ],
};
