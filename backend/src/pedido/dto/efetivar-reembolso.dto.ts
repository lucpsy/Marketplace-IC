import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  COMPROVANTE_URL_MESSAGE,
  COMPROVANTE_URL_REGEX,
} from '../../common/security/url-validation';

export class EfetivarReembolsoDto {
  @IsString()
  @IsNotEmpty({
    message: 'É obrigatório anexar o comprovante de reembolso',
  })
  @MaxLength(300)
  @Matches(COMPROVANTE_URL_REGEX, { message: COMPROVANTE_URL_MESSAGE })
  comprovanteReembolsoUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
