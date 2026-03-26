/** @type {import('next').NextConfig} */

// Cabeceras HTTP de seguridad — security-audit skill: OWASP A05
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload", // HSTS 2 años
  },
  {
    key: "X-Frame-Options",
    value: "DENY", // previene clickjacking
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff", // previene MIME sniffing
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requiere unsafe-eval en dev
      "style-src 'self' 'unsafe-inline'",                // Tailwind inline styles
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com", // APIs de IA
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Mitigación GHSA-9g9p-9gw9-jx7f: sin dominios remotos en Image Optimizer
  images: {
    remotePatterns: [],
  },
  // No exponer información del framework en producción
  poweredByHeader: false,
  // pdf-parse usa el módulo 'canvas' y archivos de test que no existen en Next.js
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
