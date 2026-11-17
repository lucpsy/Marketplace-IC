import { IsEmail, IsString, MinLength } from 'class-validator';


export class LoginAccountDto{
    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(8)
    senha: string;
}