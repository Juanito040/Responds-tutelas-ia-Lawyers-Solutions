// Configuración NextAuth — api-quality skill: autenticación robusta
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions = {
  // Sin adapter: usamos JWT puro con CredentialsProvider (no necesita persistir sesiones en BD)
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Correo y contraseña son requeridos");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          // Mensaje genérico — no revelar si el correo existe (security-audit)
          throw new Error("Credenciales incorrectas");
        }

        if (!user.isActive) {
          throw new Error("Cuenta desactivada. Contacta al administrador");
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordValid) {
          throw new Error("Credenciales incorrectas");
        }

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 horas máximo por inactividad
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Sin 'maxAge' ni 'expires' → cookie de sesión, se borra al cerrar el navegador
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
