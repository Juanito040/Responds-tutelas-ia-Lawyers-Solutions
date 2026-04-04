"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Save, Download, CheckCircle, Loader2, Clock,
  AlertTriangle, ClipboardList, ChevronDown, X, Maximize2, Minimize2,
  Heading2, Minus,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditorPage() {
  const { id }   = useParams();
  const [data, setData]               = useState(null);
  const [contenido, setContenido]     = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [lastSaved, setLastSaved]     = useState(null);
  const [saveError, setSaveError]     = useState("");
  const [avisoVisible, setAviso]      = useState(true);
  const [expandido, setExpandido]     = useState(false);
  const autoSaveRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch(`/api/contestaciones/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setData(d.data); setContenido(d.data.contenido); }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Autosave con debounce de 3 segundos
  const save = useCallback(async (text) => {
    setSaving(true);
    setSaveError("");
    const res    = await fetch(`/api/contestaciones/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ contenido: text }),
    });
    const result = await res.json();
    setSaving(false);
    if (result.success) setLastSaved(new Date());
    else setSaveError("Error al guardar. Intenta manualmente.");
  }, [id]);

  function handleChange(e) {
    const val = e.target.value;
    setContenido(val);
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => save(val), 3000);
  }

  async function handleExport() {
    setExporting(true);
    const res = await fetch(`/api/contestaciones/${id}/exportar`);
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.headers.get("content-disposition")?.split('filename="')[1]?.replace('"', "") || "contestacion.docx";
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  // ── Helpers de toolbar ────────────────────────────────────────────────────
  /** Aplica una transformación a la línea actual del textarea */
  function transformarLineaActual(transformFn) {
    const ta  = textareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const pos = ta.selectionStart;

    const inicioLinea = val.lastIndexOf("\n", pos - 1) + 1;
    const finLinea    = val.indexOf("\n", pos);
    const fin         = finLinea === -1 ? val.length : finLinea;
    const linea       = val.substring(inicioLinea, fin);
    const nuevaLinea  = transformFn(linea);
    const nuevo       = val.substring(0, inicioLinea) + nuevaLinea + val.substring(fin);

    setContenido(nuevo);
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => save(nuevo), 3000);

    // Restaurar cursor
    requestAnimationFrame(() => {
      const delta = nuevaLinea.length - linea.length;
      ta.focus();
      ta.setSelectionRange(pos + delta, pos + delta);
    });
  }

  function toggleHeading() {
    transformarLineaActual(linea =>
      linea.startsWith("# ") ? linea.slice(2) : `# ${linea.replace(/^#+\s*/, "")}`
    );
  }

  function insertarSeparador() {
    const ta  = textareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const pos = ta.selectionStart;
    const sep = "\n─────────────────────────────────────────\n";
    const nuevo = val.substring(0, pos) + sep + val.substring(pos);
    setContenido(nuevo);
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => save(nuevo), 3000);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos + sep.length, pos + sep.length);
    });
  }

  // Navega al siguiente [COMPLETAR:] en el textarea
  function irAlSiguienteCompletar() {
    const ta      = textareaRef.current;
    if (!ta) return;
    const texto   = ta.value;
    const desde   = ta.selectionEnd ?? 0;
    let pos = texto.indexOf("[COMPLETAR:", desde);
    if (pos === -1) pos = texto.indexOf("[COMPLETAR:");
    if (pos === -1) return;

    const fin = texto.indexOf("]", pos) + 1;
    ta.focus();
    ta.setSelectionRange(pos, fin > 0 ? fin : pos + 11);
    const linea       = texto.substring(0, pos).split("\n").length;
    const alturaLinea = 28;
    ta.scrollTop      = Math.max(0, (linea - 5) * alturaLinea);
  }

  if (loading) return <LoadingSpinner text="Cargando contestación..." />;
  if (!data)   return <div className="alert alert-error">Contestación no encontrada.</div>;

  const pendientes = (contenido.match(/\[COMPLETAR:/g) || []).length;
  const palabras   = contenido.trim() ? contenido.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "-24px -24px -80px", minHeight: "100%", overflow: "hidden" }}>

      {/* ── Toolbar principal ─────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #D8D2CA", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>

        {/* Izquierda: volver + info caso */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>

          <div style={{ minWidth: 0 }}>
            {!expandido && (
              <p style={{ fontWeight: 600, color: "#1A1A18", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {data.caso.accionante} vs. {data.caso.accionado}
              </p>
            )}
            {/* Estado de guardado */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#7A7268", marginTop: expandido ? "0" : "3px" }}>
              {saving ? (
                <><Loader2 style={{ width: "12px", height: "12px", animation: "spin 1s linear infinite" }} /> Guardando...</>
              ) : lastSaved ? (
                <><CheckCircle style={{ width: "12px", height: "12px", color: "#27AE60" }} /> Guardado {lastSaved.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</>
              ) : (
                <><Clock style={{ width: "12px", height: "12px" }} /> Sin guardar</>
              )}
            </div>
          </div>
        </div>

        {/* Derecha: acciones */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={() => setExpandido(v => !v)}
            title={expandido ? "Salir del modo enfoque" : "Modo enfoque"}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "none", border: "1px solid #D8D2CA", cursor: "pointer", color: "#7A7268" }}
          >
            {expandido ? <Minimize2 style={{ width: "14px", height: "14px" }} /> : <Maximize2 style={{ width: "14px", height: "14px" }} />}
          </button>
          <button
            onClick={() => save(contenido)} disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 16px", fontSize: "13px", fontWeight: 600, background: "none", border: "1px solid #D8D2CA", cursor: "pointer", color: "#1A1A18", fontFamily: "'DM Sans', sans-serif", height: "36px" }}
          >
            {saving ? <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} /> : <Save style={{ width: "13px", height: "13px" }} />}
            Guardar
          </button>
          <button
            onClick={handleExport} disabled={exporting}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 16px", fontSize: "13px", fontWeight: 600, background: "#1B3528", border: "none", cursor: "pointer", color: "#fff", fontFamily: "'DM Sans', sans-serif", height: "36px" }}
          >
            {exporting ? <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} /> : <Download style={{ width: "13px", height: "13px" }} />}
            Exportar Word
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ margin: "10px 24px 0", display: "flex", gap: "10px", padding: "10px 14px", background: "#fef2f2", borderLeft: "3px solid #C0392B", fontSize: "13px", color: "#991b1b" }}>
          {saveError}
        </div>
      )}

      {/* ── Banners — se ocultan en modo enfoque ──────────────────────────── */}
      {!expandido && (
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", padding: "8px 16px 0" }}>
          {pendientes > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#fffbeb", borderBottom: "1px solid #fde68a", fontSize: "13px", color: "#92400e", overflow: "hidden" }}>
              <ClipboardList style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{pendientes} campo{pendientes > 1 ? "s" : ""} pendiente{pendientes > 1 ? "s" : ""}</strong>
                {" — reemplaza cada "}
                <code style={{ background: "#fef9c3", padding: "1px 4px", fontFamily: "monospace", fontSize: "11px", borderRadius: "2px" }}>[COMPLETAR: ...]</code>
                {" antes de radicar."}
              </span>
              <button
                onClick={irAlSiguienteCompletar}
                className="press"
                style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, padding: "5px 12px", background: "#fde68a", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 600, fontSize: "12px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
              >
                <ChevronDown style={{ width: "12px", height: "12px" }} /> Ir al siguiente
              </button>
            </div>
          )}

          {avisoVisible && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", fontSize: "13px", color: "#9a3412", overflow: "hidden" }}>
              <AlertTriangle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>Verifica las citas jurisprudenciales</strong> — confirma sentencia, M.P. y año antes de radicar.
              </span>
              <button onClick={() => setAviso(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a3412", padding: "2px", display: "flex", flexShrink: 0 }} title="Cerrar">
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Área de documento estilo Word ─────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", background: "#E8E4DF", paddingTop: "20px", paddingBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Hoja de papel */}
        <div
          className="w-full flex flex-col"
          style={{ maxWidth: "816px" /* ancho carta ~8.5in a 96dpi */ }}
        >
          <textarea
            ref={textareaRef}
            value={contenido}
            onChange={handleChange}
            spellCheck
            lang="es"
            placeholder="El contenido de la contestación aparecerá aquí..."
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "12pt",
              lineHeight: "1.8",
              color: "#1a1a1a",
              background: "#ffffff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
              padding: "96px 96px 96px 120px", /* márgenes tipo carta: top/right/bottom/left */
              resize: "none",
              border: "none",
              outline: "none",
              width: "100%",
              minHeight: "calc(100vh - 180px)",
            }}
            onFocus={e => (e.target.style.boxShadow = "0 2px 12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)")}
            onBlur={e  => (e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)")}
          />

          {/* Barra de formato */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#F7F3EE", borderTop: "1px solid #D8D2CA", borderLeft: "1px solid #D8D2CA", borderRight: "1px solid #D8D2CA", padding: "6px 12px" }}>
            <span style={{ fontSize: "11px", color: "#A89E93", marginRight: "8px", userSelect: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>Formato</span>
            <ToolbarBtn onClick={toggleHeading} title="Título de sección">
              <Heading2 style={{ width: "14px", height: "14px" }} />
              <span style={{ fontSize: "11px", marginLeft: "4px" }}>Título</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={insertarSeparador} title="Insertar separador">
              <Minus style={{ width: "14px", height: "14px" }} />
              <span style={{ fontSize: "11px", marginLeft: "4px" }}>Separador</span>
            </ToolbarBtn>
          </div>

          {/* Pie de página */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#7A7268", background: "#fff", borderTop: "1px solid #E8E4DF", padding: "8px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
            <span>{palabras.toLocaleString("es-CO")} palabras · {contenido.length.toLocaleString("es-CO")} caracteres</span>
            {pendientes > 0
              ? <span style={{ color: "#92400e", fontWeight: 600 }}>{pendientes} campo{pendientes > 1 ? "s" : ""} por completar</span>
              : <span style={{ color: "#15803d", fontWeight: 600 }}>Sin campos pendientes ✓</span>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

/** Botón pequeño para la barra de formato */
function ToolbarBtn({ onClick, title, children }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      style={{ display: "flex", alignItems: "center", padding: "4px 8px", background: "none", border: "none", cursor: "pointer", color: "#7A7268", fontFamily: "'DM Sans', sans-serif", transition: "color 0.1s" }}
    >
      {children}
    </button>
  );
}
