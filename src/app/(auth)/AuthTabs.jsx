"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthTabs() {
  const pathname = usePathname();
  const isLogin  = pathname === "/login";

  return (
    <div style={{ display: "flex", marginBottom: "36px", borderBottom: "1px solid #D8D2CA" }}>

      <Link
        href="/login"
        style={{
          paddingBottom: "12px",
          marginRight: "28px",
          fontSize: "13px",
          fontWeight: isLogin ? 700 : 500,
          color: isLogin ? "#1B3528" : "#8A8680",
          textDecoration: "none",
          borderBottom: isLogin ? "2px solid #1B3528" : "2px solid transparent",
          marginBottom: "-1px",
          transition: "color 0.2s, border-color 0.2s",
          letterSpacing: "0.01em",
        }}
      >
        Iniciar sesión
      </Link>

      <Link
        href="/register"
        style={{
          paddingBottom: "12px",
          fontSize: "13px",
          fontWeight: !isLogin ? 700 : 500,
          color: !isLogin ? "#1B3528" : "#8A8680",
          textDecoration: "none",
          borderBottom: !isLogin ? "2px solid #1B3528" : "2px solid transparent",
          marginBottom: "-1px",
          transition: "color 0.2s, border-color 0.2s",
          letterSpacing: "0.01em",
        }}
      >
        Crear cuenta
      </Link>

    </div>
  );
}
