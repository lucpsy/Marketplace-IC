import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty({ message: 'A razão social é obrigatória' })
  nomeRazaoSocial: string;

  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dadosPagamento?: string;
}
