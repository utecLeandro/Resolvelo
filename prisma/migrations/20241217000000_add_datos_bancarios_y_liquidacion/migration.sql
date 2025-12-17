-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'LIQUIDACION';

-- CreateTable
CREATE TABLE "datos_bancarios" (
    "id" BIGSERIAL NOT NULL,
    "banco" VARCHAR(100) NOT NULL,
    "tipoCuenta" VARCHAR(50) NOT NULL,
    "numeroCuenta" VARCHAR(255) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'UYU',
    "titular" VARCHAR(100) NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "datos_bancarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "datos_bancarios_usuarioId_key" ON "datos_bancarios"("usuarioId");

-- AddForeignKey
ALTER TABLE "datos_bancarios" ADD CONSTRAINT "datos_bancarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
