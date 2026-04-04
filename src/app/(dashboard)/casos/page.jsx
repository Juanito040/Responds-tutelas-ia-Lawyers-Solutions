"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Search, ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";
import CasosSkeleton from "@/components/ui/CasosSkeleton";
import EmptyState from "@/components/ui/EmptyState";

const ESTADOS = ["", "PENDIENTE", "EN_PROCESO", "CONTESTADA", "VENCIDA"];
const TIPOS   = ["", "SALUD", "TRABAJO", "EDUCACION", "PENSION", "VIVIENDA", "DEBIDO_PROCESO", "OTRO"];
const LABEL_ESTADO = { PENDIENTE: "Pendiente", EN_PROCESO: "En proceso", CONTESTADA: "Contestada", VENCIDA: "Vencida" };
const LABEL_TIPO   = { SALUD: "Salud", TRABAJO: "Trabajo", EDUCACION: "Educación", PENSION: "Pensión", VIVIENDA: "Vivienda", DEBIDO_PROCESO: "Debido proceso", OTRO: "Otro" };

const ESTADO_COLOR = {
  PENDIENTE:  { color: "#92400e", bg: "#fffbeb" },
  EN_PROCESO: { color: "#1e40af", bg: "#eff6ff" },
  CONTESTADA: { color: "#166534", bg: "#f0fdf4" },
  VENCIDA:    { color: "#991b1b", bg: "#fef2f2" },
};

const T = {
  ink:    "#1A1A18",
  green:  "#1B3528",
  border: "#D8D2CA",
  muted:  "#7A7268",
  light:  "#A89E93",
  bg:     "#F7F3EE",
};

