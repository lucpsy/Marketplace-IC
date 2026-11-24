import { Controller } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

// Rotas stub temporariamente desativadas até a implementação do módulo de notificações.
@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}
}
