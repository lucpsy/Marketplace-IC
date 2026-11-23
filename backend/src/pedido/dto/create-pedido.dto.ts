import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  METODOS_PAGAMENTO,
  MetodoPagamento,
} from '../../pagamento/dto/create-pagamento.dto';

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
  @IsString()
  codigoCupom?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'frete deve ser numérico' })
  @Min(0, { message: 'frete não pode ser negativo' })
  frete?: number;

  @IsOptional()
  @IsString()
  @IsIn(METODOS_PAGAMENTO, {
    message: 'metodoPagamento deve ser pix, cartao ou dinheiro',
  })
  metodoPagamento?: MetodoPagamento;
}
