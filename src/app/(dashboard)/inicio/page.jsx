import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  PlusCircle, ArrowRight,
  FileUp, Cpu, FileText,
  Clock, Zap, ShieldCheck, Users,
} from "lucide-react";

const T = {
  ink:      "#1A1A18",
  green:    "#1B3528",
  greenMid: "#2A5240",
  cream:    "#F7F3EE",
  border:   "#D8D2CA",
  muted:    "#7A7268",
  light:    "#A89E93",
  gold:     "#A8895A",
  white:    "#FFFFFF",
};

const STEPS = [
  { n: "1", icon: FileUp,   title: "Sube los documentos",       desc: "Adjunta el auto admisorio y el escrito de tutela en PDF. La IA extrae los datos automáticamente." },
  { n: "2", icon: Cpu,      title: "La IA redacta el borrador", desc: "Con un clic, el modelo genera una contestación jurídica completa basada en los hechos y derechos invocados." },
  { n: "3", icon: FileText, title: "Revisa y exporta",          desc: "Edita el borrador, ajusta lo necesario y descarga el documento en Word listo para radicar." },
];

const FEATURES = [
  { icon: Clock,       title: "Alertas de vencimiento",    desc: "Notificaciones automáticas basadas en los 10 días hábiles del Decreto 2591 de 1991." },
  { icon: Zap,         title: "Generación IA en segundos", desc: "Redacta contestaciones completas adaptadas a los hechos específicos de cada caso." },
  { icon: ShieldCheck, title: "Datos seguros y privados",  desc: "Cada usuario accede únicamente a sus propios casos, con autenticación cifrada." },
  { icon: Users,       title: "Gestión centralizada",      desc: "Filtra y rastrea el estado de todas tus tutelas activas desde un solo panel." },
];

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  const nombre   = session?.user?.name?.split(" ")[0] ?? "abogado";
  const apellido = session?.user?.name?.split(" ")[2] ?? "";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ── Fila 1: Hero | Cómo funciona ─────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr",
        gap: 0,
        borderBottom: `1px solid ${T.border}`,
        paddingBottom: "48px",
      }}>

        {/* Hero */}
        <section style={{ paddingRight: "48px" }}>
          <p style={{
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.light, marginBottom: "22px",
          }}>
            Bienvenido, {nombre} {apellido}
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "clamp(36px, 4vw, 58px)",
            fontWeight: 700, lineHeight: 1.06,
            letterSpacing: "-0.025em",
            color: T.ink, marginBottom: "20px",
          }}>
            Contestaciones de tutelas en minutos,<br />
            <em style={{ color: T.green, fontStyle: "italic" }}> no en horas.</em>
          </h1>

          <p style={{
            fontSize: "15px", color: T.muted,
            lineHeight: 1.75, marginBottom: "36px",
          }}>
            Asistente de inteligencia artificial para la gestión y contestación
            de acciones de tutela. Diseñado para el ejercicio profesional del
            derecho en Colombia.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/casos/nuevo"
              className="press"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: T.green, color: T.white,
                padding: "13px 26px", fontSize: "14px", fontWeight: 600,
                textDecoration: "none", letterSpacing: "0.01em",
              }}
            >
              <PlusCircle style={{ width: "15px", height: "15px" }} />
              Registrar tutela
            </Link>
            <Link
              href="/dashboard"
              className="press-outline"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                color: T.ink, padding: "13px 26px", fontSize: "14px",
                fontWeight: 500, textDecoration: "none",
                border: `1px solid ${T.border}`, background: "transparent",
              }}
            >
              Ver dashboard
              <ArrowRight style={{ width: "14px", height: "14px" }} />
            </Link>
          </div>
        </section>

        {/* Divisor vertical */}
        <div style={{ background: T.border, margin: "0 0" }} />

        {/* Cómo funciona */}
        <section style={{ paddingLeft: "48px" }}>
          <p style={{
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.light, marginBottom: "32px",
          }}>
            Cómo funciona
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} style={{
                display: "flex", gap: "18px", alignItems: "flex-start",
                paddingBottom: i < 2 ? "28px" : "0",
                marginBottom: i < 2 ? "28px" : "0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garant', serif",
                  fontSize: "52px", fontWeight: 700,
                  color: "#EBE5DC", lineHeight: 1,
                  flexShrink: 0, userSelect: "none",
                  minWidth: "38px",
                }}>
                  {n}
                </span>
                <div style={{ paddingTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Icon style={{ width: "15px", height: "15px", color: T.green, flexShrink: 0 }} />
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: T.ink }}>
                      {title}
                    </h3>
                  </div>
                  <p style={{ fontSize: "13px", color: T.muted, lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Fila 2: Funcionalidades | Marco legal ────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr",
        gap: 0,
        paddingTop: "48px",
      }}>

        {/* Funcionalidades */}
        <section style={{ paddingRight: "48px" }}>
          <p style={{
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.light, marginBottom: "32px",
          }}>
            Qué incluye
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} style={{
                padding: "20px",
                paddingLeft: i % 2 === 1 ? "28px" : "0",
                paddingRight: i % 2 === 0 ? "28px" : "0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                borderRight:  i % 2 === 0 ? `1px solid ${T.border}` : "none",
                paddingTop: i >= 2 ? "24px" : "0",
              }}>
                <Icon style={{ width: "17px", height: "17px", color: T.green, marginBottom: "10px" }} />
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: T.ink, marginBottom: "5px" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "12px", color: T.muted, lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divisor vertical */}
        <div style={{ background: T.border }} />

        {/* Marco legal */}
        <section style={{
          paddingLeft: "48px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <p style={{
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.light, marginBottom: "32px",
          }}>
            Marco legal
          </p>

          <div style={{ display: "flex", gap: "22px", alignItems: "stretch" }}>
            <div style={{ width: "3px", background: T.gold, flexShrink: 0, borderRadius: "2px" }} />
            <div>
              <p style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "20px", fontStyle: "italic",
                color: "#3A3630", lineHeight: 1.6,
                marginBottom: "18px",
              }}>
                "TutelaIA opera bajo el marco del{" "}
                <strong style={{ fontStyle: "normal" }}>Decreto 2591 de 1991</strong>.
                Calcula plazos en días hábiles y estructura las contestaciones
                conforme a la jurisprudencia de la Corte Constitucional."
              </p>
              <p style={{
                fontSize: "12px", color: T.muted, lineHeight: 1.65,
                marginBottom: "18px",
              }}>
                El borrador generado es una herramienta de apoyo.
                El criterio profesional del abogado es siempre determinante.
              </p>
              <p style={{
                fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: T.light,
              }}>
                
              </p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
