import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemCarrinhoDto {
  @IsString()
  @IsNotEmpty({ message: 'O idProduto é obrigatório' })
  idProduto: string;

  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @Min(1, { message: 'A quantidade mínima é 1' })
  quantidade: number;
}
