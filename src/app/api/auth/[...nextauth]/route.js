// NextAuth route handler — Next.js 14 App Router
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Forzar renderizado dinámico — NextAuth no puede ser estático
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
