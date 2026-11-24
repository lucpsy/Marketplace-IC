import { IsOptional, IsString } from 'class-validator';

export class UpdateStatusPedidoDto {
  @IsOptional()
  @IsString()
  idStatus?: string;

  @IsOptional()
  @IsString()
  nomeStatus?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsString()
  pinRetirada?: string;
}
