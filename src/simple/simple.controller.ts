import { Controller, Get } from '@nestjs/common';

@Controller('simple')
export class SimpleController {
  @Get()
  getHello() {
    return { message: 'Simple module working!' };
  }
}
