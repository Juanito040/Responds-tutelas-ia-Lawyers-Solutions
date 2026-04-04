"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children, style }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState("visible"); // "visible" | "hidden"

  useEffect(() => {
    /* Al cambiar ruta: ocultar brevemente, luego mostrar con animación */
    setPhase("hidden");
    const t = setTimeout(() => setPhase("visible"), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div style={{
      ...style,
      opacity:   phase === "visible" ? 1 : 0,
      transform: phase === "visible" ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.24s ease, transform 0.24s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {children}
    </div>
  );
}
