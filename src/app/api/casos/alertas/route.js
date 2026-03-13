// GET /api/casos/alertas — casos urgentes del usuario (≤3 días hábiles)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularDiasRestantes } from "@/utils/diasHabiles";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    // Traer casos activos que no estén contestados ni vencidos
    const casos = await prisma.caso.findMany({
      where: {
        userId:   session.user.id,
        isActive: true,
        estado:   { in: ["PENDIENTE", "EN_PROCESO"] },
      },
      orderBy: { fechaLimite: "asc" },
      select: {
        id: true, accionante: true, accionado: true,
        tipoTutela: true, estado: true, fechaLimite: true,
      },
    });

    // Filtrar y enriquecer con días restantes
    const alertas = casos
      .map(c => ({ ...c, diasRestantes: calcularDiasRestantes(c.fechaLimite) }))
      .filter(c => c.diasRestantes <= 5) // alertas para los próximos 5 días
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    return NextResponse.json({ success: true, data: alertas });

  } catch (error) {
    console.error("[GET /api/casos/alertas]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno" } },
      { status: 500 }
    );
  }
}
