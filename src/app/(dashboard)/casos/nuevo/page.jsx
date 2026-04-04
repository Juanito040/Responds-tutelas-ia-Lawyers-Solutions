"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, FileUp, CheckCircle2, AlertCircle, X, FileBadge, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

const T = {
  ink:    "#1A1A18",
  green:  "#1B3528",
  border: "#D8D2CA",
  muted:  "#7A7268",
  light:  "#A89E93",
  bg:     "#F7F3EE",
  gold:   "#A8895A",
};

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

const inputStyle = (hasError) => ({
  width: "100%", height: "42px", padding: "0 12px",
  border: `1px solid ${hasError ? "#C0392B" : T.border}`,
  background: "#fff", fontSize: "14px", color: T.ink,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none", transition: "border-color 0.15s",
});

const textareaStyle = (hasError) => ({
  width: "100%", padding: "10px 12px",
  border: `1px solid ${hasError ? "#C0392B" : T.border}`,
  background: "#fff", fontSize: "14px", color: T.ink,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none", resize: "vertical", lineHeight: 1.65,
  transition: "border-color 0.15s",
});

const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "#4A6A58", marginBottom: "6px",
};

const sectionLabel = {
  fontSize: "11px", fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: T.light, marginBottom: "18px", display: "block",
};

/* ── Indicador de pasos ───────────────────────────────────────── */
function StepIndicator({ step }) {
  const steps = ["Documentos", "Procesando", "Revisión"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "40px" }}>
      {steps.map((label, i) => {
        const num     = i + 1;
        const active  = step === num;
        const done    = step > num;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "9999px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? T.green : active ? T.green : "transparent",
                border: `2px solid ${done || active ? T.green : T.border}`,
                transition: "all 0.25s",
              }}>
                {done
                  ? <CheckCircle2 style={{ width: "13px", height: "13px", color: "#fff" }} />
                  : <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "#fff" : T.light }}>{num}</span>
                }
              </div>
              <span style={{
                fontSize: "12px", fontWeight: active || done ? 600 : 400,
                color: active || done ? T.ink : T.light,
                transition: "color 0.25s",
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: "48px", height: "1px", background: step > num ? T.green : T.border, margin: "0 12px", transition: "background 0.25s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NuevoCasoPage() {
  const router    = useRouter();
  const autoRef   = useRef(null);
  const tutelaRef = useRef(null);

  // step: 1 = upload, 2 = loading, 3 = form
  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState(INITIAL);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");
  const [extractError, setExtractError]       = useState("");
  const [camposExtraidos, setCamposExtraidos] = useState([]);
  const [archivoAuto, setArchivoAuto]         = useState(null);
  const [archivoTutela, setArchivoTutela]     = useState(null);

  function handleFileSelect(tipo, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tipo === "auto")   setArchivoAuto(file);
    if (tipo === "tutela") setArchivoTutela(file);
    setExtractError("");
  }

  async function procesarDocumentos() {
    if (!archivoAuto || !archivoTutela) return;
    setStep(2);
    setExtractError("");
    const fd = new FormData();
    fd.append("auto",   archivoAuto);
    fd.append("tutela", archivoTutela);
    try {
      const res  = await fetch("/api/casos/extraer", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error?.message || "Error al procesar los PDFs");
        setStep(1);
        return;
      }
      const { camposEncontrados, ...extraidos } = data.data;
      setForm(prev => ({ ...prev, ...extraidos }));
      setCamposExtraidos(camposEncontrados ?? Object.keys(extraidos).filter(k => extraidos[k]));
      setStep(3);
    } catch {
      setExtractError("Error de conexión al procesar los PDFs.");
      setStep(1);
    }
  }

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

  const ExtractedTag = ({ name }) => camposExtraidos.includes(name) ? (
    <span style={{ marginLeft: "8px", color: "#15803d", fontWeight: 600, textTransform: "none", letterSpacing: "normal", fontSize: "11px" }}>✓ extraído</span>
  ) : null;

  const Field = ({ name, label, required }) => (
    <div>
      <label style={labelStyle} htmlFor={name}>
        {label}{required && <span style={{ color: "#C0392B" }}> *</span>}
        <ExtractedTag name={name} />
      </label>
      <input id={name} name={name} value={form[name]} onChange={handle} style={inputStyle(errors[name])} disabled={loading} />
      {errors[name] && <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors[name]}</p>}
    </div>
  );

  /* ── Zona de drop de archivo ──────────────────────────────── */
  const DropZone = ({ tipo, refEl, archivo, icon: Icon, titulo, descripcion }) => (
    <div
      onClick={() => refEl.current?.click()}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "14px", padding: "36px 24px",
        border: archivo ? "2px solid #86efac" : `2px dashed ${T.border}`,
        background: archivo ? "#f0fdf4" : "#fff",
        cursor: "pointer", transition: "all 0.2s",
        textAlign: "center",
      }}
      onMouseEnter={e => { if (!archivo) { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = "#f5faf7"; }}}
      onMouseLeave={e => { if (!archivo) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "#fff"; }}}
    >
      <input ref={refEl} type="file" accept="application/pdf" style={{ display: "none" }}
        onChange={e => handleFileSelect(tipo, e)} />

      <div style={{
        width: "52px", height: "52px",
        background: archivo ? "#dcfce7" : T.bg,
        border: `1px solid ${archivo ? "#86efac" : T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {archivo
          ? <CheckCircle2 style={{ width: "22px", height: "22px", color: "#15803d" }} />
          : <Icon style={{ width: "22px", height: "22px", color: T.muted }} />
        }
      </div>

      <div>
        <p style={{ fontSize: "13px", fontWeight: 700, color: archivo ? "#15803d" : T.ink, marginBottom: "4px" }}>
          {archivo ? archivo.name : titulo}
        </p>
        <p style={{ fontSize: "12px", color: archivo ? "#16a34a" : T.muted }}>
          {archivo ? "Haz clic para cambiar el archivo" : descripcion}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: T.ink }}>

      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <section style={{ paddingBottom: "24px", borderBottom: `1px solid ${T.border}`, marginBottom: "36px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, marginBottom: "6px" }}>
          Registro
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garant', serif",
          fontSize: "clamp(28px, 3vw, 40px)",
          fontWeight: 700, lineHeight: 1.1, color: T.ink,
        }}>
          Nueva tutela
        </h1>
      </section>

      <StepIndicator step={step} />

      {/* ══════════════════════════════════════════════════════════
          PASO 1 — Subir documentos
      ══════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{
              fontFamily: "'Cormorant Garant', serif",
              fontSize: "32px", fontWeight: 700, color: T.ink, marginBottom: "10px",
            }}>
              Sube los documentos del caso
            </h2>
            <p style={{ fontSize: "15px", color: T.muted, lineHeight: 1.7 }}>
              La IA extraerá automáticamente todos los datos del auto admisorio
              y el escrito de tutela para completar el formulario.
            </p>
          </div>

          {/* Zonas de carga */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <DropZone
              tipo="auto" refEl={autoRef} archivo={archivoAuto}
              icon={FileBadge}
              titulo="Auto admisorio"
              descripcion="Arrastra o haz clic para seleccionar el PDF"
            />
            <DropZone
              tipo="tutela" refEl={tutelaRef} archivo={archivoTutela}
              icon={FileText}
              titulo="Escrito de tutela"
              descripcion="Arrastra o haz clic para seleccionar el PDF"
            />
          </div>

          {/* Error de extracción */}
          {extractError && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "13px", color: "#991b1b", marginBottom: "16px" }}>
              <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              {extractError}
            </div>
          )}

          {/* Barra de progreso de archivos */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "12px 16px", background: T.bg, border: `1px solid ${T.border}` }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "9999px", background: archivoAuto ? "#27AE60" : T.border, flexShrink: 0, transition: "background 0.2s" }} />
            <span style={{ fontSize: "12px", color: archivoAuto ? "#15803d" : T.muted, flex: 1 }}>Auto admisorio</span>
            <div style={{ width: "8px", height: "8px", borderRadius: "9999px", background: archivoTutela ? "#27AE60" : T.border, flexShrink: 0, transition: "background 0.2s" }} />
            <span style={{ fontSize: "12px", color: archivoTutela ? "#15803d" : T.muted, flex: 1 }}>Escrito de tutela</span>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/casos" style={{ fontSize: "13px", color: T.muted, textDecoration: "none", transition: "color 0.18s ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = T.ink; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.muted; }}
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={procesarDocumentos}
              disabled={!archivoAuto || !archivoTutela}
              className={(archivoAuto && archivoTutela) ? "press" : ""}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: (!archivoAuto || !archivoTutela) ? T.muted : T.green,
                color: "#fff", padding: "12px 28px",
                fontSize: "14px", fontWeight: 700,
                border: "none", cursor: (!archivoAuto || !archivoTutela) ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <FileUp style={{ width: "15px", height: "15px" }} />
              Extraer datos con IA
              <ChevronRight style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PASO 2 — Procesando
      ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 0", textAlign: "center", maxWidth: "480px", margin: "0 auto",
        }}>
          {/* Tres puntos pulsantes */}
          <div style={{ display: "flex", gap: "9px", alignItems: "center", marginBottom: "28px" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: "10px", height: "10px", borderRadius: "9999px",
                background: T.green, display: "inline-block",
                animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "28px", fontWeight: 700, color: T.ink, marginBottom: "12px",
          }}>
            Analizando los documentos
          </h2>
          <p style={{ fontSize: "14px", color: T.muted, lineHeight: 1.7, marginBottom: "8px" }}>
            La IA está leyendo el auto admisorio y el escrito de tutela para extraer automáticamente los datos del caso.
          </p>
          <p style={{ fontSize: "12px", color: T.light }}>
            Este proceso puede tardar unos segundos.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PASO 3 — Revisar y guardar
      ══════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div>
          {/* Banner de extracción exitosa */}
          {camposExtraidos.length > 0 && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              padding: "14px 18px", marginBottom: "32px",
              background: "#f0fdf4", borderLeft: "3px solid #27AE60",
            }}>
              <CheckCircle2 style={{ width: "16px", height: "16px", color: "#15803d", marginTop: "1px", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#15803d", marginBottom: "6px" }}>
                  {camposExtraidos.length} campos extraídos automáticamente
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {camposExtraidos.map(c => (
                    <span key={c} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>
                      {CAMPO_LABELS[c] ?? c}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setStep(1); setForm(INITIAL); setCamposExtraidos([]); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#15803d", padding: "0", flexShrink: 0 }}
                title="Volver a subir documentos"
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          )}

          {serverError && (
            <div style={{ display: "flex", gap: "10px", padding: "12px 16px", marginBottom: "24px", background: "#fef2f2", borderLeft: "3px solid #C0392B", fontSize: "13px", color: "#991b1b" }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 320px", gap: 0, alignItems: "start" }}>

              {/* Formulario */}
              <div style={{ paddingRight: "40px" }}>

                {/* Partes */}
                <section style={{ paddingBottom: "28px", borderBottom: `1px solid ${T.border}`, marginBottom: "28px" }}>
                  <span style={sectionLabel}>Partes del proceso</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle} htmlFor="accionante">Accionante (demandante) <span style={{ color: "#C0392B" }}>*</span><ExtractedTag name="accionante" /></label>
                      <input id="accionante" name="accionante" value={form.accionante} onChange={handle} style={inputStyle(errors.accionante)} disabled={loading} />
                      {errors.accionante && <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors.accionante}</p>}
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="accionado">Accionado (tu representado) <span style={{ color: "#C0392B" }}>*</span><ExtractedTag name="accionado" /></label>
                      <input id="accionado" name="accionado" value={form.accionado} onChange={handle} style={inputStyle(errors.accionado)} disabled={loading} />
                      {errors.accionado && <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors.accionado}</p>}
                    </div>
                  </div>
                </section>

                {/* Juzgado */}
                <section style={{ paddingBottom: "28px", borderBottom: `1px solid ${T.border}`, marginBottom: "28px" }}>
                  <span style={sectionLabel}>Datos del juzgado</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle} htmlFor="juez">Juez<ExtractedTag name="juez" /></label>
                      <input id="juez" name="juez" value={form.juez} onChange={handle} style={inputStyle(false)} disabled={loading} />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="juzgado">Juzgado<ExtractedTag name="juzgado" /></label>
                      <input id="juzgado" name="juzgado" value={form.juzgado} onChange={handle} style={inputStyle(false)} disabled={loading} />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="radicado">Radicado<ExtractedTag name="radicado" /></label>
                      <input id="radicado" name="radicado" value={form.radicado} onChange={handle} style={inputStyle(false)} disabled={loading} />
                    </div>
                  </div>
                </section>

                {/* Clasificación */}
                <section style={{ paddingBottom: "28px", borderBottom: `1px solid ${T.border}`, marginBottom: "28px" }}>
                  <span style={sectionLabel}>Clasificación y plazos</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle} htmlFor="tipoTutela">Tipo de tutela<ExtractedTag name="tipoTutela" /></label>
                      <select id="tipoTutela" name="tipoTutela" value={form.tipoTutela} onChange={handle}
                        style={{ ...inputStyle(false), cursor: "pointer" }} disabled={loading}>
                        {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="fechaNotificacion">
                        Fecha de notificación <span style={{ color: "#C0392B" }}>*</span><ExtractedTag name="fechaNotificacion" />
                      </label>
                      <input id="fechaNotificacion" name="fechaNotificacion" type="date"
                        value={form.fechaNotificacion} onChange={handle}
                        style={inputStyle(errors.fechaNotificacion)}
                        max={new Date().toISOString().split("T")[0]} disabled={loading} />
                      {errors.fechaNotificacion
                        ? <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors.fechaNotificacion}</p>
                        : <p style={{ fontSize: "12px", color: T.light, marginTop: "4px" }}>Se calculan 10 días hábiles automáticamente</p>
                      }
                    </div>
                  </div>
                </section>

                {/* Contenido jurídico */}
                <section style={{ paddingBottom: "28px" }}>
                  <span style={sectionLabel}>Contenido jurídico</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={labelStyle} htmlFor="hechos">
                        Hechos narrados por el accionante <span style={{ color: "#C0392B" }}>*</span><ExtractedTag name="hechos" />
                      </label>
                      <textarea id="hechos" name="hechos" rows={8}
                        value={form.hechos} onChange={handle}
                        style={textareaStyle(errors.hechos)}
                        placeholder="Describe los hechos tal como aparecen en la tutela recibida..."
                        disabled={loading} />
                      {errors.hechos
                        ? <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors.hechos}</p>
                        : <p style={{ fontSize: "12px", color: T.light, marginTop: "4px" }}>{form.hechos.length} caracteres</p>
                      }
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="derechosInvocados">
                        Derechos fundamentales invocados <span style={{ color: "#C0392B" }}>*</span><ExtractedTag name="derechosInvocados" />
                      </label>
                      <textarea id="derechosInvocados" name="derechosInvocados" rows={3}
                        value={form.derechosInvocados} onChange={handle}
                        style={textareaStyle(errors.derechosInvocados)}
                        placeholder="Ej: Derecho a la salud (Art. 49 CP), Derecho a la vida (Art. 11 CP)..."
                        disabled={loading} />
                      {errors.derechosInvocados && <p style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px" }}>{errors.derechosInvocados}</p>}
                    </div>
                  </div>
                </section>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setForm(INITIAL); setCamposExtraidos([]); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Volver a documentos
                  </button>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link href="/casos"
                      style={{ display: "inline-flex", alignItems: "center", padding: "10px 20px", fontSize: "13px", fontWeight: 600, color: T.muted, border: `1px solid ${T.border}`, textDecoration: "none", background: "transparent", transition: "border-color 0.18s ease, color 0.18s ease, background 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#9B8E85"; e.currentTarget.style.color = T.ink; e.currentTarget.style.background = "#EEEAE4"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Cancelar
                    </Link>
                    <button type="submit" disabled={loading} className={!loading ? "press" : ""}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "7px",
                        background: loading ? T.muted : T.green,
                        color: "#fff", padding: "10px 24px",
                        fontSize: "13px", fontWeight: 700,
                        border: "none", cursor: loading ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                      {loading
                        ? <><Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> Guardando...</>
                        : <><Save style={{ width: "14px", height: "14px" }} /> Guardar tutela</>
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Divisor */}
              <div style={{ background: T.border, alignSelf: "stretch" }} />

              {/* Panel lateral: resumen de archivos */}
              <div style={{ paddingLeft: "40px", position: "sticky", top: "24px" }}>
                <span style={sectionLabel}>Documentos cargados</span>

                {[{ archivo: archivoAuto, label: "Auto admisorio", icon: FileBadge }, { archivo: archivoTutela, label: "Escrito de tutela", icon: FileText }].map(({ archivo, label, icon: Icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#f0fdf4", border: "1px solid #86efac", marginBottom: "8px" }}>
                    <Icon style={{ width: "14px", height: "14px", color: "#15803d", flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#15803d", marginBottom: "2px" }}>{label}</p>
                      <p style={{ fontSize: "12px", color: "#16a34a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{archivo?.name}</p>
                    </div>
                    <CheckCircle2 style={{ width: "13px", height: "13px", color: "#15803d", flexShrink: 0 }} />
                  </div>
                ))}

                <div style={{ marginTop: "20px", padding: "14px", background: T.bg, borderLeft: `3px solid ${T.gold}` }}>
                  <p style={{ fontSize: "12px", color: T.muted, lineHeight: 1.65 }}>
                    Revisa que los campos marcados como <strong style={{ color: "#15803d" }}>✓ extraído</strong> sean correctos antes de guardar.
                  </p>
                </div>
              </div>

            </div>
          </form>
        </div>
      )}

    </div>
  );
}
