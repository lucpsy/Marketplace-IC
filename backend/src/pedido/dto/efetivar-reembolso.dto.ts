import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class EfetivarReembolsoDto {
  @IsString()
  @IsNotEmpty({
    message: 'É obrigatório anexar o comprovante de reembolso',
  })
  comprovanteReembolsoUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
