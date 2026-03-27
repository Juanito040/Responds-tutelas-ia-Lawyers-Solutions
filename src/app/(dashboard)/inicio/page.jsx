import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  Scale, FileUp, Cpu, FileText, CheckCircle2,
  PlusCircle, LayoutDashboard, BookOpen, Clock,
  ShieldCheck, Zap, Users, ArrowRight,
} from "lucide-react";

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  const nombre  = session?.user?.name?.split(" ")[0] ?? "abogado/a";

  return (
    <div className="max-w-4xl space-y-10">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0f172a" }}>
        <div className="flex flex-col md:flex-row">
          {/* Franja lateral dorada */}
          <div className="w-full md:w-2 shrink-0" style={{ background: "#b45309" }} />

          <div className="p-8 md:p-10 flex-1">
            <div className="flex items-center gap-2 mb-5">
              <Scale className="w-5 h-5" style={{ color: "#d97706" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                TutelaIA · Software Jurídico
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Bienvenido, {nombre}
            </h1>
            <p className="text-lg leading-relaxed mb-7" style={{ color: "#94a3b8" }}>
              Asistente de inteligencia artificial para la gestión y contestación
              de acciones de tutela. Diseñado para el ejercicio profesional del derecho en Colombia.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/casos/nuevo"
                className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
                style={{ background: "#b45309", color: "#fff" }}>
                <PlusCircle className="w-4 h-4" />
                Registrar tutela
              </Link>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.07)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}>
                <LayoutDashboard className="w-4 h-4" />
                Ir al dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── ¿Cómo funciona? ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: "#b45309" }} />
          <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>¿Cómo funciona?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              icon: FileUp,
              title: "Sube los documentos",
              desc: "Adjunta el auto admisorio y el escrito de tutela en PDF. La IA extrae los datos del caso automáticamente.",
              border: "#1e40af",
              num: "#1e40af",
            },
            {
              step: "02",
              icon: Cpu,
              title: "La IA redacta el borrador",
              desc: "Con un clic, el modelo genera una contestación jurídica completa basada en los hechos y derechos invocados.",
              border: "#b45309",
              num: "#b45309",
            },
            {
              step: "03",
              icon: FileText,
              title: "Revisa y exporta",
              desc: "Edita el borrador, ajusta lo necesario y descarga el documento en Word listo para radicar.",
              border: "#15803d",
              num: "#15803d",
            },
          ].map(({ step, icon: Icon, title, desc, border, num }) => (
            <div key={step} className="rounded-xl p-5 bg-white border-t-4 shadow-sm"
                 style={{ borderTopColor: border, borderColor: "#e2e8f0", borderWidth: "1px", borderTopWidth: "4px" }}>
              <span className="text-4xl font-black block mb-3" style={{ color: num, opacity: 0.15 }}>{step}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                   style={{ background: `${border}18` }}>
                <Icon className="w-4 h-4" style={{ color: border }} />
              </div>
              <h3 className="font-bold mb-1.5" style={{ color: "#0f172a" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Funcionalidades clave ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: "#b45309" }} />
          <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>¿Qué incluye?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Clock,
              title: "Alertas de vencimiento",
              desc: "Notificaciones por correo cuando una tutela está próxima a vencer. Calcula los 10 días hábiles del Decreto 2591 de forma automática.",
              color: "#991b1b",
            },
            {
              icon: Zap,
              title: "Generación con IA en segundos",
              desc: "Redacta contestaciones jurídicas completas adaptadas a los hechos específicos de cada caso usando modelos de lenguaje avanzados.",
              color: "#b45309",
            },
            {
              icon: ShieldCheck,
              title: "Datos seguros y privados",
              desc: "Cada usuario accede únicamente a sus propios casos. Información cifrada con autenticación segura.",
              color: "#1e40af",
            },
            {
              icon: Users,
              title: "Gestión centralizada",
              desc: "Organiza, filtra y rastrea el estado de todas tus tutelas activas desde un solo panel de control.",
              color: "#15803d",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex gap-4 rounded-xl p-5 bg-white border"
                 style={{ borderColor: "#e2e8f0" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: `${color}12` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm" style={{ color: "#0f172a" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marco legal ──────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 border" style={{ background: "#fefce8", borderColor: "#fde68a" }}>
        <div className="flex gap-3">
          <BookOpen className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#92400e" }} />
          <div>
            <h3 className="font-bold mb-1 text-sm" style={{ color: "#92400e" }}>Marco legal de referencia</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#78350f" }}>
              TutelaIA opera bajo el marco del <strong>Decreto 2591 de 1991</strong>.
              Calcula plazos en días <strong>hábiles</strong> y estructura las contestaciones conforme a la
              jurisprudencia de la Corte Constitucional. El borrador generado es una herramienta de apoyo —
              <strong> el criterio profesional del abogado es siempre determinante.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl p-6 border"
           style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
        <CheckCircle2 className="w-9 h-9 shrink-0" style={{ color: "#15803d" }} />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold" style={{ color: "#0f172a" }}>Estás listo para empezar</p>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Registra tu primera tutela y genera la contestación en minutos.
          </p>
        </div>
        <Link href="/casos/nuevo"
          className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-lg shrink-0 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ background: "#0f172a", color: "#fff" }}>
          Comenzar ahora
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
