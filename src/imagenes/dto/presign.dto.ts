import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PresignFileDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  size!: number;
}

export class PresignRequestDto {
  @IsString()
  @IsNotEmpty()
  publicacionId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PresignFileDto)
  files!: PresignFileDto[];
}

export type PresignUploadUrl = {
  key: string;
  url: string;
  method: 'PUT';
  expiresAt: string;
  contentType: string;
};

export type PresignResponse = {
  uploads: PresignUploadUrl[];
};
