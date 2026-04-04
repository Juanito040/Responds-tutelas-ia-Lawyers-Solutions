import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularDiasRestantes } from "@/utils/diasHabiles";
import Link from "next/link";
import { AlertTriangle, FolderOpen, PlusCircle } from "lucide-react";
import CasoRow from "@/components/ui/CasoRow";

const T = {
  ink:    "#1A1A18",
  green:  "#1B3528",
  border: "#D8D2CA",
  muted:  "#7A7268",
  light:  "#A89E93",
  gold:   "#A8895A",
  bg:     "#F7F3EE",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Traer todos los activos para calcular stats reales con diasRestantes
  const todosCasos = await prisma.caso.findMany({
    where:   { userId: session.user.id, isActive: true },
    orderBy: { fechaLimite: "asc" },
    select:  { id: true, accionante: true, accionado: true, tipoTutela: true, estado: true, fechaLimite: true },
  });

  // Calcular días restantes para cada caso
  const todosConDias = todosCasos.map(c => ({
    ...c,
    diasRestantes: calcularDiasRestantes(c.fechaLimite),
  }));

  // Conteo real: si el plazo venció y no está contestada → cuenta como VENCIDA
  const conteo = { PENDIENTE: 0, EN_PROCESO: 0, CONTESTADA: 0, VENCIDA: 0 };
  for (const c of todosConDias) {
    if (c.estado === "CONTESTADA") {
      conteo.CONTESTADA++;
    } else if (c.diasRestantes <= 0) {
      conteo.VENCIDA++;
    } else if (c.estado === "EN_PROCESO") {
      conteo.EN_PROCESO++;
    } else {
      conteo.PENDIENTE++;
    }
  }

  // Casos activos (no contestados) para la lista principal
  const casosConDias = todosConDias
    .filter(c => c.estado !== "CONTESTADA")
    .slice(0, 8);

  const urgentes = casosConDias.filter(c => c.diasRestantes <= 3 && c.estado !== "CONTESTADA");
  const nombre   = session.user.name?.split(" ")[0] ?? "abogado";

  const fecha = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <section style={{ paddingBottom: "28px", borderBottom: `1px solid ${T.border}`, marginBottom: "32px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "8px" }}>
          {fecha}
        </p>
      </section>

      {/* ── Alerta urgente (full-width) ──────────────────────────── */}
      {urgentes.length > 0 && (
        <div style={{ marginBottom: "32px", borderLeft: "3px solid #C0392B", background: "#fef2f2" }}>
          {/* Cabecera del bloque */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #fecaca" }}>
            <AlertTriangle style={{ width: "15px", height: "15px", color: "#C0392B", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b" }}>
              {urgentes.length === 1
                ? "1 tutela requiere respuesta urgente"
                : `${urgentes.length} tutelas requieren respuesta urgente`}
              {" "}— plazo legal: 10 días hábiles (Decreto 2591/1991)
            </p>
          </div>
          {/* Detalle por caso */}
          {urgentes.map((c, i) => (
            <Link
              key={c.id}
              href={`/casos/${c.id}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 18px", gap: "16px",
                borderBottom: i < urgentes.length - 1 ? "1px solid #fecaca" : "none",
                textDecoration: "none", transition: "background 0.15s",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#991b1b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                  {c.accionante} <span style={{ fontWeight: 400, color: "#b91c1c" }}>vs. {c.accionado}</span>
                </span>
              </div>
              <span style={{
                flexShrink: 0, fontSize: "11px", fontWeight: 700,
                padding: "3px 9px",
                background: c.diasRestantes <= 0 ? "#fca5a5" : "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fca5a5",
                letterSpacing: "0.04em",
              }}>
                {c.diasRestantes <= 0 ? "VENCIDA" : `${c.diasRestantes} día${c.diasRestantes !== 1 ? "s" : ""} hábil${c.diasRestantes !== 1 ? "es" : ""}`}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Layout principal: Lista | Panel derecho ──────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1px 340px",
        gap: 0,
        alignItems: "start",
      }}>

        {/* ── Columna izquierda: casos activos ─────────────────── */}
        <section style={{ paddingRight: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light }}>
              Tutelas activas más urgentes
            </p>
            <Link href="/casos" style={{ fontSize: "12px", fontWeight: 600, color: T.green, textDecoration: "none" }}>
              Ver todas 
            </Link>
          </div>

          {casosConDias.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", textAlign: "center" }}>
              <FolderOpen style={{ width: "32px", height: "32px", color: "#9BBFAC", marginBottom: "12px" }} />
              <p style={{ fontSize: "14px", color: T.muted }}>No hay tutelas activas. ¡Registra la primera!</p>
            </div>
          ) : (
            casosConDias.map((caso, i) => (
              <CasoRow key={caso.id} caso={caso} index={i} />
            ))
          )}
        </section>

        {/* Divisor */}
        <div style={{ background: T.border, alignSelf: "stretch" }} />

        {/* ── Columna derecha: stats + acción ──────────────────── */}
        <section style={{ paddingLeft: "40px" }}>

          {/* Stats 2×2 */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "24px" }}>
            Resumen
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "40px" }}>
            <StatItem label="Pendientes"  value={conteo.PENDIENTE}  color="#F39C12" last={false} />
            <StatItem label="En proceso"  value={conteo.EN_PROCESO} color="#3b82f6" last={false} />
            <StatItem label="Contestadas" value={conteo.CONTESTADA} color="#27AE60" last={false} />
            <StatItem label="Vencidas"    value={conteo.VENCIDA}    color="#C0392B" last={true}  />
          </div>

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: "32px" }} />

          {/* Acción rápida */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "16px" }}>
            Acción rápida
          </p>
          <p style={{ fontSize: "14px", fontWeight: 600, color: T.ink, marginBottom: "4px" }}>
            Registrar nueva tutela
          </p>
          <p style={{ fontSize: "13px", color: T.muted, marginBottom: "20px", lineHeight: 1.6 }}>
            Ingresa los datos y genera la contestación con inteligencia artificial.
          </p>
          <Link
            href="/casos/nuevo"
            className="press"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: T.green, color: "#fff",
              padding: "12px 22px", fontSize: "13px", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.01em", width: "100%",
              justifyContent: "center",
            }}
          >
            <PlusCircle style={{ width: "14px", height: "14px" }} />
            Nueva tutela
          </Link>
        </section>

      </div>
    </div>
  );
}

function StatItem({ label, value, color, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "14px 0",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
      gap: "14px",
    }}>
      {/* Indicador de color */}
      <div style={{
        width: "4px", height: "36px",
        background: color, flexShrink: 0,
        borderRadius: "2px",
      }} />

      {/* Etiqueta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "12px", fontWeight: 600,
          letterSpacing: "0.07em", textTransform: "uppercase",
          color: T.muted, marginBottom: "4px",
        }}>
          {label}
        </p>
        {/* Barra proporcional */}
        <div style={{ height: "4px", background: T.border, width: "100%" }}>
          <div style={{
            height: "100%",
            width: value > 0 ? `${Math.min(value * 14, 100)}%` : "4px",
            background: color, opacity: 0.5,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Número */}
      <p style={{
        fontFamily: "'Cormorant Garant', serif",
        fontSize: "36px", fontWeight: 700,
        color: T.ink, lineHeight: 1,
        minWidth: "36px", textAlign: "right", flexShrink: 0,
      }}>
        {value}
      </p>
    </div>
  );
}
