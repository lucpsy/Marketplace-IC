import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  senhaHash: string;

  @IsOptional()
  @IsString()
  telefone?: string;
}