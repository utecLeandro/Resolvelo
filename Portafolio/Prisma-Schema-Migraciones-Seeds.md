# Prisma: Schema, Migraciones y Seeds

## Ubicación Canonical
- El esquema principal está en `context/schema.prisma` (autoridad del modelo de datos).
- Existe también `prisma/schema.prisma` usado en flujos locales, pero la referencia oficial es el de `context/`.

## Migraciones
- Producción (RDS):
  - Exportar `DATABASE_URL` con credenciales de RDS.
  - Ejecutar `npx prisma migrate deploy --schema context/schema.prisma`.
- Desarrollo (local):
  - `DATABASE_URL` apuntando a PostgreSQL local o Docker.
  - Ejecutar migraciones y luego `npx prisma db push` si corresponde.

## Seeds
- Ejecutar `npx prisma db seed` para poblar datos de prueba.
- Script: `prisma/seed.ts` crea usuarios, publicaciones, reservas y transacciones.
- Referencias:
  - Hashing y salt de contraseñas: `prisma/seed.ts:20-27`.
  - Usuarios creados: `prisma/seed.ts:213-219`.

## Consideraciones
- No modificar `schema.prisma` sin aprobación previa.
- Respetar enums y relaciones existentes.
- Mantener compatibilidad con el flujo de migraciones en contenedor (`entrypoint.sh`).