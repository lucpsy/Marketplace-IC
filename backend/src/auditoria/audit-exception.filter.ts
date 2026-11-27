import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { AuditoriaService, extrairIpRequisicao } from './auditoria.service';

const RATE_LIMIT_LOG_COOLDOWN_MS = 30_000;

@Catch()
export class AuditExceptionFilter extends BaseExceptionFilter {
  private readonly rateLimitCooldown = new Map<string, number>();

  constructor(
    private readonly auditoriaService: AuditoriaService,
    httpAdapterHost: HttpAdapterHost,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'http' && exception instanceof HttpException) {
      this.registrarEventoSeguranca(exception, host);
    }
    super.catch(exception, host);
  }

  private registrarEventoSeguranca(
    exception: HttpException,
    host: ArgumentsHost,
  ) {
    try {
      const status = exception.getStatus();
      const req = host.switchToHttp().getRequest();
      const method = String(req?.method || 'GET').toUpperCase();
      const rawPath = String(req?.originalUrl || req?.url || '/').split('?')[0];
      const path = rawPath.replace(/^\/api\/?/, '/');
      const ip = extrairIpRequisicao(req);
      const userId = req?.user?.id ?? req?.user?.sub ?? null;

      // 1. Falha de login (força bruta / credenciais inválidas)
      if (
        status === HttpStatus.UNAUTHORIZED &&
        method === 'POST' &&
        /^\/auth\/login\/?$/i.test(path)
      ) {
        const emailTentado =
          typeof req?.body?.email === 'string'
            ? req.body.email.trim().slice(0, 180)
            : undefined;
        void this.auditoriaService.registrar({
          acao: 'LOGIN_FALHA',
          entidade: 'auth',
          ip,
          detalhes: {
            email: emailTentado,
            rota: rawPath,
          },
        });
        return;
      }

      // 2. Tentativa não autenticada em rota de escrita protegida (ignora GET /usuario/profile de checagem de sessão)
      if (
        status === HttpStatus.UNAUTHORIZED &&
        method !== 'GET' &&
        method !== 'HEAD' &&
        method !== 'OPTIONS'
      ) {
        void this.auditoriaService.registrar({
          acao: 'NAO_AUTORIZADO_401',
          entidade: 'seguranca',
          ip,
          detalhes: { metodo: method, rota: rawPath },
        });
        return;
      }

      // 3. Violação de controle de acesso / privilégio (403 Forbidden)
      if (status === HttpStatus.FORBIDDEN) {
        void this.auditoriaService.registrar({
          usuarioId: userId,
          acao: 'ACESSO_NEGADO_403',
          entidade: 'seguranca',
          ip,
          detalhes: { metodo: method, rota: rawPath },
        });
        return;
      }

      // 4. Excesso de requisições (429 Too Many Requests) com cooldown para evitar log flooding
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        const dedupKey = `${ip || 'unknown'}:${path}`;
        const now = Date.now();
        const ultimo = this.rateLimitCooldown.get(dedupKey) ?? 0;
        if (now - ultimo < RATE_LIMIT_LOG_COOLDOWN_MS) {
          return;
        }
        if (this.rateLimitCooldown.size > 5_000) {
          this.rateLimitCooldown.clear();
        }
        this.rateLimitCooldown.set(dedupKey, now);

        void this.auditoriaService.registrar({
          usuarioId: userId,
          acao: 'RATE_LIMIT_429',
          entidade: 'seguranca',
          ip,
          detalhes: { metodo: method, rota: rawPath },
        });
      }
    } catch {
      // Nunca interrompe o tratamento padrão de erro HTTP
    }
  }
}
