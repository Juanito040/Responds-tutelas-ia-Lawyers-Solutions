// Middleware de protección de rutas + rate limiting — security-audit: OWASP A07
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ─── Rate limiter en memoria ──────────────────────────────────────────────────
// Para producción multi-instancia migrar a Upstash Redis.
// Se usa clave compuesta ip:ruta para separar límites por endpoint.
const rateMap = new Map();
let lastCleanup = Date.now();

// Límites por tipo de ruta (req/min)
const LIMITS = {
  auth:    10,   // login / registro — evita brute force
  ai:       5,   // extracción PDF + generar contestación — costo API
  default: 60,   // resto de rutas autenticadas
};

function getLimit(pathname) {
  if (pathname.includes("register") || pathname.includes("callback")) return LIMITS.auth;
  if (pathname.includes("extraer") || pathname.includes("generar-contestacion")) return LIMITS.ai;
  return LIMITS.default;
}

function rateLimit(key, windowMs, max) {
  const now = Date.now();

  // Limpiar entradas expiradas cada 5 minutos para evitar fuga de memoria
  if (now - lastCleanup > 5 * 60_000) {
    for (const [k, v] of rateMap) {
      if (now > v.resetAt) rateMap.delete(k);
    }
    lastCleanup = now;
  }

  const entry = rateMap.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count  = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateMap.set(key, entry);

  return entry.count > max;
}

function getIp(req) {
  // Confiar solo en el primer IP de x-forwarded-for (Vercel lo setea correctamente)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/casos") || pathname.startsWith("/api/contestaciones")) {
      const ip    = getIp(req);
      const max   = getLimit(pathname);
      // Clave ip+ruta para límites independientes por endpoint
      const key   = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;

      if (rateLimit(key, 60_000, max)) {
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
