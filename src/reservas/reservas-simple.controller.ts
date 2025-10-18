import { Controller } from '@nestjs/common'

@Controller('reservas-simple')
export class ReservasSimpleController {
  test() {
    return { message: 'Controlador simple funcionando!' }
  }
}