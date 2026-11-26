import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAccountDto } from "./dto/create-account.dto";
import { LoginAccountDto } from "./dto/login-account.dto";
import { UsuarioService } from "../usuario/usuario.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

// Hash dummy válido para manter tempo constante de comparação quando o e-mail não existe
const DUMMY_PASSWORD_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8pGsR2Jk2vH1A1yQvP5r2X6fV9yK2e";

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  private validarTamanhoSenha(senha: string) {
    if (!senha || senha.length < 8) {
      throw new BadRequestException("A senha deve ter ao menos 8 caracteres.");
    }
    if (Buffer.byteLength(senha, "utf8") > 72) {
      throw new BadRequestException(
        "A senha deve ter no máximo 72 bytes.",
      );
    }
  }

  async create(dto: CreateAccountDto) {
    this.validarTamanhoSenha(dto.senha);
    const emailNormalizado = dto.email.trim().toLowerCase();
    const senha_hash = await bcrypt.hash(dto.senha, 10);
    await this.usuarioService.createUser({
      nome: dto.nome.trim(),
      email: emailNormalizado,
      senhaHash: senha_hash,
      telefone: dto.telefone,
    });

    return {
      message: "Conta criada com sucesso.",
    };
  }

  async login(dto: LoginAccountDto) {
    if (!dto.senha || Buffer.byteLength(dto.senha, "utf8") > 72) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    const emailNormalizado = dto.email.trim().toLowerCase();
    const usuario = await this.usuarioService.findOneByEmailWithPassword(
      emailNormalizado,
    );

    const hashAlvo = usuario?.senhaHash || DUMMY_PASSWORD_HASH;
    const senha_valida = await bcrypt.compare(dto.senha, hashAlvo);

    if (!usuario || !senha_valida || usuario.status !== "ativo") {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    const payload = {
      sub: usuario.idUsuario,
      role: usuario.cargo,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }
}
