import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularDiasRestantes } from "@/utils/diasHabiles";
import Link from "next/link";
import { AlertTriangle, FolderOpen, CheckCircle, Clock, PlusCircle, ChevronRight } from "lucide-react";
import DiasRestantesBadge from "@/components/ui/DiasRestantesBadge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Traer datos del usuario
  const [casos, totales] = await Promise.all([
    prisma.caso.findMany({
      where: { userId: session.user.id, isActive: true, estado: { in: ["PENDIENTE", "EN_PROCESO"] } },
      orderBy: { fechaLimite: "asc" },
      take: 5,
      select: { id: true, accionante: true, accionado: true, tipoTutela: true, estado: true, fechaLimite: true },
    }),
    prisma.caso.groupBy({
      by: ["estado"],
      where: { userId: session.user.id, isActive: true },
      _count: true,
    }),
  ]);

  const conteo = { PENDIENTE: 0, EN_PROCESO: 0, CONTESTADA: 0, VENCIDA: 0 };
  totales.forEach(t => { conteo[t.estado] = t._count; });

  const casosConDias = casos.map(c => ({
    ...c,
    diasRestantes: calcularDiasRestantes(c.fechaLimite),
  }));

  const urgentes = casosConDias.filter(c => c.diasRestantes <= 3);

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h2 className="page-title">Bienvenida, {session.user.name?.split(" ")[0]}</h2>
        <p className="page-subtitle">
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Alerta urgente */}
      {urgentes.length > 0 && (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {urgentes.length === 1
                ? "¡Hay 1 tutela con menos de 3 días para vencer!"
                : `¡Hay ${urgentes.length} tutelas con menos de 3 días para vencer!`}
            </p>
            <p className="text-sm mt-0.5">Contesta a tiempo para evitar sanciones disciplinarias.</p>
          </div>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pendientes"  value={conteo.PENDIENTE}  color="yellow" icon={Clock} />
        <StatCard label="En proceso"  value={conteo.EN_PROCESO} color="blue"   icon={FolderOpen} />
        <StatCard label="Contestadas" value={conteo.CONTESTADA} color="green"  icon={CheckCircle} />
        <StatCard label="Vencidas"    value={conteo.VENCIDA}    color="red"    icon={AlertTriangle} />
      </div>

      {/* Acción rápida */}
      <Link
        href="/casos/nuevo"
        className="flex items-center gap-3 p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        <div className="flex-1">
          <p className="font-semibold">Registrar nueva tutela</p>
          <p className="text-primary-200 text-sm">Ingresa los datos y genera la contestación con IA</p>
        </div>
        <ChevronRight className="w-5 h-5 text-primary-300" />
      </Link>

      {/* Casos activos más urgentes */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-primary-500">Tutelas activas más urgentes</h3>
          <Link href="/casos" className="text-sm text-accent-500 hover:underline">Ver todas</Link>
        </div>

        {casosConDias.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">No hay tutelas activas. ¡Registra la primera!</p>
        ) : (
          <div className="divide-y divide-border">
            {casosConDias.map(caso => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-primary-500 truncate">{caso.accionante}</p>
                  <p className="text-xs text-muted truncate">vs. {caso.accionado}</p>
                </div>
                <div className="ml-4 shrink-0">
                  <DiasRestantesBadge dias={caso.diasRestantes} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    green:  "bg-green-50 text-green-700 border-green-100",
    red:    "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
