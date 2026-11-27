import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import {
  buildClearAuthCookieHeader,
  extractJwtFromRequest,
} from '../common/security/auth-cookie';
import { getJwtSecret } from '../common/config/env.config';
import {
  AuditoriaService,
  extrairIpRequisicao,
} from '../auditoria/auditoria.service';

@Controller('auth')
export class AuthSessionController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    (req as any).__auditSkip = true;
    const token = extractJwtFromRequest(req);
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: getJwtSecret(),
        });
        if (payload?.sub) {
          void this.auditoriaService.registrar({
            usuarioId: String(payload.sub),
            idRegistro: String(payload.sub),
            acao: 'LOGOUT',
            entidade: 'auth',
            ip: extrairIpRequisicao(req),
          });
        }
      } catch {
        // Token expirado/inválido no logout — apenas limpa o cookie
      }
    }

    res.setHeader('Set-Cookie', buildClearAuthCookieHeader());
    return { message: 'Sessão encerrada com sucesso' };
  }
}
