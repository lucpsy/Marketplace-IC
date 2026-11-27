import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import {
  AuditoriaService,
  extrairIpRequisicao,
  sanitizarObjetoAuditoria,
} from './auditoria.service';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

interface EventoMapeado {
  acao: string;
  entidade: string;
  idRegistro?: string | null;
  usuarioId?: string | null;
  detalhes?: Record<string, any> | null;
}

function mapearMutacaoAuditoria(
  method: string,
  rawPath: string,
  req: any,
  resData: any,
): EventoMapeado | null {
  const path = rawPath.replace(/^\/api\/?/, '/');

  // Ignora operações transitórias de carrinho e simulações públicas de cupom/desconto
  if (
    path.startsWith('/carrinho') ||
    path === '/promocao/cupons/validar' ||
    path === '/promocao/calcular'
  ) {
    return null;
  }

  const userId = req?.user?.id ?? req?.user?.sub ?? null;
  const params = req?.params ?? {};
  const body =
    req?.body && typeof req.body === 'object'
      ? sanitizarObjetoAuditoria(req.body)
      : undefined;

  // --- AUTH ---
  if (method === 'POST' && /^\/auth\/login\/?$/i.test(path)) {
    const loggedUserId = resData?.user?.id ? String(resData.user.id) : userId;
    return {
      acao: 'LOGIN_SUCESSO',
      entidade: 'auth',
      usuarioId: loggedUserId,
      idRegistro: loggedUserId,
      detalhes: {
        email: resData?.user?.email ?? body?.email,
        cargo: resData?.user?.cargo,
      },
    };
  }

  if (method === 'POST' && /^\/auth\/register\/?$/i.test(path)) {
    return {
      acao: 'CADASTRO_CONTA',
      entidade: 'auth',
      detalhes: {
        nome: body?.nome,
        email: body?.email,
      },
    };
  }

  if (method === 'POST' && /^\/auth\/logout\/?$/i.test(path)) {
    if (!userId) return null;
    return {
      acao: 'LOGOUT',
      entidade: 'auth',
      usuarioId: userId,
      idRegistro: userId,
    };
  }

  // --- USUÁRIO ---
  if (path === '/usuario/profile' && method === 'PATCH') {
    const alterouSenha = Boolean(req?.body?.senha);
    return {
      acao: alterouSenha ? 'PERFIL_SENHA_ALTERADA' : 'PERFIL_ATUALIZADO',
      entidade: 'usuario',
      usuarioId: userId,
      idRegistro: userId,
      detalhes: body,
    };
  }

  if (path.startsWith('/usuario/')) {
    const alvoId = params.id ?? path.split('/')[2];
    if (method === 'DELETE') {
      return {
        acao: 'USUARIO_DESATIVADO',
        entidade: 'usuario',
        usuarioId: userId,
        idRegistro: alvoId,
      };
    }
    if (method === 'PATCH') {
      const acao = req?.body?.cargo
        ? 'USUARIO_CARGO_ALTERADO'
        : req?.body?.status
          ? req.body.status === 'ativo'
            ? 'USUARIO_REATIVADO'
            : 'USUARIO_DESATIVADO'
          : 'USUARIO_ATUALIZADO';
      return {
        acao,
        entidade: 'usuario',
        usuarioId: userId,
        idRegistro: alvoId,
        detalhes: body,
      };
    }
  }

  // --- PEDIDO ---
  if (path.startsWith('/pedido')) {
    if (method === 'POST' && path === '/pedido/upload-comprovante') {
      return {
        acao: 'UPLOAD_COMPROVANTE',
        entidade: 'pedido',
        usuarioId: userId,
        detalhes: {
          filename: resData?.filename,
          mimetype: resData?.mimetype,
          size: resData?.size,
        },
      };
    }
    if (method === 'PATCH' && path === '/pedido/prazo-compras') {
      return {
        acao: 'PRAZO_COMPRAS_ALTERADO',
        entidade: 'pedido',
        usuarioId: userId,
        detalhes: {
          offerDeadline: body?.offerDeadline || 'encerrado',
        },
      };
    }
    if (method === 'POST' && path === '/pedido') {
      return {
        acao: 'PEDIDO_CRIADO',
        entidade: 'pedido',
        usuarioId: userId,
        idRegistro: resData?.idPedido,
        detalhes: {
          valorTotal: resData?.valorTotal,
          metodoPagamento: body?.metodoPagamento,
          codigoCupom: body?.codigoCupom,
        },
      };
    }
    if (method === 'PATCH' && path.endsWith('/confirmar-pagamento')) {
      return {
        acao: 'PAGAMENTO_PEDIDO_CONFIRMADO',
        entidade: 'pedido',
        usuarioId: userId,
        idRegistro: params.id,
      };
    }
    if (method === 'PATCH' && path.endsWith('/status')) {
      return {
        acao: 'PEDIDO_STATUS_ALTERADO',
        entidade: 'pedido',
        usuarioId: userId,
        idRegistro: params.id,
        detalhes: { nomeStatus: body?.nomeStatus },
      };
    }
    if (method === 'POST' && path.endsWith('/solicitar-reembolso')) {
      return {
        acao: 'REEMBOLSO_SOLICITADO',
        entidade: 'pedido',
        usuarioId: userId,
        idRegistro: params.id,
        detalhes: body,
      };
    }
    if (method === 'PATCH' && path.endsWith('/reembolsar')) {
      return {
        acao: 'REEMBOLSO_EFETIVADO',
        entidade: 'pedido',
        usuarioId: userId,
        idRegistro: params.id,
        detalhes: body,
      };
    }
  }

  // --- PAGAMENTO / TRANSPARÊNCIA ---
  if (path.startsWith('/pagamento')) {
    if (method === 'POST' && path === '/pagamento/repasses') {
      return {
        acao: 'REPASSE_CRIADO',
        entidade: 'pagamento',
        usuarioId: userId,
        idRegistro: resData?.idPagamento,
        detalhes: body,
      };
    }
    if (method === 'POST') {
      return {
        acao: 'LANCAMENTO_CRIADO',
        entidade: 'pagamento',
        usuarioId: userId,
        idRegistro: resData?.idPagamento,
        detalhes: body,
      };
    }
    if (method === 'PATCH') {
      return {
        acao: 'LANCAMENTO_ATUALIZADO',
        entidade: 'pagamento',
        usuarioId: userId,
        idRegistro: params.id,
        detalhes: body,
      };
    }
    if (method === 'DELETE') {
      return {
        acao: 'LANCAMENTO_REMOVIDO',
        entidade: 'pagamento',
        usuarioId: userId,
        idRegistro: params.id,
      };
    }
  }

  // --- CATÁLOGO ---
  if (path.startsWith('/catalogo')) {
    if (method === 'POST' && path.includes('/upload-imagem')) {
      return {
        acao: 'UPLOAD_IMAGEM_PRODUTO',
        entidade: 'catalogo',
        usuarioId: userId,
        detalhes: {
          filename: resData?.filename,
          size: resData?.size,
        },
      };
    }
    if (path.includes('/categorias')) {
      const acao =
        method === 'POST'
          ? 'CATEGORIA_CRIADA'
          : method === 'DELETE'
            ? 'CATEGORIA_REMOVIDA'
            : 'CATEGORIA_ATUALIZADA';
      return {
        acao,
        entidade: 'catalogo',
        usuarioId: userId,
        idRegistro: params.id ?? resData?.idCategoria,
        detalhes: body,
      };
    }
    const acao =
      method === 'POST'
        ? 'PRODUTO_CRIADO'
        : method === 'DELETE'
          ? 'PRODUTO_REMOVIDO'
          : 'PRODUTO_ATUALIZADO';
    return {
      acao,
      entidade: 'catalogo',
      usuarioId: userId,
      idRegistro: params.id ?? resData?.idProduto,
      detalhes: body ? { nome: body.nome, precoVenda: body.precoVenda, estoque: body.estoque } : undefined,
    };
  }

  // --- FORNECEDOR ---
  if (path.startsWith('/fornecedor')) {
    const acao =
      method === 'POST'
        ? 'FORNECEDOR_CRIADO'
        : method === 'DELETE'
          ? 'FORNECEDOR_REMOVIDO'
          : 'FORNECEDOR_ATUALIZADO';
    return {
      acao,
      entidade: 'fornecedor',
      usuarioId: userId,
      idRegistro: params.id ?? resData?.idFornecedor,
      detalhes: body,
    };
  }

  // --- PROMOÇÃO / CUPOM ---
  if (path.startsWith('/promocao')) {
    const acao =
      method === 'POST'
        ? 'PROMOCAO_CRIADA'
        : method === 'DELETE'
          ? 'PROMOCAO_REMOVIDA'
          : 'PROMOCAO_ATUALIZADA';
    return {
      acao,
      entidade: 'promocao',
      usuarioId: userId,
      idRegistro: params.id ?? resData?.idPromocao,
      detalhes: body,
    };
  }

  return {
    acao: `${method}_${path.replace(/^\//, '').replace(/\//g, '_').toUpperCase()}`.slice(0, 100),
    entidade: path.split('/')[1] || 'sistema',
    usuarioId: userId,
    idRegistro: params.id,
    detalhes: body,
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const method = String(req?.method || 'GET').toUpperCase();

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const rawPath = String(req?.originalUrl || req?.url || '/').split('?')[0];
    const ip = extrairIpRequisicao(req);

    return next.handle().pipe(
      tap((resData) => {
        if (req?.__auditSkip) return;
        const evento = mapearMutacaoAuditoria(method, rawPath, req, resData);
        if (!evento) return;

        void this.auditoriaService.registrar({
          usuarioId: evento.usuarioId,
          acao: evento.acao,
          entidade: evento.entidade,
          idRegistro: evento.idRegistro,
          detalhes: evento.detalhes,
          ip,
        });
      }),
    );
  }
}
