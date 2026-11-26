import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  COMPROVANTE_URL_MESSAGE,
  COMPROVANTE_URL_REGEX,
} from '../../common/security/url-validation';

export const TIPOS_LANCAMENTO = ['entrada', 'saida'] as const;
export type TipoLancamento = (typeof TIPOS_LANCAMENTO)[number];

export const CATEGORIAS_FINANCEIRAS = [
  'venda',
  'taxa',
  'custo',
  'repasse',
  'estorno',
  'outro',
] as const;
export type CategoriaFinanceira = (typeof CATEGORIAS_FINANCEIRAS)[number];

export const METODOS_PAGAMENTO = ['pix', 'cartao', 'dinheiro'] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export const STATUS_PAGAMENTO = [
  'pendente',
  'processando',
  'concluido',
  'estornado',
  'cancelado',
] as const;
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

export class CreatePagamentoDto {
  @IsOptional()
  @IsString()
  idPedido?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'valor deve ser numérico' })
  @Min(0.01, { message: 'valor deve ser maior que zero' })
  valor: number;

  @IsString()
  @IsIn(METODOS_PAGAMENTO, {
    message: 'metodo deve ser pix, cartao ou dinheiro',
  })
  metodo: MetodoPagamento;

  @IsOptional()
  @IsString()
  @IsIn(TIPOS_LANCAMENTO, {
    message: 'tipo deve ser entrada ou saida',
  })
  tipo?: TipoLancamento;

  @IsOptional()
  @IsString()
  @IsIn(CATEGORIAS_FINANCEIRAS, {
    message: 'categoria deve ser venda, taxa, custo, repasse, estorno ou outro',
  })
  categoria?: CategoriaFinanceira;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_PAGAMENTO, {
    message:
      'status deve ser pendente, processando, concluido, estornado ou cancelado',
  })
  status?: StatusPagamento;

  @IsOptional()
  @IsDateString({}, { message: 'dataPagamento deve ser uma data ISO válida' })
  dataPagamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenciaGateway?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  validadorNome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  validadorCargo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Matches(COMPROVANTE_URL_REGEX, { message: COMPROVANTE_URL_MESSAGE })
  comprovanteUrl?: string;
}
