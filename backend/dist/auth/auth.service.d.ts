import { CreateAccountDto } from './dto/create-account.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { UsuarioService } from "../usuario/usuario.service";
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly usuarioService;
    private readonly jwtService;
    constructor(usuarioService: UsuarioService, jwtService: JwtService);
    create(dto: CreateAccountDto): Promise<{
        access_token: string;
    }>;
    login(dto: LoginAccountDto): Promise<{
        access_token: string;
    }>;
}
