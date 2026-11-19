import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemCarrinhoDto {
  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @Min(0, { message: 'A quantidade não pode ser negativa' })
  quantidade: number;
}