function UrgencyDot({ dias }) {
  const color = dias <= 0 ? "#9CA3AF"
    : dias <= 3 ? "#C0392B"
    : dias <= 5 ? "#F39C12"
    : "#27AE60";
  return <div style={{ width: "8px", height: "8px", borderRadius: "9999px", background: color, flexShrink: 0 }} />;
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_COLOR[estado] || { color: T.muted, bg: T.bg };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600,
      padding: "2px 8px",
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}22`,
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>
      {LABEL_ESTADO[estado] || estado}
    </span>
  );
}

export default function CasosPage() {
  const [casos, setCasos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [estado, setEstado]   = useState("");
  const [tipo, setTipo]       = useState("");
  const [pagination, setPag]  = useState(null);
  const [page, setPage]       = useState(1);

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (search) params.set("search", search);
      if (estado) params.set("estado", estado);
      if (tipo)   params.set("tipo", tipo);

      const res = await fetch(`/api/casos?${params}`);
      if (res.status === 401) { signOut({ callbackUrl: "/login" }); return; }
      const data = await res.json();
      if (data.success) { setCasos(data.data); setPag(data.pagination); }
    } catch { /* error de red */ } finally { setLoading(false); }
  }, [page, search, estado, tipo]);

  useEffect(() => { fetchCasos(); }, [fetchCasos]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCasos(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const hasFilters = estado || tipo || search;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <section style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        paddingBottom: "24px", borderBottom: `1px solid ${T.border}`,
        marginBottom: "0", gap: "16px", flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "6px" }}>
            Gestión
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 700, lineHeight: 1.1, color: T.ink,
          }}>
            Mis tutelas
          </h1>
        </div>

        <Link
          href="/casos/nuevo"
          className="press"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: T.green, color: "#fff",
            padding: "11px 22px", fontSize: "13px", fontWeight: 600,
            textDecoration: "none", flexShrink: 0,
          }}
        >
          <PlusCircle style={{ width: "14px", height: "14px" }} />
          Nueva tutela
        </Link>
      </section>

      {/* ── Barra de búsqueda y filtros ──────────────────────────── */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        alignItems: "center",
        gap: "10px",
        padding: "16px 0",
        borderBottom: `1px solid ${T.border}`,
      }}>
        {/* Buscador */}
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: T.muted, pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Buscar por nombre, accionado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", height: "36px",
              paddingLeft: "34px", paddingRight: "12px",
              border: `1px solid ${T.border}`,
              background: "#fff", fontSize: "13px", color: T.ink,
              outline: "none", fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.15s",
            }}
            onFocus={e  => e.target.style.borderColor = T.green}
            onBlur={e   => e.target.style.borderColor = T.border}
          />
        </div>

        {/* Filtro estado */}
        <select
          value={estado}
          onChange={e => { setEstado(e.target.value); setPage(1); }}
          style={{ height: "36px", padding: "0 10px", border: `1px solid ${T.border}`, background: "#fff", fontSize: "12px", color: estado ? T.ink : T.muted, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" }}
        >
          <option value="">Estado</option>
          {ESTADOS.slice(1).map(e => <option key={e} value={e}>{LABEL_ESTADO[e]}</option>)}
        </select>

        {/* Filtro tipo */}
        <select
          value={tipo}
          onChange={e => { setTipo(e.target.value); setPage(1); }}
          style={{ height: "36px", padding: "0 10px", border: `1px solid ${T.border}`, background: "#fff", fontSize: "12px", color: tipo ? T.ink : T.muted, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" }}
        >
          <option value="">Tipo</option>
          {TIPOS.slice(1).map(t => <option key={t} value={t}>{LABEL_TIPO[t]}</option>)}
        </select>

        {/* Limpiar / total */}
        {hasFilters ? (
          <button
            onClick={() => { setEstado(""); setTipo(""); setSearch(""); setPage(1); }}
            style={{ height: "36px", padding: "0 12px", fontSize: "12px", color: T.muted, background: "none", border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
          >
            Limpiar ×
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: T.light, whiteSpace: "nowrap", paddingLeft: "4px" }}>
            {pagination ? `${pagination.total} tutela${pagination.total !== 1 ? "s" : ""}` : ""}
          </span>
        )}
      </section>

      {/* ── Encabezado de columnas ───────────────────────────────── */}
      {!loading && casos.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "8px 1fr 160px 120px 130px 24px",
          gap: "16px", alignItems: "center",
          padding: "10px 0 10px 0",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div />
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.light }}>Caso</span>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.light }}>Tipo</span>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.light }}>Estado</span>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.light }}>Vence</span>
          <div />
        </div>
      )}

      {/* ── Lista ─────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <CasosSkeleton rows={6} />
        ) : casos.length === 0 ? (
          <EmptyState
            title="No hay tutelas"
            description="Registra tu primera tutela para comenzar a usar TutelaIA."
            actionLabel="Registrar tutela"
            actionHref="/casos/nuevo"
          />
        ) : (
          <>
            {casos.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "8px 1fr 160px 120px 130px 24px",
                  gap: "16px", alignItems: "center",
                  padding: "15px 0",
                  borderBottom: `1px solid ${T.border}`,
                  textDecoration: "none",
                  transition: "padding-left 0.18s cubic-bezier(0.4,0,0.2,1), background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.paddingLeft = "8px"; e.currentTarget.style.background = "rgba(27,53,40,0.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.paddingLeft = "0";   e.currentTarget.style.background = "transparent"; }}
              >
                <UrgencyDot dias={caso.diasRestantes} />

                {/* Nombre */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px" }}>
                    {caso.accionante}
                  </p>
                  <p style={{ fontSize: "12px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    vs. {caso.accionado}
                  </p>
                </div>

                {/* Tipo */}
                <span style={{ fontSize: "12px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {LABEL_TIPO[caso.tipoTutela] || caso.tipoTutela}
                </span>

                {/* Estado */}
                <EstadoBadge estado={caso.estado} />

                {/* Días restantes */}
                <DiasRestantesBadge dias={caso.diasRestantes} />

                {/* Arrow */}
                <ArrowRight style={{ width: "13px", height: "13px", color: T.light, justifySelf: "end" }} />
              </Link>
            ))}

            {/* Paginación */}
            {pagination && pagination.total_pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", paddingTop: "28px" }}>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.has_prev}
                  className={pagination.has_prev ? "press-outline" : ""}
                  style={{ fontSize: "13px", color: pagination.has_prev ? T.green : T.light, background: "none", border: `1px solid ${T.border}`, padding: "7px 16px", cursor: pagination.has_prev ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: "12px", color: T.muted }}>
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.has_next}
                  className={pagination.has_next ? "press-outline" : ""}
                  style={{ fontSize: "13px", color: pagination.has_next ? T.green : T.light, background: "none", border: `1px solid ${T.border}`, padding: "7px 16px", cursor: pagination.has_next ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
