import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PresignRequestDto, PresignResponse } from './dto/presign.dto'
import { ImagenesService } from './imagenes.service'

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  async presign(@Body() dto: PresignRequestDto): Promise<PresignResponse> {
    return this.imagenesService.generarPresignUrls(dto)
  }
}

