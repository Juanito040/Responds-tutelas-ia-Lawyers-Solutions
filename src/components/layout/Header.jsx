"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TITLES = {
  "/dashboard":  "Dashboard",
  "/casos":      "Mis tutelas",
  "/casos/nuevo":"Nueva tutela",
};

const LABEL_TIPO = {
  SALUD:"Salud", TRABAJO:"Trabajo", EDUCACION:"Educación", PENSION:"Pensión",
  VIVIENDA:"Vivienda", DEBIDO_PROCESO:"Debido proceso", INTIMIDAD:"Intimidad",
  IGUALDAD:"Igualdad", OTRO:"Otro",
};

function urgenciaConfig(dias) {
  if (dias <= 0)  return { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    icon: AlertTriangle, label: "Vencida",           dot: "bg-red-500" };
  if (dias <= 3)  return { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    icon: AlertTriangle, label: `${dias}d hábiles`,  dot: "bg-red-500" };
  return          { color: "text-yellow-700",  bg: "bg-yellow-50", border: "border-yellow-200", icon: Clock,          label: `${dias}d hábiles`,  dot: "bg-yellow-400" };
}

export default function Header({ user }) {
  const pathname = usePathname();
  const router   = useRouter();
  const dropRef  = useRef(null);

  const [open, setOpen]       = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [loaded, setLoaded]   = useState(false);

  const title = Object.entries(TITLES).find(([path]) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] ?? "TutelaIA";

  // Cargar alertas al montar y cada 5 minutos
  useEffect(() => {
    async function cargar() {
      try {
        const res  = await fetch("/api/casos/alertas");
        const data = await res.json();
        if (data.success) setAlertas(data.data);
      } catch { /* silenciar errores de red */ }
      setLoaded(true);
    }
    cargar();
    const id = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recargar alertas cuando cambia la ruta
  useEffect(() => {
    fetch("/api/casos/alertas")
      .then(r => r.json())
      .then(d => { if (d.success) setAlertas(d.data); })
      .catch(() => {});
  }, [pathname]);

  const count = alertas.length;

  return (
    <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-primary-500">{title}</h1>

      <div className="flex items-center gap-3">

        {/* ── Campana de notificaciones ─────────────────────────────── */}
        <div className="relative" ref={dropRef}>
          <button
            aria-label="Notificaciones"
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <Bell className={`w-4 h-4 ${count > 0 ? "text-red-500" : "text-muted"}`} />
            {loaded && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
              {/* Header dropdown */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
                <span className="text-sm font-semibold text-primary-500">
                  {count > 0 ? `${count} alerta${count > 1 ? "s" : ""} de vencimiento` : "Sin alertas"}
                </span>
                <button onClick={() => setOpen(false)} className="text-muted hover:text-primary-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de alertas */}
              {count === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-muted">Todos los casos están al día.</p>
                </div>
              ) : (
                <ul className="max-h-72 overflow-y-auto divide-y divide-border">
                  {alertas.map(alerta => {
                    const cfg = urgenciaConfig(alerta.diasRestantes);
                    const Icon = cfg.icon;
                    return (
                      <li key={alerta.id}>
                        <Link
                          href={`/casos/${alerta.id}`}
                          onClick={() => setOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-full ${alerta.diasRestantes <= 3 ? "bg-red-100" : "bg-yellow-100"}`}>
                            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-500 truncate">{alerta.accionante}</p>
                            <p className="text-xs text-muted truncate">vs. {alerta.accionado}</p>
                            <p className="text-xs text-muted mt-0.5">{LABEL_TIPO[alerta.tipoTutela]}</p>
                          </div>
                          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Footer */}
              {count > 0 && (
                <div className="px-4 py-3 border-t border-border bg-gray-50">
                  <Link
                    href="/casos"
                    onClick={() => setOpen(false)}
                    className="text-xs text-primary-500 hover:underline font-medium"
                  >
                    Ver todos los casos →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar usuario */}
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
