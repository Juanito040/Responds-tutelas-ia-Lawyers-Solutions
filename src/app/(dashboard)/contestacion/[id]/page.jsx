"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Download, CheckCircle, Loader2, Clock,
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
    <div className="flex flex-col h-full -m-6">

      {/* ── Toolbar principal ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-4 py-2 flex items-center gap-2 flex-wrap shrink-0">
        {!expandido && (
          <Link href={`/casos/${data.caso.id}`} className="btn-ghost btn p-2 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        {!expandido && (
          <div className="flex-1 min-w-0 mr-2">
            <p className="font-semibold text-primary-500 text-sm truncate">
              Contestación — {data.caso.accionante} vs. {data.caso.accionado}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              {saving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</>
              ) : lastSaved ? (
                <><CheckCircle className="w-3 h-3 text-green-500" /> Guardado {lastSaved.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</>
              ) : (
                <><Clock className="w-3 h-3" /> Sin guardar</>
              )}
            </div>
          </div>
        )}

        {expandido && (
          <div className="flex items-center gap-2 text-xs text-muted mr-auto">
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</>
            ) : lastSaved ? (
              <><CheckCircle className="w-3 h-3 text-green-500" /> Guardado {lastSaved.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</>
            ) : (
              <><Clock className="w-3 h-3" /> Sin guardar</>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setExpandido(v => !v)}
            className="btn-ghost btn p-2"
            title={expandido ? "Salir del modo enfoque" : "Modo enfoque"}
          >
            {expandido ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => save(contenido)} disabled={saving} className="btn-outline btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
          <button onClick={handleExport} disabled={exporting} className="btn-primary btn">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar Word
          </button>
        </div>
      </div>

      {saveError && <div className="alert alert-error mx-6 mt-3">{saveError}</div>}

      {/* ── Banners — se ocultan en modo enfoque ──────────────────────────── */}
      {!expandido && (
        <div className="px-6 pt-3 flex flex-col gap-2 shrink-0">
          {pendientes > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800">
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="flex-1">
                <strong>{pendientes} campo{pendientes > 1 ? "s" : ""} pendiente{pendientes > 1 ? "s" : ""}</strong>
                {" — reemplaza cada "}<code className="bg-yellow-100 px-1 rounded font-mono text-xs">[COMPLETAR: ...]</code>{" antes de radicar."}
              </span>
              <button
                onClick={irAlSiguienteCompletar}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-md bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-medium text-xs transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" /> Ir al siguiente
              </button>
            </div>
          )}

          {avisoVisible && (
            <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">
                <strong>Verifica las citas jurisprudenciales</strong> — confirma sentencia, M.P. y año en la base de datos de la Corte Constitucional antes de radicar.
              </span>
              <button onClick={() => setAviso(false)} className="p-1 rounded hover:bg-orange-200 transition-colors" title="Cerrar aviso">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Área de documento estilo Word ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-gray-200 pt-4 pb-6 flex flex-col items-center">

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

          {/* Barra de formato — pegada al documento */}
          <div
            className="flex items-center gap-1 bg-gray-50 border-t border-x border-gray-200 px-3 py-1.5"
            style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
          >
            <span className="text-xs text-gray-400 mr-2 select-none">Formato</span>
            <ToolbarBtn onClick={toggleHeading} title="Título de sección — agrega # al inicio de la línea (se exporta como encabezado Word)">
              <Heading2 className="w-4 h-4" />
              <span className="text-xs ml-1">Título</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={insertarSeparador} title="Insertar línea separadora">
              <Minus className="w-4 h-4" />
              <span className="text-xs ml-1">Separador</span>
            </ToolbarBtn>
          </div>

          {/* Pie de página — dentro del área de documento */}
          <div
            className="flex items-center justify-between text-xs text-gray-500 bg-white border-t border-gray-100 px-6 py-2"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
          >
            <span>{palabras.toLocaleString("es-CO")} palabras · {contenido.length.toLocaleString("es-CO")} caracteres</span>
            {pendientes > 0
              ? <span className="text-yellow-700 font-medium">{pendientes} campo{pendientes > 1 ? "s" : ""} por completar</span>
              : <span className="text-green-600 font-medium">Sin campos pendientes ✓</span>
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
      onMouseDown={e => { e.preventDefault(); onClick(); }} /* preventDefault evita perder el foco del textarea */
      title={title}
      className="flex items-center px-2 py-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-xs"
    >
      {children}
    </button>
  );
}
