"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Search, Filter } from "lucide-react";
import { signOut } from "next-auth/react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

const ESTADOS  = ["", "PENDIENTE", "EN_PROCESO", "CONTESTADA", "VENCIDA"];
const TIPOS    = ["", "SALUD", "TRABAJO", "EDUCACION", "PENSION", "VIVIENDA", "DEBIDO_PROCESO", "OTRO"];
const LABEL_ESTADO = { PENDIENTE: "Pendiente", EN_PROCESO: "En proceso", CONTESTADA: "Contestada", VENCIDA: "Vencida" };
const LABEL_TIPO   = { SALUD: "Salud", TRABAJO: "Trabajo", EDUCACION: "Educación", PENSION: "Pensión", VIVIENDA: "Vivienda", DEBIDO_PROCESO: "Debido proceso", OTRO: "Otro" };

export default function CasosPage() {
  const [casos, setCasos]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [estado, setEstado]     = useState("");
  const [tipo, setTipo]         = useState("");
  const [pagination, setPag]    = useState(null);
  const [page, setPage]         = useState(1);

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (search) params.set("search", search);
      if (estado) params.set("estado", estado);
      if (tipo)   params.set("tipo", tipo);

      const res = await fetch(`/api/casos?${params}`);
      if (res.status === 401) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCasos(data.data);
        setPag(data.pagination);
      }
    } catch {
      // error de red — spinner se detiene, lista queda vacía
    } finally {
      setLoading(false);
    }
  }, [page, search, estado, tipo]);

  useEffect(() => { fetchCasos(); }, [fetchCasos]);

  // Debounce del buscador
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchCasos(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  return (
    <div className="space-y-4">
      {/* Acciones y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar por accionante, accionado o radicado..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>
        <Link href="/casos/nuevo" className="btn-primary btn shrink-0">
          <PlusCircle className="w-4 h-4" /> Nueva tutela
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-muted" />
        <select value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }} className="input w-auto text-sm py-1.5">
          <option value="">Todos los estados</option>
          {ESTADOS.slice(1).map(e => <option key={e} value={e}>{LABEL_ESTADO[e]}</option>)}
        </select>
        <select value={tipo} onChange={e => { setTipo(e.target.value); setPage(1); }} className="input w-auto text-sm py-1.5">
          <option value="">Todos los tipos</option>
          {TIPOS.slice(1).map(t => <option key={t} value={t}>{LABEL_TIPO[t]}</option>)}
        </select>
        {(estado || tipo || search) && (
          <button onClick={() => { setEstado(""); setTipo(""); setSearch(""); setPage(1); }} className="btn-ghost btn text-sm py-1.5">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      {loading ? (
        <LoadingSpinner text="Cargando tutelas..." />
      ) : casos.length === 0 ? (
        <EmptyState
          title="No hay tutelas"
          description="Registra tu primera tutela para comenzar a usar TutelaIA."
          actionLabel="Registrar tutela"
          actionHref="/casos/nuevo"
        />
      ) : (
        <div className="space-y-2">
          {pagination && (
            <p className="text-xs text-muted">{pagination.total} tutela{pagination.total !== 1 ? "s" : ""} encontrada{pagination.total !== 1 ? "s" : ""}</p>
          )}
          {casos.map(caso => (
            <Link key={caso.id} href={`/casos/${caso.id}`} className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
              {/* Indicador de urgencia */}
              <div className={`w-1 self-stretch rounded-full shrink-0 ${
                caso.diasRestantes <= 0 ? "bg-gray-400"
                : caso.diasRestantes <= 3 ? "bg-red-500"
                : caso.diasRestantes <= 5 ? "bg-yellow-400"
                : "bg-green-400"
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary-500 truncate group-hover:text-accent-500 transition-colors">
                      {caso.accionante}
                    </p>
                    <p className="text-sm text-muted truncate">vs. {caso.accionado}</p>
                  </div>
                  <DiasRestantesBadge dias={caso.diasRestantes} />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span className="badge badge-progress">{LABEL_TIPO[caso.tipoTutela] || caso.tipoTutela}</span>
                  <span>{LABEL_ESTADO[caso.estado]}</span>
                  {caso.radicado && <span>Rad. {caso.radicado}</span>}
                  <span>Límite: {new Date(caso.fechaLimite).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Paginación */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.has_prev} className="btn btn-outline btn-sm">Anterior</button>
              <span className="text-sm text-muted py-1 px-2">Página {pagination.page} de {pagination.total_pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next} className="btn btn-outline btn-sm">Siguiente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
