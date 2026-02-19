/*
  Warnings:

  - Added the required column `ordem` to the `Pergunta_Resposta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pergunta_Resposta" ADD COLUMN     "ordem" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Resposta" ALTER COLUMN "ordem" DROP NOT NULL;
