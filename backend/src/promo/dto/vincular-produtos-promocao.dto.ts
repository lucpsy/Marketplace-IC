import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class VincularProdutosPromocaoDto {
  @IsArray({ message: 'produtoIds deve ser uma lista de IDs' })
  @ArrayNotEmpty({ message: 'Informe ao menos um id de produto' })
  @IsString({ each: true })
  produtoIds: string[];
}
