// POST /api/casos/:id/auto — Sube el auto del juzgado (PDF) y extrae su texto
// DELETE /api/casos/:id/auto — Elimina el auto cargado

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const caso = await prisma.caso.findFirst({
      where: { id: params.id, userId: session.user.id, isActive: true },
    });
    if (!caso) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Caso no encontrado" } },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const archivo = formData.get("archivo");

    if (!archivo || typeof archivo === "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Debes adjuntar un archivo PDF" } },
        { status: 422 }
      );
    }

    // Validar tipo y tamaño (máx 10 MB)
    const esValido = archivo.type === "application/pdf" || archivo.name?.endsWith(".pdf");
    if (!esValido) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Solo se aceptan archivos PDF" } },
        { status: 422 }
      );
    }
    if (archivo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "El archivo no puede superar 10 MB" } },
        { status: 422 }
      );
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await archivo.arrayBuffer());
    let textoExtraido = "";

    try {
      const { extractText } = await import("unpdf");
      const uint8 = new Uint8Array(buffer);
      const { text } = await extractText(uint8, { mergePages: true });
      textoExtraido = text?.trim() ?? "";
    } catch (e) {
      console.error("[PDF parse error]", e.message);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PDF_ERROR",
            message: "No se pudo extraer el texto del PDF. Verifica que no esté protegido o sea un PDF de texto.",
          },
        },
        { status: 422 }
      );
    }

    if (textoExtraido.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PDF_VACIO",
            message: "El PDF parece estar vacío o es un PDF escaneado (imagen). Por favor usa un PDF con texto seleccionable.",
          },
        },
        { status: 422 }
      );
    }

    // Guardar texto en la BD (máx ~50.000 caracteres para no sobrepasar tokens del LLM)
    const textoGuardado = textoExtraido.slice(0, 50000);

    await prisma.caso.update({
      where: { id: caso.id },
      data: {
        autoJuzgado: textoGuardado,
        autoJuzgadoNombre: archivo.name,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        nombre: archivo.name,
        caracteres: textoGuardado.length,
        preview: textoGuardado.slice(0, 300),
      },
      message: "Auto del juzgado cargado correctamente",
    });
  } catch (error) {
    console.error("[POST /api/casos/:id/auto]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      );
    }

    const caso = await prisma.caso.findFirst({
      where: { id: params.id, userId: session.user.id, isActive: true },
    });
    if (!caso) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Caso no encontrado" } },
        { status: 404 }
      );
    }

    await prisma.caso.update({
      where: { id: caso.id },
      data: { autoJuzgado: null, autoJuzgadoNombre: null },
    });

    return NextResponse.json({ success: true, message: "Auto del juzgado eliminado" });
  } catch (error) {
    console.error("[DELETE /api/casos/:id/auto]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } },
      { status: 500 }
    );
  }
}
