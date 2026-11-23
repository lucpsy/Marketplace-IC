import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { STATUS_PAGAMENTO, StatusPagamento } from './create-pagamento.dto';

export class UpdateStatusPagamentoDto {
  @IsString()
  @IsIn(STATUS_PAGAMENTO, {
    message:
      'status deve ser pendente, processando, concluido, estornado ou cancelado',
  })
  status: StatusPagamento;

  @IsOptional()
  @IsDateString({}, { message: 'dataPagamento deve ser uma data ISO válida' })
  dataPagamento?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
