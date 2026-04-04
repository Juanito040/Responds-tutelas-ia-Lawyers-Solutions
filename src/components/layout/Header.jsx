"use client";
import { usePathname } from "next/navigation";
import { Bell, X, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TITLES = {
  "/dashboard":   "Dashboard",
  "/casos":       "Mis tutelas",
  "/casos/nuevo": "Nueva tutela",
  "/inicio":      "Inicio",
};

const LABEL_TIPO = {
  SALUD: "Salud", TRABAJO: "Trabajo", EDUCACION: "Educación", PENSION: "Pensión",
  VIVIENDA: "Vivienda", DEBIDO_PROCESO: "Debido proceso", INTIMIDAD: "Intimidad",
  IGUALDAD: "Igualdad", OTRO: "Otro",
};

function urgenciaConfig(dias) {
  if (dias <= 0) return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: AlertTriangle, label: "Vencida" };
  if (dias <= 3) return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: AlertTriangle, label: `${dias}d hábiles` };
  return         { color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: Clock,          label: `${dias}d hábiles` };
}

export default function Header({ user }) {
  const pathname = usePathname();
  const dropRef  = useRef(null);

  const [open, setOpen]       = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [loaded, setLoaded]   = useState(false);

  const title = Object.entries(TITLES).find(([path]) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] ?? "TutelaIA";

  useEffect(() => {
    async function cargar() {
      try {
        const res  = await fetch("/api/casos/alertas");
        const data = await res.json();
        if (data.success) setAlertas(data.data);
      } catch { /* silenciar */ }
      setLoaded(true);
    }
    cargar();
    const id = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch("/api/casos/alertas")
      .then(r => r.json())
      .then(d => { if (d.success) setAlertas(d.data); })
      .catch(() => {});
  }, [pathname]);

  const count = alertas.length;

  return (
    <header style={{
      background: "#D8D2CA",
      borderBottom: "1px solid #D8D2CA",
      padding: "0 24px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div />

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>


        {/* Campana */}
        <div style={{ position: "relative" }} ref={dropRef}>
          <button
            aria-label="Notificaciones"
            onClick={() => setOpen(o => !o)}
            style={{
              width: "42px", height: "42px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer",
              borderRadius: "3px", position: "relative",
              transition: "background 0.15s",
            }}
          >
            <Bell style={{ width: "30px", height: "40px", color: count > 0 ? "#C0392B" : "#7A7268" }} />
            {loaded && count > 0 && (
              <span style={{
                position: "absolute", top: "-2px", right: "-2px",
                width: "16px", height: "16px",
                background: "#C0392B", color: "#D8D2CA",
                borderBottom: "1px solid #332f2aff",
                fontSize: "10px", fontWeight: 700,
                borderRadius: "9999px",
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {open && (
            <div style={{
              position: "absolute", right: 0, top: "40px",
              width: "300px", background: "#e0dcd7ff",
              border: "1px solid #D8D2CA",
              boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
              zIndex: 50,
            }}>
              {/* Header dropdown */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #D8D2CA", background: "#F7F3EE" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7268" }}>
                  {count > 0 ? `${count} alerta${count > 1 ? "s" : ""}` : "Sin alertas"}
                </span>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7268" }}>
                  <X style={{ width: "14px", height: "14px" }} />
                </button>
              </div>

              {count === 0 ? (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <CheckCircle2 style={{ width: "28px", height: "28px", color: "#27AE60", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "13px", color: "#7A7268" }}>Todos los casos están al día.</p>
                </div>
              ) : (
                <ul style={{ maxHeight: "280px", overflowY: "auto", listStyle: "none", margin: 0, padding: 0 }}>
                  {alertas.map(alerta => {
                    const cfg  = urgenciaConfig(alerta.diasRestantes);
                    const Icon = cfg.icon;
                    return (
                      <li key={alerta.id} style={{ borderBottom: "1px solid #F0EBE4" }}>
                        <Link
                          href={`/casos/${alerta.id}`}
                          onClick={() => setOpen(false)}
                          style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", textDecoration: "none", transition: "background 0.1s" }}
                        >
                          <Icon style={{ width: "14px", height: "14px", color: cfg.color, marginTop: "2px", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alerta.accionante}</p>
                            <p style={{ fontSize: "11px", color: "#7A7268", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>vs. {alerta.accionado}</p>
                            <p style={{ fontSize: "11px", color: "#7A7268", marginTop: "2px" }}>{LABEL_TIPO[alerta.tipoTutela]}</p>
                          </div>
                          <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 700, padding: "3px 8px", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {count > 0 && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid #D8D2CA", background: "#F7F3EE" }}>
                  <Link href="/casos" onClick={() => setOpen(false)} style={{ fontSize: "12px", color: "#1B3528", fontWeight: 600, textDecoration: "none" }}>
                    Ver todos los casos 
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
