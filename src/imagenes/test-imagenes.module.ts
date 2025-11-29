import { Module } from '@nestjs/common';
import { TestImagenesController } from './test-imagenes.controller';

@Module({
  controllers: [TestImagenesController],
})
export class TestImagenesModule {}
