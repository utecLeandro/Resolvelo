import { Controller, Get } from '@nestjs/common';

@Controller('test-imagenes')
export class TestImagenesController {
  @Get('test')
  getTest() {
    return {
      message: 'Test controlador de imágenes funcionando',
      timestamp: new Date().toISOString(),
    };
  }
}
