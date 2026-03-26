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
        modeloIA:      "llama-3.3-70b-versatile",
        tokensUsados,
        version:       1,
      },
      update: {
        contenido,
        tokensUsados,
        modeloIA: "llama-3.3-70b-versatile",
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

    // Diferenciar tipo de error de Gemini
    const isRateLimit = error.status === 429 || error.message?.includes("Too Many Requests") || error.message?.includes("quota");
    const isGeminiError = error.message?.includes("GoogleGenerativeAI") || error.message?.includes("API");

    let message = "Error interno del servidor";
    let code = "SERVER_ERROR";

    if (isRateLimit) {
      code = "RATE_LIMIT";
      message = "Límite de solicitudes a la IA alcanzado. Espera un momento e intenta nuevamente.";
    } else if (isGeminiError) {
      code = "AI_ERROR";
      message = "Error al conectar con el servicio de IA. Verifica la configuración e intenta nuevamente.";
    }

    return NextResponse.json(
      { success: false, error: { code, message } },
      { status: isRateLimit ? 429 : 502 }
    );
  }
}
