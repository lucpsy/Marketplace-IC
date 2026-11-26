import { Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';
import { buildClearAuthCookieHeader } from '../common/security/auth-cookie';

@Controller('auth')
export class AuthSessionController {
  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', buildClearAuthCookieHeader());
    return { message: 'Sessão encerrada com sucesso' };
  }
}
