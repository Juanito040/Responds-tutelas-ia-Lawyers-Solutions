"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, PlusCircle, LogOut, Loader2,
  Home, X, Bell, AlertTriangle, Clock, CheckCircle2,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/inicio",       label: "Inicio",       icon: Home },
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/casos",        label: "Mis tutelas",  icon: FolderOpen },
  { href: "/casos/nuevo",  label: "Nueva tutela", icon: PlusCircle },
];

const LABEL_TIPO = {
  SALUD: "Salud", TRABAJO: "Trabajo", EDUCACION: "Educación", PENSION: "Pensión",
  VIVIENDA: "Vivienda", DEBIDO_PROCESO: "Debido proceso", INTIMIDAD: "Intimidad",
  IGUALDAD: "Igualdad", OTRO: "Otro",
};

function urgenciaConfig(dias) {
  if (dias <= 0) return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: AlertTriangle, label: "Vencida" };
  if (dias <= 3) return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: AlertTriangle, label: `${dias}d hábiles` };
  return         { color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: Clock,                label: `${dias}d hábiles` };
}

export default function Sidebar({ user }) {
  const pathname = usePathname();

  // Perfil
  const [loggingOut, setLoggingOut]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Notificaciones
  const [notifOpen, setNotifOpen]   = useState(false);
  const [alertas, setAlertas]       = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const notifRef = useRef(null);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  // Cargar alertas
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
    fetch("/api/casos/alertas")
      .then(r => r.json())
      .then(d => { if (d.success) setAlertas(d.data); })
      .catch(() => {});
  }, [pathname]);

  // Cerrar popups al clic fuera
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = alertas.length;

  /* Estilos compartidos del popup */
  const popupStyle = (open, topOffset = "16px") => ({
    position: "fixed",
    top: topOffset,
    left: "272px",
    width: "280px",
    background: "#fff",
    border: "1px solid #D8D2CA",
    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
    zIndex: 50,
    overflow: "hidden",
    opacity:       open ? 1 : 0,
    transform:     open ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.97)",
    pointerEvents: open ? "auto" : "none",
    transition:    "opacity 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1)",
  });

  return (
    <aside style={{
      width: "256px", flexShrink: 0,
      background: "#1B3528",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0,
      zIndex: 40,
    }} className="hidden md:flex">

      {/* ── Perfil + Campana ──────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "stretch" }}>

        {/* Botón perfil */}
        <div ref={profileRef} style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", padding: "18px 16px 18px 20px",
            background: profileOpen ? "rgba(255,255,255,0.08)" : "none",
            border: "none", cursor: "pointer", textAlign: "left",
            transition: "background 0.18s ease, padding-left 0.18s cubic-bezier(0.4,0,0.2,1)",
          }}
          onMouseEnter={e => {
            if (profileOpen) return;
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.paddingLeft = "24px";
          }}
          onMouseLeave={e => {
            if (profileOpen) return;
            e.currentTarget.style.background = "none";
            e.currentTarget.style.paddingLeft = "20px";
          }}
        >
          <div style={{ width: "36px", height: "36px", background: "#0B1812", border: "2px solid #A8895A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: "15px", fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <p style={{ color: "rgba(156,191,172,0.65)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
        </button>

        {/* Popup perfil */}
        <div style={popupStyle(profileOpen, "16px")}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #D8D2CA", background: "#F7F3EE" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#1A1A18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
              <p style={{ fontSize: "11px", color: "#7A7268", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>{user?.email}</p>
            </div>
            <button onClick={() => setProfileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7268", padding: "2px", flexShrink: 0, marginLeft: "8px" }}>
              <X style={{ width: "13px", height: "13px" }} />
            </button>
          </div>
          <button
            onClick={handleLogout} disabled={loggingOut}
            style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 16px", fontSize: "13px", color: "#C0392B", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            {loggingOut ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> : <LogOut style={{ width: "14px", height: "14px" }} />}
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
        </div>{/* /profileRef */}

        {/* Botón campana */}
        <div ref={notifRef} style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "52px", height: "100%",
              background: notifOpen ? "rgba(255,255,255,0.08)" : "none",
              border: "none", cursor: "pointer",
              transition: "background 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1)",
              position: "relative",
            }}
            onMouseEnter={e => {
              if (notifOpen) return;
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.transform = "scale(1.12)";
            }}
            onMouseLeave={e => {
              if (notifOpen) return;
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell style={{ width: "16px", height: "16px", color: count > 0 ? "#fca5a5" : "rgba(156,191,172,0.7)" }} />
              {loaded && count > 0 && (
                <span style={{
                  position: "absolute", top: "-5px", right: "-6px",
                  minWidth: "14px", height: "14px", padding: "0 3px",
                  background: "#C0392B", color: "#fff",
                  fontSize: "9px", fontWeight: 700,
                  borderRadius: "9999px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </div>
          </button>

          {/* Popup notificaciones */}
          <div style={{
            position: "fixed", top: "16px", left: "272px", width: "290px",
            background: "#fff", border: "1px solid #D8D2CA",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            maxHeight: "420px", display: "flex", flexDirection: "column",
            opacity:       notifOpen ? 1 : 0,
            transform:     notifOpen ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.97)",
            pointerEvents: notifOpen ? "auto" : "none",
            transition:    "opacity 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 50,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #D8D2CA", background: "#F7F3EE", flexShrink: 0 }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7268" }}>
                {count > 0 ? `${count} alerta${count > 1 ? "s" : ""}` : "Sin alertas"}
              </span>
              <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7268" }}>
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            </div>

            {/* Lista */}
            {count === 0 ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <CheckCircle2 style={{ width: "26px", height: "26px", color: "#27AE60", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "13px", color: "#7A7268" }}>Todos los casos están al día.</p>
              </div>
            ) : (
              <ul style={{ overflowY: "auto", listStyle: "none", margin: 0, padding: 0, flex: 1 }}>
                {alertas.map(alerta => {
                  const cfg  = urgenciaConfig(alerta.diasRestantes);
                  const Icon = cfg.icon;
                  return (
                    <li key={alerta.id} style={{ borderBottom: "1px solid #F0EBE4" }}>
                      <Link
                        href={`/casos/${alerta.id}`}
                        onClick={() => setNotifOpen(false)}
                        style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "11px 16px", textDecoration: "none" }}
                      >
                        <Icon style={{ width: "13px", height: "13px", color: cfg.color, marginTop: "2px", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alerta.accionante}</p>
                          <p style={{ fontSize: "11px", color: "#7A7268", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>vs. {alerta.accionado}</p>
                          <p style={{ fontSize: "11px", color: "#7A7268", marginTop: "1px" }}>{LABEL_TIPO[alerta.tipoTutela]}</p>
                        </div>
                        <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 700, padding: "3px 7px", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {count > 0 && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid #D8D2CA", background: "#F7F3EE", flexShrink: 0 }}>
                <Link href="/casos" onClick={() => setNotifOpen(false)} style={{ fontSize: "12px", color: "#1B3528", fontWeight: 600, textDecoration: "none" }}>
                  Ver todos los casos →
                </Link>
              </div>
            )}
          </div>
        </div>{/* /notifRef */}

      </div>{/* /Perfil + Campana */}

      {/* ── Navegación ────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "12px" }} aria-label="Menú principal">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (
            href !== "/dashboard" &&
            pathname.startsWith(href) &&
            !(href === "/casos" && pathname.startsWith("/casos/nuevo"))
          );
          return (
            <Link key={href} href={href}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", marginBottom: "2px",
                fontSize: "15px", fontWeight: active ? 600 : 400,
                textDecoration: "none",
                color: active ? "#fff" : "rgba(156,191,172,0.85)",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: active ? "2px solid #A8895A" : "2px solid transparent",
                transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1), padding-left 0.18s ease",
              }}
              aria-current={active ? "page" : undefined}
              onMouseEnter={e => {
                if (active) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderLeft = "2px solid rgba(168,137,90,0.5)";
                e.currentTarget.style.paddingLeft = "16px";
              }}
              onMouseLeave={e => {
                if (active) return;
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(156,191,172,0.85)";
                e.currentTarget.style.borderLeft = "2px solid transparent";
                e.currentTarget.style.paddingLeft = "12px";
              }}
            >
              <Icon style={{ width: "17px", height: "17px", flexShrink: 0 }} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
