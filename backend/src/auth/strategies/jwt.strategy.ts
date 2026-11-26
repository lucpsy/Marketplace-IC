import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { UsuarioService } from "../../usuario/usuario.service";
import { getJwtSecret } from "../../common/config/env.config";
import { extractJwtFromRequest } from "../../common/security/auth-cookie";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarioService: UsuarioService) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioService.findOneById(String(payload.sub));
    if (!usuario || usuario.status !== "ativo") {
      throw new UnauthorizedException("Usuário inexistente ou desativado");
    }
    return {
      id: usuario.idUsuario,
      role: usuario.cargo,
    };
  }
}