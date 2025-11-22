import { Controller, Get } from "@nestjs/common";

@Controller("admin-debug")
export class AdminDebugController {
  constructor() {
    console.log(
      "[AdminDebugController] Cargado y listo. Ruta: GET /api/admin-debug/ping",
    );
  }

  @Get("ping")
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
