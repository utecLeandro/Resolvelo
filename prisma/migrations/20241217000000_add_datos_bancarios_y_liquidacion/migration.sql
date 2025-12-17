-- AlterEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'TipoTransaccion' AND e.enumlabel = 'LIQUIDACION') THEN
        ALTER TYPE "TipoTransaccion" ADD VALUE 'LIQUIDACION';
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "datos_bancarios" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "datos_bancarios_usuarioId_key" ON "datos_bancarios"("usuarioId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'datos_bancarios_usuarioId_fkey') THEN
        ALTER TABLE "datos_bancarios" ADD CONSTRAINT "datos_bancarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
