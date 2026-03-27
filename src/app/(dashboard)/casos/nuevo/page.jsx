"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, FileUp, CheckCircle2, AlertCircle, X, FileBadge, FileText } from "lucide-react";
import Link from "next/link";

const TIPOS = [
  { value: "SALUD",          label: "Salud" },
  { value: "TRABAJO",        label: "Trabajo" },
  { value: "EDUCACION",      label: "Educación" },
  { value: "PENSION",        label: "Pensión" },
  { value: "VIVIENDA",       label: "Vivienda" },
  { value: "DEBIDO_PROCESO", label: "Debido proceso" },
  { value: "INTIMIDAD",      label: "Intimidad" },
  { value: "IGUALDAD",       label: "Igualdad" },
  { value: "OTRO",           label: "Otro" },
];

const INITIAL = {
  accionante: "", accionado: "", hechos: "", derechosInvocados: "",
  tipoTutela: "OTRO", juez: "", juzgado: "", radicado: "", fechaNotificacion: "",
};

const CAMPO_LABELS = {
  accionante: "Accionante", accionado: "Accionado", tipoTutela: "Tipo de tutela",
  juez: "Juez", juzgado: "Juzgado", radicado: "Radicado",
  fechaNotificacion: "Fecha de notificación", hechos: "Hechos", derechosInvocados: "Derechos invocados",
};

