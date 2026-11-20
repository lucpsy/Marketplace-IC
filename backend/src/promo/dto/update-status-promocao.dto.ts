import { IsIn, IsString } from 'class-validator';
import { STATUS_PROMOCAO, StatusPromocao } from './create-promocao.dto';

export class UpdateStatusPromocaoDto {
  @IsString()
  @IsIn(STATUS_PROMOCAO, {
    message: 'status deve ser rascunho, ativa, inativa ou encerrada',
  })
  status: StatusPromocao;
}
