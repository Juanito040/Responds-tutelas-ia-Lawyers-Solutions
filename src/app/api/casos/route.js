// GET /api/casos — listar casos del usuario autenticado
// POST /api/casos — crear nueva tutela
// api-quality: paginación, filtros, status codes correctos, formato consistente

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularFechaLimite, calcularDiasRestantes } from "@/utils/diasHabiles";

// ─── GET /api/casos ───────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") || "20"));
    const estado   = searchParams.get("estado") || undefined;
    const tipo     = searchParams.get("tipo") || undefined;
    const search   = searchParams.get("search") || undefined;

    const where = {
      userId:   session.user.id,
      isActive: true,
      ...(estado && { estado }),
      ...(tipo   && { tipoTutela: tipo }),
      ...(search && {
        OR: [
          { accionante: { contains: search, mode: "insensitive" } },
          { accionado:  { contains: search, mode: "insensitive" } },
          { radicado:   { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [casos, total] = await Promise.all([
      prisma.caso.findMany({
        where,
        orderBy: { fechaLimite: "asc" }, // más urgente primero
        skip:  (page - 1) * per_page,
        take:  per_page,
        select: {
          id: true, accionante: true, accionado: true,
          tipoTutela: true, estado: true, juez: true, juzgado: true,
          radicado: true, fechaNotificacion: true, fechaLimite: true,
          createdAt: true,
          contestacion: { select: { id: true, updatedAt: true } },
        },
      }),
      prisma.caso.count({ where }),
    ]);

    // Calcular días restantes en tiempo real
    const casosConDias = casos.map(c => ({
      ...c,
      diasRestantes: calcularDiasRestantes(c.fechaLimite),
    }));

    return NextResponse.json({
      success: true,
      data: casosConDias,
      pagination: {
        page, per_page, total,
        total_pages: Math.ceil(total / per_page),
        has_next: page * per_page < total,
        has_prev: page > 1,
      },
    });

  } catch (error) {
    console.error("[GET /api/casos]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } },
      { status: 500 }
    );
  }
}

// ─── POST /api/casos ──────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accionante, accionado, hechos, derechosInvocados, tipoTutela,
            juez, juzgado, radicado, fechaNotificacion } = body;

    // Validación server-side — api-quality skill
    const errors = {};
    if (!accionante?.trim())        errors.accionante        = "El accionante es requerido";
    if (!accionado?.trim())         errors.accionado         = "El accionado es requerido";
    if (!hechos?.trim())            errors.hechos            = "Los hechos son requeridos";
    if (hechos?.trim().length < 20) errors.hechos            = "Describe los hechos con más detalle (mínimo 20 caracteres)";
    if (!derechosInvocados?.trim()) errors.derechosInvocados = "Los derechos invocados son requeridos";
    if (!fechaNotificacion)         errors.fechaNotificacion = "La fecha de notificación es requerida";

    const tiposValidos = ["SALUD","TRABAJO","EDUCACION","PENSION","VIVIENDA","DEBIDO_PROCESO","INTIMIDAD","IGUALDAD","OTRO"];
    if (tipoTutela && !tiposValidos.includes(tipoTutela)) errors.tipoTutela = "Tipo de tutela no válido";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: errors } },
        { status: 422 }
      );
    }

    const notificacion = new Date(fechaNotificacion);
    const fechaLimite  = calcularFechaLimite(notificacion, 10);

    const caso = await prisma.caso.create({
      data: {
        userId: session.user.id,
        accionante: accionante.trim(),
        accionado:  accionado.trim(),
        hechos:     hechos.trim(),
        derechosInvocados: derechosInvocados.trim(),
        tipoTutela: tipoTutela || "OTRO",
        juez:       juez?.trim()     || null,
        juzgado:    juzgado?.trim()  || null,
        radicado:   radicado?.trim() || null,
        fechaNotificacion: notificacion,
        fechaLimite,
      },
    });

    return NextResponse.json(
      { success: true, data: { ...caso, diasRestantes: calcularDiasRestantes(fechaLimite) }, message: "Caso registrado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("[POST /api/casos]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } },
      { status: 500 }
    );
  }
}
