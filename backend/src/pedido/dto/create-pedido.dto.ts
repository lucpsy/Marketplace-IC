import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoDto {
  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'valorDesconto deve ser numérico' })
  @Min(0, { message: 'valorDesconto não pode ser negativo' })
  valorDesconto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'frete deve ser numérico' })
  @Min(0, { message: 'frete não pode ser negativo' })
  frete?: number;
}
