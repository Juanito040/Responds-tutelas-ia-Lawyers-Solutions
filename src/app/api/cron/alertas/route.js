// GET /api/cron/alertas
// Envía emails de alerta a todos los usuarios con tutelas próximas a vencer (≤3 días hábiles).
// Protegido con CRON_SECRET para que solo pueda llamarlo el scheduler.
// En Vercel: configurar en vercel.json como cron diario a las 7am Colombia (12:00 UTC).

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularDiasRestantes } from "@/utils/diasHabiles";
import { enviarAlertaVencimiento } from "@/lib/email";

export async function GET(request) {
  // Verificar secret — OBLIGATORIO, sin excepción
  const auth   = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("[cron/alertas] CRON_SECRET no está configurado");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Traer todos los casos activos pendientes/en proceso con su usuario
    const casos = await prisma.caso.findMany({
      where: {
        isActive: true,
        estado: { in: ["PENDIENTE", "EN_PROCESO"] },
      },
      select: {
        id: true, accionante: true, accionado: true,
        tipoTutela: true, fechaLimite: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // Agrupar por usuario y filtrar los urgentes (≤3 días)
    const porUsuario = {};
    for (const caso of casos) {
      const dias = calcularDiasRestantes(caso.fechaLimite);
      if (dias > 3) continue; // solo alertar con 3 o menos días

      const uid = caso.user.id;
      if (!porUsuario[uid]) {
        porUsuario[uid] = { user: caso.user, casos: [] };
      }
      porUsuario[uid].casos.push({ ...caso, diasRestantes: dias });
    }

    const usuarios = Object.values(porUsuario);
    if (usuarios.length === 0) {
      return NextResponse.json({ success: true, message: "Sin alertas pendientes", enviados: 0 });
    }

    // Enviar email a cada usuario con sus casos urgentes
    const resultados = await Promise.allSettled(
      usuarios.map(({ user, casos: casosUrgentes }) =>
        enviarAlertaVencimiento({
          email:  user.email,
          nombre: user.name,
          casos:  casosUrgentes.sort((a, b) => a.diasRestantes - b.diasRestantes),
        })
      )
    );

    const exitosos  = resultados.filter(r => r.status === "fulfilled").length;
    const fallidos  = resultados.filter(r => r.status === "rejected").length;

    console.log(`[cron/alertas] Enviados: ${exitosos}, Fallidos: ${fallidos}`);

    return NextResponse.json({
      success: true,
      message: `Alertas enviadas: ${exitosos} OK, ${fallidos} fallidos`,
      enviados: exitosos,
      fallidos,
    });

  } catch (error) {
    console.error("[GET /api/cron/alertas]", error);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
