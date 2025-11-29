import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PayerIdentificationDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  number?: string;
}

class PayerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PayerIdentificationDto)
  identification?: PayerIdentificationDto;
}

export class ProcesarPagoBrickDto {
  @IsNumber()
  transaction_amount!: number;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  payment_method_id?: string;

  @IsOptional()
  @IsNumber()
  installments?: number;

  @IsOptional()
  @IsString()
  issuer_id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PayerDto)
  payer?: PayerDto;

  @IsOptional()
  @IsString()
  preferenceId?: string;

  @IsOptional()
  @IsString()
  transaccionId?: string;

  @IsOptional()
  @IsBoolean()
  binary_mode?: boolean;
}
