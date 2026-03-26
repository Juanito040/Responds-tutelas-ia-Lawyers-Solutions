"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileEdit, Loader2, Calendar, User, Building, Upload, FileText, X, CheckCircle, Trash2, BadgeCheck } from "lucide-react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const LABEL_TIPO   = { SALUD:"Salud", TRABAJO:"Trabajo", EDUCACION:"Educación", PENSION:"Pensión", VIVIENDA:"Vivienda", DEBIDO_PROCESO:"Debido proceso", INTIMIDAD:"Intimidad", IGUALDAD:"Igualdad", OTRO:"Otro" };
const LABEL_ESTADO = { PENDIENTE:"Pendiente", EN_PROCESO:"En proceso", CONTESTADA:"Contestada", VENCIDA:"Vencida" };

export default function CasoDetallePage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [caso, setCaso]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGen]        = useState(false);
  const [genError, setGenError]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadMsg, setUploadMsg]   = useState("");
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting]     = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const fileInputRef                = useRef(null);

  useEffect(() => {
    fetch(`/api/casos/${id}`)
      .then(r => {
        if (r.status === 401) { signOut({ callbackUrl: "/login" }); return null; }
        return r.json();
      })
      .then(d => { if (d?.success) setCaso(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubirAuto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setUploading(true);
    setUploadMsg("");
    setUploadError("");
    const fd = new FormData();
    fd.append("archivo", archivo);
    const res  = await fetch(`/api/casos/${id}/auto`, { method: "POST", body: fd });
    if (res.status === 401) { signOut({ callbackUrl: "/login" }); return; }
    const data = await res.json();
    setUploading(false);
    if (data.success) {
      setUploadMsg(`Auto cargado: ${data.data.nombre} (${data.data.caracteres.toLocaleString()} caracteres)`);
      setCaso(prev => ({ ...prev, autoJuzgado: true, autoJuzgadoNombre: data.data.nombre }));
    } else {
      setUploadError(data.error?.message || "Error al procesar el PDF");
    }
    e.target.value = "";
  }

  async function handleEliminarAuto() {
    await fetch(`/api/casos/${id}/auto`, { method: "DELETE" });
    setCaso(prev => ({ ...prev, autoJuzgado: null, autoJuzgadoNombre: null }));
    setUploadMsg("");
  }

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
        <button
          onClick={handleEliminar}
          disabled={deleting}
          className="btn-ghost btn p-2 mt-1 text-red-400 hover:text-red-600 hover:bg-red-50"
          title="Eliminar caso"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Acción principal */}
      {genError && <div className="alert alert-error">{genError}</div>}

      {/* Sección: Auto del Juzgado */}
      <div className="card border-2 border-dashed border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-primary-500 mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Auto admisorio del juzgado
          <span className="text-xs font-normal text-muted">(opcional — mejora la contestación)</span>
        </h3>
        <p className="text-xs text-muted mb-3">
          Sube el PDF que envió el juzgado. La IA lo leerá y responderá puntualmente a lo que el juez solicita.
        </p>

        {caso.autoJuzgadoNombre ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{caso.autoJuzgadoNombre}</p>
              {uploadMsg && <p className="text-xs text-green-600">{uploadMsg}</p>}
            </div>
            <button onClick={handleEliminarAuto} className="btn-ghost btn p-1 text-red-400 hover:text-red-600" title="Eliminar auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {uploadError && <p className="text-xs text-red-600 mb-2">{uploadError}</p>}
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleSubirAuto} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-outline btn gap-2"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando PDF...</>
                : <><Upload className="w-4 h-4" /> Subir auto del juzgado (PDF)</>
              }
            </button>
          </div>
        )}
      </div>

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
            {caso.estado !== "CONTESTADA" && (
              <button
                onClick={handleMarcarContestada}
                disabled={markingDone}
                className="btn-outline btn text-green-700 border-green-300 hover:bg-green-50"
              >
                {markingDone
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
                  : <><BadgeCheck className="w-4 h-4" /> Marcar como contestada</>
                }
              </button>
            )}
            {caso.estado === "CONTESTADA" && (
              <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" /> Contestada
              </span>
            )}
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
