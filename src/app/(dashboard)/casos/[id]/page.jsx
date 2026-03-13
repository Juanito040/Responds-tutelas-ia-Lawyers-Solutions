"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileEdit, Loader2, Calendar, User, Building } from "lucide-react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const LABEL_TIPO   = { SALUD:"Salud", TRABAJO:"Trabajo", EDUCACION:"Educación", PENSION:"Pensión", VIVIENDA:"Vivienda", DEBIDO_PROCESO:"Debido proceso", INTIMIDAD:"Intimidad", IGUALDAD:"Igualdad", OTRO:"Otro" };
const LABEL_ESTADO = { PENDIENTE:"Pendiente", EN_PROCESO:"En proceso", CONTESTADA:"Contestada", VENCIDA:"Vencida" };

export default function CasoDetallePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [caso, setCaso]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGen]    = useState(false);
  const [genError, setGenError] = useState("");

  useEffect(() => {
    fetch(`/api/casos/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setCaso(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerar() {
    setGen(true);
    setGenError("");
    const res  = await fetch(`/api/casos/${id}/generar-contestacion`, { method: "POST" });
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

  return (
    <div className="max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <Link href="/casos" className="btn-ghost btn p-2 mt-1"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="page-title">{caso.accionante}</h2>
            <DiasRestantesBadge dias={caso.diasRestantes} />
          </div>
          <p className="page-subtitle">vs. {caso.accionado}</p>
        </div>
      </div>

      {/* Acción principal */}
      {genError && <div className="alert alert-error">{genError}</div>}

      <div className="card bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-500" /> Contestación con Inteligencia Artificial
        </h3>
        {tieneContestacion ? (
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/contestacion/${caso.contestacion.id}`} className="btn-primary btn">
              <FileEdit className="w-4 h-4" /> Editar contestación
            </Link>
            <button onClick={handleGenerar} disabled={generating} className="btn-outline btn">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Sparkles className="w-4 h-4" /> Regenerar con IA</>}
            </button>
            <p className="text-xs text-muted">Última actualización: {new Date(caso.contestacion.updatedAt).toLocaleDateString("es-CO")}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted mb-3">La IA generará un borrador jurídico completo basado en los datos del caso.</p>
            <button onClick={handleGenerar} disabled={generating} className="btn-primary btn btn-lg">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando contestación...</>
                : <><Sparkles className="w-4 h-4" /> Generar contestación con IA</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Datos del caso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={Calendar} label="Fecha de notificación" value={new Date(caso.fechaNotificacion).toLocaleDateString("es-CO")} />
        <InfoCard icon={Calendar} label="Fecha límite" value={new Date(caso.fechaLimite).toLocaleDateString("es-CO")} urgent={caso.diasRestantes <= 3} />
        <InfoCard icon={Building} label="Juzgado" value={caso.juzgado || "No especificado"} />
        <InfoCard icon={User}     label="Juez" value={caso.juez || "No especificado"} />
      </div>

      <div className="card space-y-4">
        <div>
          <p className="label">Tipo de tutela</p>
          <span className="badge badge-progress">{LABEL_TIPO[caso.tipoTutela]}</span>
          <span className="ml-2 badge badge-pending">{LABEL_ESTADO[caso.estado]}</span>
        </div>
        {caso.radicado && (
          <div>
            <p className="label">Radicado</p>
            <p className="text-sm text-primary-500">{caso.radicado}</p>
          </div>
        )}
        <div>
          <p className="label">Hechos</p>
          <p className="text-sm text-primary-500 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{caso.hechos}</p>
        </div>
        <div>
          <p className="label">Derechos invocados</p>
          <p className="text-sm text-primary-500 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{caso.derechosInvocados}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, urgent }) {
  return (
    <div className={`card flex items-start gap-3 ${urgent ? "border-red-200 bg-red-50" : ""}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${urgent ? "text-red-500" : "text-muted"}`} />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className={`text-sm font-medium ${urgent ? "text-red-700" : "text-primary-500"}`}>{value}</p>
      </div>
    </div>
  );
}
