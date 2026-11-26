import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'diacom_rate_limit';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  scope?: string;
}

export const RateLimit = (
  limit: number,
  windowMs: number,
  scope?: string,
) => SetMetadata(RATE_LIMIT_KEY, { limit, windowMs, scope });

interface BucketEntry {
  count: number;
  resetAt: number;
}

const MAX_BUCKET_KEYS = 50_000;

const BUILTIN_ROUTE_POLICIES: Array<{
  method: string;
  pattern: RegExp;
  options: RateLimitOptions;
}> = [
  {
    method: 'POST',
    pattern: /\/auth\/login\/?$/i,
    options: { limit: 8, windowMs: 60_000, scope: 'auth-login' },
  },
  {
    method: 'POST',
    pattern: /\/auth\/register\/?$/i,
    options: { limit: 5, windowMs: 15 * 60_000, scope: 'auth-register' },
  },
];

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly defaultLimit = Number(
    process.env.RATE_LIMIT_DEFAULT_MAX || 120,
  );
  private readonly defaultWindowMs = Number(
    process.env.RATE_LIMIT_DEFAULT_WINDOW_MS || 60_000,
  );

  constructor(private readonly reflector: Reflector) {
    const timer = setInterval(() => this.pruneExpired(), 60_000);
    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const method = String(req?.method || 'GET').toUpperCase();
    const path = String(req?.originalUrl || req?.url || '/').split('?')[0];

    if (/\/health\/?$/i.test(path)) {
      return true;
    }

    const decoratorPolicy = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const builtinPolicy = BUILTIN_ROUTE_POLICIES.find(
      (rule) => rule.method === method && rule.pattern.test(path),
    )?.options;

    const policy: RateLimitOptions = decoratorPolicy ??
      builtinPolicy ?? {
        limit: this.defaultLimit,
        windowMs: this.defaultWindowMs,
        scope: 'global',
      };

    const clientIp = String(
      req?.ip || req?.socket?.remoteAddress || 'unknown',
    ).replace(/^::ffff:/, '');
    const userId = req?.user?.id ?? req?.user?.sub;

    const key =
      policy.scope === 'global'
        ? `global:${clientIp}`
        : `${policy.scope || `${method}:${path}`}:${userId ? `u:${userId}` : `ip:${clientIp}`}`;

    const now = Date.now();
    let entry = this.buckets.get(key);

    if (!entry || now >= entry.resetAt) {
      if (this.buckets.size >= MAX_BUCKET_KEYS) {
        this.pruneExpired(now);
        if (this.buckets.size >= MAX_BUCKET_KEYS) {
          const oldestKey = this.buckets.keys().next().value;
          if (oldestKey) this.buckets.delete(oldestKey);
        }
      }
      entry = { count: 0, resetAt: now + policy.windowMs };
      this.buckets.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, policy.limit - entry.count);
    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    if (res && typeof res.setHeader === 'function' && !res.headersSent) {
      res.setHeader('X-RateLimit-Limit', String(policy.limit));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(resetSeconds));
    }

    if (entry.count > policy.limit) {
      if (res && typeof res.setHeader === 'function' && !res.headersSent) {
        res.setHeader('Retry-After', String(resetSeconds));
      }
      throw new HttpException(
        'Muitas requisições em sequência. Aguarde alguns instantes e tente novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private pruneExpired(now = Date.now()) {
    for (const [key, entry] of this.buckets.entries()) {
      if (now >= entry.resetAt) {
        this.buckets.delete(key);
      }
    }
  }
}
