import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAccountDto} from './dto/create-account.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { UsuarioService } from 'usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import *  as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly usuarioService:UsuarioService,private readonly jwtService: JwtService,){}

    async create(dto: CreateAccountDto) {
        const senha_hash = await bcrypt.hash(dto.senha,10);
        await this.usuarioService.createUser({nome:dto.nome,email:dto.email,senhaHash:senha_hash,telefone:dto.telefone});
        
        return this.login({email:dto.email,senha:dto.senha});
    }

    async login(dto: LoginAccountDto){
        const usuario = await this.usuarioService.findOneByEmailWithPassword(dto.email);
        if(!usuario) throw new UnauthorizedException("email ou senha invalidos");
        const senha_valida = await bcrypt.compare(dto.senha,usuario.senhaHash);
        if(!senha_valida) throw new UnauthorizedException("email ou senha invalidos");

        const payload = {
            sub: usuario.idUsuario,
            role: usuario.cargo,
        }
        return{
            access_token: await this.jwtService.signAsync(payload),
        }; 
    }

}
