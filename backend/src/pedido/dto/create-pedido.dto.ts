import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  METODOS_PAGAMENTO,
  MetodoPagamento,
} from '../../pagamento/dto/create-pagamento.dto';
import {
  COMPROVANTE_URL_MESSAGE,
  COMPROVANTE_URL_REGEX,
} from '../../common/security/url-validation';

export class CreatePedidoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigoCupom?: string;

  @IsOptional()
  @IsString()
  @IsIn(METODOS_PAGAMENTO, {
    message: 'metodoPagamento deve ser pix, cartao ou dinheiro',
  })
  metodoPagamento?: MetodoPagamento;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Matches(COMPROVANTE_URL_REGEX, { message: COMPROVANTE_URL_MESSAGE })
  comprovanteUrl?: string;
}
