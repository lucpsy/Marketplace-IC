import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Observable, tap } from 'rxjs';
import { isProduction } from '../config/env.config';

export const AUTH_COOKIE_NAME = 'diacom_token';
const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60; // 1 dia

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;

  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = part.slice(0, eqIdx).trim();
    const rawVal = part.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(rawVal);
    } catch {
      result[key] = rawVal;
    }
  }
  return result;
}

export function extractJwtFromRequest(req: any): string | null {
  const cookieToken = parseCookies(req?.headers?.cookie)[AUTH_COOKIE_NAME];
  if (cookieToken && cookieToken.trim()) {
    return cookieToken.trim();
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

function resolveSameSite(): 'Lax' | 'Strict' | 'None' {
  const raw = (process.env.COOKIE_SAME_SITE || 'lax').trim().toLowerCase();
  if (raw === 'strict') return 'Strict';
  if (raw === 'none') return 'None';
  return 'Lax';
}

export function buildAuthCookieHeader(
  token: string,
  maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS,
): string {
  const sameSite = resolveSameSite();
  const secure =
    isProduction() ||
    process.env.COOKIE_SECURE === 'true' ||
    sameSite === 'None';
  const domain = process.env.COOKIE_DOMAIN?.trim();

  const attrs = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
  ];

  if (secure) attrs.push('Secure');
  if (domain) attrs.push(`Domain=${domain}`);

  return attrs.join('; ');
}

export function buildClearAuthCookieHeader(): string {
  const sameSite = resolveSameSite();
  const secure =
    isProduction() ||
    process.env.COOKIE_SECURE === 'true' ||
    sameSite === 'None';
  const domain = process.env.COOKIE_DOMAIN?.trim();

  const attrs = [
    `${AUTH_COOKIE_NAME}=`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
  ];

  if (secure) attrs.push('Secure');
  if (domain) attrs.push(`Domain=${domain}`);

  return attrs.join('; ');
}

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const path = String(req?.originalUrl || req?.url || '').split('?')[0];

    const isLoginRoute =
      req?.method === 'POST' && /\/auth\/login\/?$/i.test(path);

    if (!isLoginRoute) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        if (data && typeof data.access_token === 'string' && !res.headersSent) {
          res.setHeader('Set-Cookie', buildAuthCookieHeader(data.access_token));
        }
      }),
    );
  }
}
