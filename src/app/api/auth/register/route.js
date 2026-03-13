// POST /api/auth/register — api-quality: 201, 400, 409, validación server-side
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validación completa server-side — api-quality skill
    const errors = {};

    if (!name?.trim())                          errors.name = "El nombre es requerido";
    if (name?.trim().length < 2)               errors.name = "El nombre debe tener al menos 2 caracteres";
    if (!email?.trim())                         errors.email = "El correo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "El correo no es válido";
    if (!password)                              errors.password = "La contraseña es requerida";
    if (password?.length < 8)                  errors.password = "Mínimo 8 caracteres";
    if (!/\d/.test(password))                  errors.password = "Debe contener al menos un número";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: errors } },
        { status: 422 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar email duplicado — 409 Conflict
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_TAKEN", message: "Este correo ya está registrado" } },
        { status: 409 }
      );
    }

    // Hash seguro con bcrypt (12 rounds) — security-audit
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(
      { success: true, data: user, message: "Cuenta creada correctamente" },
      { status: 201 }
    );

  } catch (error) {
    // Nunca exponer detalles internos — api-quality skill
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Error interno del servidor" } },
      { status: 500 }
    );
  }
}
