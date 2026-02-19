-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PLAYER');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pergunta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pergunta_Resposta" (
    "id" TEXT NOT NULL,
    "id_pergunta" TEXT NOT NULL,
    "id_resposta" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pergunta_Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partida" (
    "id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "Partida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rodada_Partida" (
    "id" TEXT NOT NULL,
    "id_partida" TEXT NOT NULL,
    "id_pergunta" TEXT NOT NULL,
    "id_resposta_correta" TEXT NOT NULL,
    "id_resposta_escolhida" TEXT NOT NULL,
    "acertou" BOOLEAN NOT NULL,

    CONSTRAINT "Rodada_Partida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pergunta_Resposta_id_pergunta_id_resposta_key" ON "Pergunta_Resposta"("id_pergunta", "id_resposta");

-- AddForeignKey
ALTER TABLE "Pergunta_Resposta" ADD CONSTRAINT "Pergunta_Resposta_id_pergunta_fkey" FOREIGN KEY ("id_pergunta") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pergunta_Resposta" ADD CONSTRAINT "Pergunta_Resposta_id_resposta_fkey" FOREIGN KEY ("id_resposta") REFERENCES "Resposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rodada_Partida" ADD CONSTRAINT "Rodada_Partida_id_partida_fkey" FOREIGN KEY ("id_partida") REFERENCES "Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rodada_Partida" ADD CONSTRAINT "Rodada_Partida_id_pergunta_fkey" FOREIGN KEY ("id_pergunta") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
