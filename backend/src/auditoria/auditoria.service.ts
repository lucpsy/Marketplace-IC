import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/log_auditoria.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

const SENSITIVE_KEYS = new Set([
  'senha',
  'senhaantiga',
  'senhahash',
  'password',
  'token',
  'access_token',
  'refreshtoken',
  'cookie',
  'authorization',
  'dados',
  'buffer',
]);

export interface RegistrarAuditoriaInput {
  usuarioId?: string | number | null;
  acao: string;
  entidade: string;
  idRegistro?: string | number | null;
  detalhes?: Record<string, any> | string | null;
  ip?: string | null;
}

export interface FiltroAuditoria {
  busca?: string;
  acao?: string;
  entidade?: string;
  usuarioId?: string;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  limite?: number;
}

export function sanitizarObjetoAuditoria(valor: any, depth = 0): any {
  if (valor === null || valor === undefined) return undefined;
  if (depth > 4) return '[truncado]';

  if (Buffer.isBuffer(valor)) {
    return `[Buffer ${valor.length} bytes]`;
  }

  if (Array.isArray(valor)) {
    return valor.slice(0, 20).map((item) => sanitizarObjetoAuditoria(item, depth + 1));
  }

  if (typeof valor === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(valor)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '[REDACTED]';
      } else {
        const clean = sanitizarObjetoAuditoria(v, depth + 1);
        if (clean !== undefined) {
          out[k] = clean;
        }
      }
    }
    return out;
  }

  if (typeof valor === 'string' && valor.length > 500) {
    return `${valor.slice(0, 500)}...`;
  }

  return valor;
}

export function extrairIpRequisicao(req: any): string | null {
  const raw = String(
    req?.ip || req?.socket?.remoteAddress || req?.connection?.remoteAddress || '',
  )
    .replace(/^::ffff:/, '')
    .trim();
  if (!raw) return null;
  return raw.slice(0, 45);
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  async registrar(input: RegistrarAuditoriaInput): Promise<void> {
    try {
      const usuarioIdStr =
        input.usuarioId !== undefined && input.usuarioId !== null
          ? String(input.usuarioId).trim()
          : '';
      const idRegistroStr =
        input.idRegistro !== undefined && input.idRegistro !== null
          ? String(input.idRegistro).trim()
          : '';

      const usuarioValido = /^\d+$/.test(usuarioIdStr)
        ? ({ idUsuario: usuarioIdStr } as Usuario)
        : null;

      const idRegistroValido = /^\d+$/.test(idRegistroStr)
        ? idRegistroStr
        : null;

      let detalhesFinal: string | null = null;
      if (typeof input.detalhes === 'string') {
        detalhesFinal = input.detalhes.slice(0, 4000);
      } else if (input.detalhes && typeof input.detalhes === 'object') {
        const sanitizado = sanitizarObjetoAuditoria(input.detalhes);
        if (sanitizado && Object.keys(sanitizado).length > 0) {
          detalhesFinal = JSON.stringify(sanitizado).slice(0, 4000);
        }
      }

      const registro = this.auditoriaRepo.create({
        usuario: usuarioValido,
        acao: String(input.acao || 'ACAO_SISTEMA').slice(0, 100),
        entidade: String(input.entidade || 'sistema').slice(0, 100),
        idRegistro: idRegistroValido,
        detalhes: detalhesFinal,
        ip: input.ip ? String(input.ip).slice(0, 45) : null,
      });

      await this.auditoriaRepo.save(registro);
    } catch (err) {
      console.error('[Auditoria] Falha ao gravar log de auditoria:', err);
    }
  }

  async listar(filtros?: FiltroAuditoria) {
    const pagina = Math.max(1, Number(filtros?.pagina || 1));
    const limite = Math.min(200, Math.max(1, Number(filtros?.limite || 50)));
    const skip = (pagina - 1) * limite;

    const qb = this.auditoriaRepo
      .createQueryBuilder('log')
      .leftJoin('log.usuario', 'usuario')
      .addSelect([
        'usuario.idUsuario',
        'usuario.nome',
        'usuario.email',
        'usuario.cargo',
      ])
      .orderBy('log.dataRegistro', 'DESC')
      .addOrderBy('log.idLog', 'DESC');

    if (filtros?.entidade) {
      qb.andWhere('LOWER(log.entidade) = LOWER(:entidade)', {
        entidade: filtros.entidade.trim(),
      });
    }

    if (filtros?.acao) {
      qb.andWhere('LOWER(log.acao) LIKE LOWER(:acao)', {
        acao: `%${filtros.acao.trim()}%`,
      });
    }

    if (filtros?.usuarioId && /^\d+$/.test(filtros.usuarioId.trim())) {
      qb.andWhere('usuario.idUsuario = :usuarioId', {
        usuarioId: filtros.usuarioId.trim(),
      });
    }

    if (filtros?.dataInicio) {
      const dtInicio = new Date(filtros.dataInicio);
      if (!Number.isNaN(dtInicio.getTime())) {
        qb.andWhere('log.dataRegistro >= :dtInicio', { dtInicio });
      }
    }

    if (filtros?.dataFim) {
      const dtFim = new Date(filtros.dataFim);
      if (!Number.isNaN(dtFim.getTime())) {
        qb.andWhere('log.dataRegistro <= :dtFim', { dtFim });
      }
    }

    if (filtros?.busca?.trim()) {
      const termo = `%${filtros.busca.trim()}%`;
      qb.andWhere(
        `(
          LOWER(log.acao) LIKE LOWER(:termo)
          OR LOWER(log.entidade) LIKE LOWER(:termo)
          OR LOWER(COALESCE(log.detalhes, '')) LIKE LOWER(:termo)
          OR LOWER(COALESCE(log.ip, '')) LIKE LOWER(:termo)
          OR LOWER(COALESCE(usuario.nome, '')) LIKE LOWER(:termo)
          OR LOWER(COALESCE(usuario.email, '')) LIKE LOWER(:termo)
        )`,
        { termo },
      );
    }

    const [dados, total] = await qb.skip(skip).take(limite).getManyAndCount();

    return {
      dados,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite)),
      },
    };
  }
}
