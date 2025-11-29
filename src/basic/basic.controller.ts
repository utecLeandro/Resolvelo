/**
 * Controlador básico para pruebas.
 */
import { Controller, Get } from '@nestjs/common';

@Controller('basic')
export class BasicController {
  /**
   * Endpoint simple que devuelve un mensaje básico.
   */
  @Get()
  getBasic() {
    return { message: 'Basic working!' };
  }
}