export default function NuevoCasoPage() {
  const router = useRouter();
  const autoRef   = useRef(null);
  const tutelaRef = useRef(null);

  const [form, setForm]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");

  // Estado extracción PDF
  const [extracting, setExtracting]           = useState(false);
  const [extractError, setExtractError]       = useState("");
  const [camposExtraidos, setCamposExtraidos] = useState([]);
  const [archivoAuto, setArchivoAuto]         = useState(null); // File object
  const [archivoTutela, setArchivoTutela]     = useState(null); // File object
  const [extraido, setExtraido]               = useState(false);

  function validate() {
    const e = {};
    if (!form.accionante.trim())        e.accionante        = "Requerido";
    if (!form.accionado.trim())         e.accionado         = "Requerido";
    if (!form.hechos.trim())            e.hechos            = "Requerido";
    if (form.hechos.trim().length < 20) e.hechos            = "Describe los hechos con más detalle";
    if (!form.derechosInvocados.trim()) e.derechosInvocados = "Requerido";
    if (!form.fechaNotificacion)        e.fechaNotificacion = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const res  = await fetch("/api/casos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.details) setErrors(data.error.details);
        else setServerError(data.error?.message || "Error al guardar el caso");
        setLoading(false);
        return;
      }

      router.push(`/casos/${data.data.id}`);
    } catch {
      setServerError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  function handle(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  function handleFileSelect(tipo, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tipo === "auto")   setArchivoAuto(file);
    if (tipo === "tutela") setArchivoTutela(file);
    setExtractError("");
    setExtraido(false);
    setCamposExtraidos([]);
  }

  async function procesarAmbosDocumentos() {
    if (!archivoAuto || !archivoTutela) return;

    setExtracting(true);
    setExtractError("");
    setCamposExtraidos([]);

    const fd = new FormData();
    fd.append("auto",   archivoAuto);
    fd.append("tutela", archivoTutela);

    try {
      const res  = await fetch("/api/casos/extraer", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error?.message || "Error al procesar los PDFs");
        return;
      }

      const { camposEncontrados, ...extraidos } = data.data;
      setForm(prev => ({ ...prev, ...extraidos }));
      setCamposExtraidos(camposEncontrados ?? Object.keys(extraidos).filter(k => extraidos[k]));
      setExtraido(true);
      setErrors(prev => {
        const next = { ...prev };
        (camposEncontrados ?? []).forEach(k => { delete next[k]; });
        return next;
      });
    } catch {
      setExtractError("Error de conexión al procesar los PDFs.");
    } finally {
      setExtracting(false);
    }
  }

  function limpiarExtraccion() {
    setForm(INITIAL);
    setCamposExtraidos([]);
    setArchivoAuto(null);
    setArchivoTutela(null);
    setExtraido(false);
    setExtractError("");
    if (autoRef.current)   autoRef.current.value   = "";
    if (tutelaRef.current) tutelaRef.current.value = "";
  }

  const field = (name, label, required = false) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required && <span className="text-accent-500 ml-0.5">*</span>}
        {camposExtraidos.includes(name) && (
          <span className="ml-2 text-xs text-green-600 font-medium">✓ extraído del PDF</span>
        )}
      </label>
      <input
        id={name} name={name} value={form[name]} onChange={handle}
        className={errors[name] ? "input-error" : "input"}
        disabled={loading}
      />
      {errors[name] && <p className="error-msg">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="page-title">Nueva tutela</h2>
          <p className="page-subtitle">Registra los datos para generar la contestación con IA</p>
        </div>
      </div>

      {/* ── Carga automática desde PDF ─────────────────────────────────── */}
      <div className="card mb-6 border-2 border-dashed border-primary-200 bg-primary-50/30 space-y-4">
        <div>
          <p className="font-semibold text-primary-700 flex items-center gap-2">
            <FileUp className="w-4 h-4" /> Cargar documentos del caso
            <span className="text-accent-500 text-xs font-normal ml-1">(obligatorio)</span>
          </p>
          <p className="text-sm text-muted mt-0.5">
            Sube ambos PDFs y la IA extraerá todos los datos automáticamente.
          </p>
        </div>

        {/* Los dos inputs de archivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Auto admisorio */}
          <div>
            <input ref={autoRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => handleFileSelect("auto", e)} disabled={extracting || loading} />
            <button type="button" onClick={() => autoRef.current?.click()}
              disabled={extracting || loading}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors
                ${archivoAuto
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-primary-200 bg-white hover:border-primary-400 text-muted"}`}
            >
              <FileBadge className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide">Auto admisorio</p>
                <p className="text-xs truncate mt-0.5">
                  {archivoAuto ? archivoAuto.name : "Haz clic para seleccionar PDF"}
                </p>
              </div>
              {archivoAuto && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-auto" />}
            </button>
          </div>

          {/* Escrito de tutela */}
          <div>
            <input ref={tutelaRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => handleFileSelect("tutela", e)} disabled={extracting || loading} />
            <button type="button" onClick={() => tutelaRef.current?.click()}
              disabled={extracting || loading}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors
                ${archivoTutela
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-primary-200 bg-white hover:border-primary-400 text-muted"}`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide">Escrito de tutela</p>
                <p className="text-xs truncate mt-0.5">
                  {archivoTutela ? archivoTutela.name : "Haz clic para seleccionar PDF"}
                </p>
              </div>
              {archivoTutela && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-auto" />}
            </button>
          </div>
        </div>

        {/* Botón procesar — activo solo cuando ambos están listos */}
        {!extraido && (
          <button type="button" onClick={procesarAmbosDocumentos}
            disabled={!archivoAuto || !archivoTutela || extracting || loading}
            className="btn btn-primary w-full"
          >
            {extracting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Extrayendo datos con IA...</>
              : !archivoAuto || !archivoTutela
                ? "Selecciona ambos documentos para continuar"
                : <><FileUp className="w-4 h-4" /> Extraer datos automáticamente</>
            }
          </button>
        )}

        {/* Resultado exitoso */}
        {extraido && camposExtraidos.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm text-green-700">
              <span className="font-medium">¡{camposExtraidos.length} campos extraídos exitosamente!</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {camposExtraidos.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    {CAMPO_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-green-600">Revisa los campos antes de guardar. Puedes editarlos libremente.</p>
            </div>
            <button onClick={limpiarExtraccion} className="text-green-500 hover:text-green-700" title="Reiniciar">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error */}
        {extractError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {extractError}
          </div>
        )}
      </div>

      {serverError && <div className="alert alert-error mb-4">{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Partes */}
        <div className="card">
          <h3 className="font-semibold text-primary-500 mb-4">Partes del proceso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("accionante", "Accionante (demandante)", true)}
            {field("accionado",  "Accionado (tu representado)", true)}
          </div>
        </div>

        {/* Datos del juzgado */}
        <div className="card">
          <h3 className="font-semibold text-primary-500 mb-4">Datos del juzgado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field("juez",    "Juez")}
            {field("juzgado", "Juzgado")}
            {field("radicado","Radicado")}
          </div>
        </div>

        {/* Tipo y fecha */}
        <div className="card">
          <h3 className="font-semibold text-primary-500 mb-4">Clasificación y plazos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="tipoTutela">
                Tipo de tutela
                {camposExtraidos.includes("tipoTutela") && (
                  <span className="ml-2 text-xs text-green-600 font-medium">✓ extraído del PDF</span>
                )}
              </label>
              <select id="tipoTutela" name="tipoTutela" value={form.tipoTutela} onChange={handle} className="input" disabled={loading}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="fechaNotificacion">
                Fecha de notificación<span className="text-accent-500 ml-0.5">*</span>
                {camposExtraidos.includes("fechaNotificacion") && (
                  <span className="ml-2 text-xs text-green-600 font-medium">✓ extraído del PDF</span>
                )}
              </label>
              <input
                id="fechaNotificacion" name="fechaNotificacion" type="date"
                value={form.fechaNotificacion} onChange={handle}
                className={errors.fechaNotificacion ? "input-error" : "input"}
                max={new Date().toISOString().split("T")[0]}
                disabled={loading}
              />
              {errors.fechaNotificacion && <p className="error-msg">{errors.fechaNotificacion}</p>}
              <p className="text-xs text-muted mt-1">El sistema calculará automáticamente los 10 días hábiles</p>
            </div>
          </div>
        </div>

        {/* Contenido jurídico */}
        <div className="card">
          <h3 className="font-semibold text-primary-500 mb-4">Contenido jurídico</h3>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="hechos">
                Hechos narrados por el accionante<span className="text-accent-500 ml-0.5">*</span>
                {camposExtraidos.includes("hechos") && (
                  <span className="ml-2 text-xs text-green-600 font-medium">✓ extraído del PDF</span>
                )}
              </label>
              <textarea
                id="hechos" name="hechos" rows={6}
                value={form.hechos} onChange={handle}
                className={`${errors.hechos ? "input-error" : "input"} resize-y`}
                placeholder="Describe los hechos tal como aparecen en la tutela recibida..."
                disabled={loading}
              />
              {errors.hechos && <p className="error-msg">{errors.hechos}</p>}
              <p className="text-xs text-muted mt-1">{form.hechos.length} caracteres — Cuantos más detalles, mejor será la contestación generada por la IA</p>
            </div>
            <div>
              <label className="label" htmlFor="derechosInvocados">
                Derechos fundamentales invocados<span className="text-accent-500 ml-0.5">*</span>
                {camposExtraidos.includes("derechosInvocados") && (
                  <span className="ml-2 text-xs text-green-600 font-medium">✓ extraído del PDF</span>
                )}
              </label>
              <textarea
                id="derechosInvocados" name="derechosInvocados" rows={3}
                value={form.derechosInvocados} onChange={handle}
                className={`${errors.derechosInvocados ? "input-error" : "input"} resize-y`}
                placeholder="Ej: Derecho a la salud (Art. 49 CP), Derecho a la vida (Art. 11 CP)..."
                disabled={loading}
              />
              {errors.derechosInvocados && <p className="error-msg">{errors.derechosInvocados}</p>}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 justify-end items-center">
          {!extraido && (
            <p className="text-sm text-muted mr-auto">
              Sube y procesa los dos documentos para poder guardar.
            </p>
          )}
          <Link href="/casos" className="btn-outline btn">Cancelar</Link>
          <button type="submit" className="btn-primary btn btn-lg" disabled={loading || !extraido}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : <><Save className="w-4 h-4" /> Guardar tutela</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
