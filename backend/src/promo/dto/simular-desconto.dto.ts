import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSimulacaoDescontoDto {
  @IsString()
  @IsNotEmpty()
  idProduto: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantidade: number;
}

export class SimularDescontoDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Informe ao menos um item para simular o desconto' })
  @ValidateNested({ each: true })
  @Type(() => ItemSimulacaoDescontoDto)
  itens: ItemSimulacaoDescontoDto[];

  @IsOptional()
  @IsString()
  codigoCupom?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  frete?: number;
}
