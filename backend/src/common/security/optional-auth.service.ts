import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsuarioService } from '../../usuario/usuario.service';
import { getJwtSecret } from '../config/env.config';
import { extractJwtFromRequest } from './auth-cookie';

@Injectable()
export class OptionalAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async isActiveAdmin(req: Request): Promise<boolean> {
    if ((req as any)?.user?.role === 'admin') {
      return true;
    }

    const token = extractJwtFromRequest(req);
    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: getJwtSecret(),
      });
      if (!payload?.sub) return false;

      const usuario = await this.usuarioService.findOneById(
        String(payload.sub),
      );
      return Boolean(
        usuario && usuario.status === 'ativo' && usuario.cargo === 'admin',
      );
    } catch {
      return false;
    }
  }
}
