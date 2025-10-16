import { Controller, Get, Param, Patch, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto'

@Controller('usuarios')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async actualizarPerfil(
    @Param('id') id: string,
    @Body() body: ActualizarPerfilDto,
  ) {
    return this.usuariosService.actualizarPerfil(id, body)
  }
}