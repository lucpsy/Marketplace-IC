import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImagemProdutoDto {
  @IsString()
  @IsNotEmpty()
  urlImagem: string;

  @IsOptional()
  @IsString()
  textoAlternativo?: string;

  @IsOptional()
  @IsNumber()
  ordem?: number;

  @IsOptional()
  imagemPrincipal?: boolean;
}

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  selo?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(0)
  precoCusto: number;

  @IsNumber()
  @Min(0)
  precoVenda: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoque?: number;

  @IsString()
  @IsNotEmpty()
  idFornecedor: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriaIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagemProdutoDto)
  imagens?: ImagemProdutoDto[];
}
