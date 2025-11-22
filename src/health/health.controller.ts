/**
 * Controlador de salud para healthcheck del contenedor y docker-compose.
 */
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  /**
   * Endpoint simple que devuelve OK para verificar que el servicio está corriendo.
   */
  @Get()
  getHealth() {
    return { status: "OK" };
  }

  @Get("test")
  getTest() {
    return { message: "Test working!" };
  }
}
