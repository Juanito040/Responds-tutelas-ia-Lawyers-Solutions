"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  const pathname  = usePathname();
  const [width, setWidth] = useState(0);
  const [show,  setShow]  = useState(false);
  const prevPath  = useRef(pathname);
  const fakeTimer = useRef(null);
  const hideTamer = useRef(null);

  /* Detectar clic en cualquier enlace interno para INICIAR la barra */
  useEffect(() => {
    function onLinkClick(e) {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (href === pathname) return;

      clearTimeout(fakeTimer.current);
      clearTimeout(hideTamer.current);
      setShow(true);
      setWidth(0);

      requestAnimationFrame(() => {
        setWidth(25);
        fakeTimer.current = setTimeout(() => setWidth(65), 400);
      });
    }
    document.addEventListener("click", onLinkClick);
    return () => {
      document.removeEventListener("click", onLinkClick);
      clearTimeout(fakeTimer.current);
      clearTimeout(hideTamer.current);
    };
  }, [pathname]);

  /* Cuando pathname cambia → COMPLETAR la barra */
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    clearTimeout(fakeTimer.current);
    setWidth(100);
    hideTamer.current = setTimeout(() => {
      setShow(false);
      setWidth(0);
    }, 380);
  }, [pathname]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "2px", zIndex: 9999, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%",
        width: show ? `${width}%` : "0%",
        background: "linear-gradient(90deg, #A8895A, #c9a97a)",
        opacity: show ? 1 : 0,
        transition: width === 100
          ? "width 0.22s ease, opacity 0.35s ease 0.22s"
          : width === 0
            ? "none"
            : "width 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 0 10px rgba(168,137,90,0.55)",
      }} />
    </div>
  );
}
