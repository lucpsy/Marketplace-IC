import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidarCupomDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o código do cupom' })
  codigo: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'subtotal deve ser numérico' })
  @Min(0, { message: 'subtotal não pode ser negativo' })
  subtotal?: number;
}
