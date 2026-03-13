// GET /api/contestaciones/:id — obtener contestación para el editor
// PUT /api/contestaciones/:id — guardar cambios del editor

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getContestacionPropia(id, userId) {
  return prisma.contestacion.findFirst({
    where: { id, caso: { userId } },
    include: { caso: { select: { id: true, accionante: true, accionado: true, estado: true } } },
  });
}

// ─── GET /api/contestaciones/:id ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauth();

    const contestacion = await getContestacionPropia(params.id, session.user.id);
    if (!contestacion) return notFound();

    return NextResponse.json({ success: true, data: contestacion });

  } catch (error) {
    console.error("[GET /api/contestaciones/:id]", error);
    return serverErr();
  }
}

// ─── PUT /api/contestaciones/:id ─────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauth();

    const contestacion = await getContestacionPropia(params.id, session.user.id);
    if (!contestacion) return notFound();

    const { contenido } = await request.json();

    if (!contenido?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "El contenido no puede estar vacío" } },
        { status: 422 }
      );
    }

    const updated = await prisma.contestacion.update({
      where: { id: params.id },
      data:  { contenido: contenido.trim() },
      select: { id: true, updatedAt: true, version: true },
    });

    return NextResponse.json({ success: true, data: updated, message: "Guardado" });

  } catch (error) {
    console.error("[PUT /api/contestaciones/:id]", error);
    return serverErr();
  }
}

const unauth    = () => NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },        { status: 401 });
const notFound  = () => NextResponse.json({ success: false, error: { code: "NOT_FOUND",    message: "Contestación no encontrada" } }, { status: 404 });
const serverErr = () => NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Error interno" } },          { status: 500 });
