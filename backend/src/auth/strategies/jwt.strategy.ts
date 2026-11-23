import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsuarioService } from "../../usuario/usuario.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarioService:UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioService.findOneById(payload.sub);
    if (!usuario || usuario.status !== 'ativo') {
      throw new UnauthorizedException('Usuario inexsitente ou desativado');
    }
    return {
      id: usuario.idUsuario,
      role: usuario.cargo,
    };
  }
}