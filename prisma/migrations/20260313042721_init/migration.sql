-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ABOGADO', 'ASISTENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoTutela" AS ENUM ('SALUD', 'TRABAJO', 'EDUCACION', 'PENSION', 'VIVIENDA', 'DEBIDO_PROCESO', 'INTIMIDAD', 'IGUALDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCaso" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'CONTESTADA', 'VENCIDA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ABOGADO',
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "casos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accionante" TEXT NOT NULL,
    "accionado" TEXT NOT NULL,
    "hechos" TEXT NOT NULL,
    "derechosInvocados" TEXT NOT NULL,
    "tipoTutela" "TipoTutela" NOT NULL DEFAULT 'OTRO',
    "juez" TEXT,
    "juzgado" TEXT,
    "radicado" TEXT,
    "fechaNotificacion" TIMESTAMP(3) NOT NULL,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "diasRestantes" INTEGER,
    "estado" "EstadoCaso" NOT NULL DEFAULT 'PENDIENTE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contestaciones" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generadoPorIA" BOOLEAN NOT NULL DEFAULT true,
    "modeloIA" TEXT,
    "tokensUsados" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contestaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "casos_userId_idx" ON "casos"("userId");

-- CreateIndex
CREATE INDEX "casos_estado_idx" ON "casos"("estado");

-- CreateIndex
CREATE INDEX "casos_fechaLimite_idx" ON "casos"("fechaLimite");

-- CreateIndex
CREATE INDEX "casos_userId_estado_idx" ON "casos"("userId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "contestaciones_casoId_key" ON "contestaciones"("casoId");

-- CreateIndex
CREATE INDEX "contestaciones_casoId_idx" ON "contestaciones"("casoId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contestaciones" ADD CONSTRAINT "contestaciones_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
