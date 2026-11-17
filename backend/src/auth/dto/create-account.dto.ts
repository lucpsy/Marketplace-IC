import {IsNotEmpty, IsString,IsEmail,MinLength, IsOptional} from 'class-validator'; 

export class CreateAccountDto{
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    senha: string;
    @IsOptional()
    @IsString()
    telefone?: string;
}