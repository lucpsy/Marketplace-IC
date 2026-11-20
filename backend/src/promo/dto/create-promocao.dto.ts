import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const TIPOS_DESCONTO = ['percentual', 'fixo', 'frete_gratis'] as const;
export type TipoDesconto = (typeof TIPOS_DESCONTO)[number];

export const STATUS_PROMOCAO = [
  'rascunho',
  'ativa',
  'inativa',
  'encerrada',
] as const;
export type StatusPromocao = (typeof STATUS_PROMOCAO)[number];

export class CreatePromocaoDto {
  @IsString()
  @IsNotEmpty({ message: 'O título da promoção é obrigatório' })
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  @IsIn(TIPOS_DESCONTO, {
    message: 'tipoDesconto deve ser percentual, fixo ou frete_gratis',
  })
  tipoDesconto: TipoDesconto;

  @Type(() => Number)
  @IsNumber({}, { message: 'valorDesconto deve ser numérico' })
  @Min(0, { message: 'valorDesconto não pode ser negativo' })
  valorDesconto: number;

  @IsDateString({}, { message: 'dataInicio deve ser uma data ISO válida' })
  dataInicio: string;

  @IsDateString({}, { message: 'dataFim deve ser uma data ISO válida' })
  dataFim: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'valorMinimo deve ser numérico' })
  @Min(0, { message: 'valorMinimo não pode ser negativo' })
  valorMinimo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'quantidadeMinima deve ser um número inteiro' })
  @Min(1, { message: 'quantidadeMinima deve ser no mínimo 1' })
  quantidadeMinima?: number;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_PROMOCAO, {
    message: 'status deve ser rascunho, ativa, inativa ou encerrada',
  })
  status?: StatusPromocao;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  produtoIds?: string[];
}
