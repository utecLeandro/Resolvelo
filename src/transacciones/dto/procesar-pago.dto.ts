import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcesarPagoDto {
  @IsString()
  @IsNotEmpty()
  reservaId: string;

  @IsString()
  @IsOptional()
  metodoPago?: string = 'TARJETA_CREDITO';

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class RespuestaPagoDto {
  exito: boolean;
  transaccionId: string;
  referenciaExterna: string;
  mensaje: string;
  fechaProcesamiento: Date;
}
