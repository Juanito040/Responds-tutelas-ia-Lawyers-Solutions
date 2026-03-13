"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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

export default function NuevoCasoPage() {
  const router = useRouter();
  const [form, setForm]         = useState(INITIAL);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState("");

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

  const field = (name, label, required = false) => (
    <div>
      <label className="label" htmlFor={name}>{label}{required && <span className="text-accent-500 ml-0.5">*</span>}</label>
      <input id={name} name={name} value={form[name]} onChange={handle} className={errors[name] ? "input-error" : "input"} disabled={loading} />
      {errors[name] && <p className="error-msg">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/casos" className="btn-ghost btn p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h2 className="page-title">Nueva tutela</h2>
          <p className="page-subtitle">Registra los datos para generar la contestación con IA</p>
        </div>
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
              <label className="label" htmlFor="tipoTutela">Tipo de tutela</label>
              <select id="tipoTutela" name="tipoTutela" value={form.tipoTutela} onChange={handle} className="input" disabled={loading}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="fechaNotificacion">
                Fecha de notificación<span className="text-accent-500 ml-0.5">*</span>
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
        <div className="flex gap-3 justify-end">
          <Link href="/casos" className="btn-outline btn">Cancelar</Link>
          <button type="submit" className="btn-primary btn btn-lg" disabled={loading}>
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
