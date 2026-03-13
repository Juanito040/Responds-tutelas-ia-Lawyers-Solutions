"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Download, CheckCircle, Loader2, Clock } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditorPage() {
  const { id }   = useParams();
  const [data, setData]         = useState(null);
  const [contenido, setContenido] = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState("");
  const autoSaveRef = useRef(null);

  useEffect(() => {
    fetch(`/api/contestaciones/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setData(d.data); setContenido(d.data.contenido); }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Autosave con debounce de 3 segundos — frontend-quality skill
  const save = useCallback(async (text) => {
    setSaving(true);
    setSaveError("");
    const res  = await fetch(`/api/contestaciones/${id}`, {
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
      a.href = url;
      a.download = res.headers.get("content-disposition")?.split('filename="')[1]?.replace('"', "") || "contestacion.docx";
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  if (loading) return <LoadingSpinner text="Cargando contestación..." />;
  if (!data)   return <div className="alert alert-error">Contestación no encontrada.</div>;

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Toolbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 flex-wrap shrink-0">
        <Link href={`/casos/${data.caso.id}`} className="btn-ghost btn p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
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

        <div className="flex gap-2">
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

      {/* Editor */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <p className="text-xs text-muted mb-2">
            Revisa y edita el borrador generado por la IA. Los cambios se guardan automáticamente cada 3 segundos.
          </p>
          <textarea
            value={contenido}
            onChange={handleChange}
            className="w-full h-[calc(100%-2rem)] input resize-none font-mono text-sm leading-relaxed"
            placeholder="El contenido de la contestación aparecerá aquí..."
            spellCheck
            lang="es"
          />
        </div>
      </div>
    </div>
  );
}
