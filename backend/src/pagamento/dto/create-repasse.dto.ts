import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { METODOS_PAGAMENTO, MetodoPagamento } from './create-pagamento.dto';

export const STATUS_REPASSE = ['concluido', 'processando'] as const;
export type StatusRepasse = (typeof STATUS_REPASSE)[number];

export class CreateRepasseDto {
  @IsString()
  @IsNotEmpty({ message: 'A finalidade/descrição do repasse é obrigatória' })
  descricao: string;

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
  @IsDateString({}, { message: 'dataPagamento deve ser uma data ISO válida' })
  dataPagamento?: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do validador institucional é obrigatório' })
  @MaxLength(150)
  validadorNome: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  validadorCargo?: string;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_REPASSE, {
    message: 'status do repasse deve ser concluido ou processando',
  })
  status?: StatusRepasse;

  @IsString()
  @IsNotEmpty({ message: 'É obrigatório anexar o comprovante do repasse' })
  comprovanteUrl: string;
}
