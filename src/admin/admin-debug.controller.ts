import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin-debug")
export class AdminDebugController {
  constructor(private readonly prisma: PrismaService) {
    console.log(
      "[AdminDebugController] Cargado y listo. Ruta: GET /api/admin-debug/ping",
    );
  }

  @Get("ping")
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }

  @Get("db-check")
  async checkDb() {
    try {
      // 1. Verificar conexión básica
      const connectionCheck = await this.prisma
        .$queryRaw`SELECT 1 as connected`;

      // 2. Listar tablas en el esquema public
      const tables: any[] = await this.prisma
        .$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;

      // 3. Contar usuarios (ejemplo simple)
      const userCount = await this.prisma.usuario.count();

      return {
        status: "online",
        connection: connectionCheck,
        tableCount: tables.length,
        tables: tables.map((t) => t.table_name),
        userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "offline",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
