import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SolicitarReembolsoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  chavePix?: string;
}
