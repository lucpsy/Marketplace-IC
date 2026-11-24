import { Controller } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

// Rotas stub temporariamente desativadas até a implementação do módulo de auditoria.
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}
}
