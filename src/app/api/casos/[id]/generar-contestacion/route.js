// POST /api/casos/:id/generar-contestacion
// Motor principal de IA — llama a Gemini y guarda el borrador

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generarContestacion } from "@/lib/gemini";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    // Verificar que el caso pertenece al usuario — api-quality: autorización por recurso
    const caso = await prisma.caso.findFirst({
      where: { id: params.id, userId: session.user.id, isActive: true },
    });

    if (!caso) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Caso no encontrado" } },
        { status: 404 }
      );
    }

    // Generar contestación con Gemini
    const { contenido, tokensUsados } = await generarContestacion(caso);

    // Guardar o actualizar el borrador (upsert)
    const contestacion = await prisma.contestacion.upsert({
      where:  { casoId: caso.id },
      create: {
        casoId:        caso.id,
        contenido,
        generadoPorIA: true,
        modeloIA:      "gemini-1.5-flash",
        tokensUsados,
        version:       1,
      },
      update: {
        contenido,
        tokensUsados,
        modeloIA: "gemini-1.5-flash",
        version:  { increment: 1 },
      },
    });

    // Actualizar estado del caso a EN_PROCESO
    await prisma.caso.update({
      where: { id: caso.id },
      data:  { estado: "EN_PROCESO" },
    });

    return NextResponse.json({
      success: true,
      data: { contestacionId: contestacion.id, tokensUsados, version: contestacion.version },
      message: "Contestación generada correctamente",
    });

  } catch (error) {
    console.error("[POST /api/casos/:id/generar-contestacion]", error);

    // Diferenciar error de Gemini vs error interno
    const isGeminiError = error.message?.includes("API") || error.message?.includes("quota");
    return NextResponse.json(
      {
        success: false,
        error: {
          code:    isGeminiError ? "AI_ERROR" : "SERVER_ERROR",
          message: isGeminiError
            ? "Error al conectar con el servicio de IA. Intenta nuevamente."
            : "Error interno del servidor",
        },
      },
      { status: 502 }
    );
  }
}
