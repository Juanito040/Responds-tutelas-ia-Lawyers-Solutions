// GET /api/contestaciones/:id/exportar?formato=word
// Exporta la contestación como archivo .docx

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageMargin, Header, Footer, PageNumber,
} from "docx";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const contestacion = await prisma.contestacion.findFirst({
      where: { id: params.id, caso: { userId: session.user.id } },
      include: {
        caso: {
          select: { accionante: true, accionado: true, juzgado: true, juez: true, radicado: true, fechaNotificacion: true },
        },
      },
    });

    if (!contestacion) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 });
    }

    const doc = buildWordDocument(contestacion);
    const buffer = await Packer.toBuffer(doc);

    const accionante = contestacion.caso.accionante.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const fecha = new Date().toISOString().split("T")[0];
    const filename = `Contestacion_Tutela_${accionante}_${fecha}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("[GET /api/contestaciones/:id/exportar]", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR" } }, { status: 500 });
  }
}

function buildWordDocument(contestacion) {
  const { contenido, caso } = contestacion;
  const lineas = contenido.split("\n").filter(l => l.trim());

  const parrafos = lineas.map(linea => {
    const esEncabezado = linea.startsWith("#");
    const texto = linea.replace(/^#+\s*/, "").trim();

    if (esEncabezado) {
      return new Paragraph({
        text: texto,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      });
    }

    return new Paragraph({
      children: [new TextRun({ text: texto, size: 24, font: "Times New Roman" })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 120, line: 360 },
    });
  });

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Accionante: ${caso.accionante} | Accionado: ${caso.accionado}`, size: 18, color: "666666" }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Página ", size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                new TextRun({ text: " de ", size: 18 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: parrafos,
    }],
  });
}
