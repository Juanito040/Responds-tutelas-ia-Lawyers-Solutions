import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata = {
  title: "TutelaIA",
  description: "Software jurídico para agilizar la contestación de acciones de tutela en Colombia",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body className="bg-background min-h-screen antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
