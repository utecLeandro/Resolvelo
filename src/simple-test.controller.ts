import { Controller, Get } from '@nestjs/common';

@Controller('simple-test')
export class SimpleTestController {
  
  @Get('test')
  getTest(): any {
    return { 
      message: 'Simple test funcionando',
      timestamp: new Date().toISOString()
    };
  }
}