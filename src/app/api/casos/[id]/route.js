// GET /api/casos/:id — obtener detalle de un caso
// PATCH /api/casos/:id — actualizar estado u otros campos
// DELETE /api/casos/:id — soft delete

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularDiasRestantes } from "@/utils/diasHabiles";

async function getCasoPropio(id, userId) {
  return prisma.caso.findFirst({
    where: { id, userId, isActive: true },
    include: { contestacion: true },
  });
}

// ─── GET /api/casos/:id ───────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const caso = await getCasoPropio(params.id, session.user.id);
    if (!caso) return notFound();

    return NextResponse.json({
      success: true,
      data: { ...caso, diasRestantes: calcularDiasRestantes(caso.fechaLimite) },
    });

  } catch (error) {
    console.error("[GET /api/casos/:id]", error);
    return serverError();
  }
}

// ─── PATCH /api/casos/:id ─────────────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const caso = await getCasoPropio(params.id, session.user.id);
    if (!caso) return notFound();

    const body = await request.json();

    // Solo permitir actualizar campos específicos (whitelist — api-quality)
    const allowed = ["estado", "juez", "juzgado", "radicado", "hechos", "derechosInvocados", "tipoTutela"];
    const updateData = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const estadosValidos = ["PENDIENTE", "EN_PROCESO", "CONTESTADA", "VENCIDA"];
    if (updateData.estado && !estadosValidos.includes(updateData.estado)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Estado no válido" } },
        { status: 422 }
      );
    }

    const updated = await prisma.caso.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated, message: "Caso actualizado" });

  } catch (error) {
    console.error("[PATCH /api/casos/:id]", error);
    return serverError();
  }
}

// ─── DELETE /api/casos/:id (soft delete) ─────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const caso = await getCasoPropio(params.id, session.user.id);
    if (!caso) return notFound();

    await prisma.caso.update({
      where: { id: params.id },
      data:  { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Caso eliminado" }, { status: 200 });

  } catch (error) {
    console.error("[DELETE /api/casos/:id]", error);
    return serverError();
  }
}

// ─── Helpers de respuesta ─────────────────────────────────────────────────────
const unauthorized = () => NextResponse.json(
  { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } }, { status: 401 }
);
const notFound = () => NextResponse.json(
  { success: false, error: { code: "NOT_FOUND", message: "Caso no encontrado" } }, { status: 404 }
);
const serverError = () => NextResponse.json(
  { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } }, { status: 500 }
);
