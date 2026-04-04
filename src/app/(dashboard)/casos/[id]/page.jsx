"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles, FileEdit, Loader2,
  Calendar, User, Building, CheckCircle, Trash2, BadgeCheck,
} from "lucide-react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const LABEL_TIPO   = { SALUD:"Salud", TRABAJO:"Trabajo", EDUCACION:"Educación", PENSION:"Pensión", VIVIENDA:"Vivienda", DEBIDO_PROCESO:"Debido proceso", INTIMIDAD:"Intimidad", IGUALDAD:"Igualdad", OTRO:"Otro" };
const LABEL_ESTADO = { PENDIENTE:"Pendiente", EN_PROCESO:"En proceso", CONTESTADA:"Contestada", VENCIDA:"Vencida" };
const ESTADO_COLOR = {
  PENDIENTE:  { color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  EN_PROCESO: { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  CONTESTADA: { color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  VENCIDA:    { color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
};

const T = {
  ink:    "#1A1A18",
  green:  "#1B3528",
  border: "#D8D2CA",
  muted:  "#7A7268",
  light:  "#A89E93",
  gold:   "#A8895A",
  bg:     "#F7F3EE",
};

export default function CasoDetallePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [caso, setCaso]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [generating, setGen]          = useState(false);
  const [genError, setGenError]       = useState("");
  const [deleting, setDeleting]       = useState(false);
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    fetch(`/api/casos/${id}`)
      .then(r => {
        if (r.status === 401) { signOut({ callbackUrl: "/login" }); return null; }
        return r.json();
      })
      .then(d => { if (d?.success) setCaso(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEliminar() {
    if (!window.confirm("¿Eliminar este caso? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await fetch(`/api/casos/${id}`, { method: "DELETE" });
    router.push("/casos");
  }

  async function handleMarcarContestada() {
    setMarkingDone(true);
    const res = await fetch(`/api/casos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "CONTESTADA" }),
    });
    if (res.status === 401) { signOut({ callbackUrl: "/login" }); return; }
    const data = await res.json();
    setMarkingDone(false);
    if (data.success) setCaso(prev => ({ ...prev, estado: "CONTESTADA" }));
  }

  async function handleGenerar() {
    setGen(true);
    setGenError("");
    const res  = await fetch(`/api/casos/${id}/generar-contestacion`, { method: "POST" });
    if (res.status === 401) { signOut({ callbackUrl: "/login" }); return; }
    const data = await res.json();
    setGen(false);
    if (data.success) {
      router.push(`/contestacion/${data.data.contestacionId}`);
    } else {
      setGenError(data.error?.message || "Error al generar la contestación");
    }
  }

  if (loading) return <LoadingSpinner text="Cargando caso..." />;
  if (!caso)   return <div className="alert alert-error">Caso no encontrado.</div>;

  const tieneContestacion = !!caso.contestacion;
  const estadoCfg = ESTADO_COLOR[caso.estado] || { color: T.muted, bg: T.bg, border: T.border };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <section style={{ paddingBottom: "24px", borderBottom: `1px solid ${T.border}`, marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "6px" }}>
                Expediente
              </p>
              <h1 style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 700, lineHeight: 1.1,
                color: T.ink, marginBottom: "6px",
              }}>
                {caso.accionante}
              </h1>
              <p style={{ fontSize: "14px", color: T.muted }}>vs. {caso.accionado}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginTop: "4px" }}>
            <DiasRestantesBadge dias={caso.diasRestantes} />
            <button
              onClick={handleEliminar} disabled={deleting} title="Eliminar caso"
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 14px",
                color: "#991b1b", background: "#fef2f2",
                border: "1px solid #fecaca",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 600,
                transition: "background 0.15s, border-color 0.15s, transform 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e  => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={e    => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            >
              {deleting
                ? <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} />
                : <Trash2  style={{ width: "13px", height: "13px" }} />
              }
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Layout dos columnas ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 340px", gap: 0, alignItems: "start" }}>

        {/* ── Columna izquierda: contenido jurídico ────────────── */}
        <div style={{ paddingRight: "40px" }}>

          {/* Hechos */}
          <section style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.light, marginBottom: "12px" }}>
              Hechos narrados por el accionante
            </p>
            <div style={{ background: T.bg, borderLeft: `3px solid ${T.border}`, padding: "18px 20px" }}>
              <p style={{ fontSize: "14px", color: T.ink, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {caso.hechos}
              </p>
            </div>
          </section>

          {/* Derechos */}
          <section>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.light, marginBottom: "12px" }}>
              Derechos fundamentales invocados
            </p>
            <div style={{ background: T.bg, borderLeft: `3px solid ${T.gold}`, padding: "18px 20px" }}>
              <p style={{ fontSize: "14px", color: T.ink, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {caso.derechosInvocados}
              </p>
            </div>
          </section>

        </div>

        {/* Divisor */}
        <div style={{ background: T.border, alignSelf: "stretch" }} />

        {/* ── Columna derecha: acción + metadatos ──────────────── */}
        <div style={{ paddingLeft: "40px", position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Error generación */}
          {genError && (
            <div style={{ padding: "12px 14px", background: "#fef2f2", borderLeft: "3px solid #C0392B", fontSize: "13px", color: "#991b1b" }}>
              {genError}
            </div>
          )}

          {/* Acción IA */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "16px" }}>
              Contestación con IA
            </p>

            {tieneContestacion ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  href={`/contestacion/${caso.contestacion.id}`}
                  className="press"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: T.green, color: "#fff", padding: "12px", fontSize: "14px", fontWeight: 700, textDecoration: "none", width: "100%" }}
                >
                  <FileEdit style={{ width: "15px", height: "15px" }} />
                  Ver / editar contestación
                </Link>
                <button
                  onClick={handleGenerar} disabled={generating}
                  className={!generating ? "press-outline" : ""}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "none", border: `1px solid ${T.border}`, color: T.ink, padding: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%" }}
                >
                  {generating ? <><Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> Generando...</> : <><Sparkles style={{ width: "14px", height: "14px" }} /> Regenerar borrador</>}
                </button>
                {caso.estado !== "CONTESTADA" && (
                  <button
                    onClick={handleMarcarContestada} disabled={markingDone}
                    className={!markingDone ? "press-outline" : ""}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "none", border: "1px solid #86efac", color: "#15803d", padding: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%" }}
                  >
                    {markingDone
                      ? <><Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> Actualizando...</>
                      : <><BadgeCheck style={{ width: "14px", height: "14px" }} /> Marcar como contestada</>
                    }
                  </button>
                )}
                {caso.estado === "CONTESTADA" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", background: "#f0fdf4", border: "1px solid #86efac" }}>
                    <CheckCircle style={{ width: "14px", height: "14px", color: "#15803d" }} />
                    <span style={{ fontSize: "13px", color: "#15803d", fontWeight: 600 }}>Contestada</span>
                  </div>
                )}
                <p style={{ fontSize: "11px", color: T.light, textAlign: "center", marginTop: "2px" }}>
                  Última actualización: {new Date(caso.contestacion.updatedAt).toLocaleDateString("es-CO")}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "13px", color: T.muted, marginBottom: "14px", lineHeight: 1.65 }}>
                  La IA generará un borrador jurídico completo basado en los hechos y derechos del caso.
                </p>
                <button
                  onClick={handleGenerar} disabled={generating}
                  className={!generating ? "press" : ""}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: T.green, color: "#fff", padding: "13px", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%", transition: "opacity 0.15s" }}
                >
                  {generating
                    ? <><Loader2 style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} /> Generando contestación...</>
                    : <><Sparkles style={{ width: "15px", height: "15px" }} /> Generar contestación con IA</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${T.border}` }} />

          {/* Metadatos */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "16px" }}>
              Datos del expediente
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { icon: Calendar, label: "Notificación", value: new Date(caso.fechaNotificacion).toLocaleDateString("es-CO"), urgent: false },
                { icon: Calendar, label: "Fecha límite",  value: new Date(caso.fechaLimite).toLocaleDateString("es-CO"), urgent: caso.diasRestantes <= 3 },
                { icon: Building, label: "Juzgado",       value: caso.juzgado || "—" },
                { icon: User,     label: "Juez",          value: caso.juez    || "—" },
              ].map(({ icon: Icon, label, value, urgent }, i, arr) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <Icon style={{ width: "13px", height: "13px", color: T.light, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.light, marginBottom: "1px" }}>{label}</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: urgent ? "#C0392B" : T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${T.border}` }} />

          {/* Tipo y estado */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", background: "#EEF4F1", color: T.green, border: "1px solid #9BBFAC" }}>
              {LABEL_TIPO[caso.tipoTutela]}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", background: estadoCfg.bg, color: estadoCfg.color, border: `1px solid ${estadoCfg.border}` }}>
              {LABEL_ESTADO[caso.estado]}
            </span>
            {caso.radicado && (
              <span style={{ fontSize: "11px", color: T.muted, padding: "4px 10px", border: `1px solid ${T.border}` }}>
                Rad. {caso.radicado}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
