import { Controller, Get, Query } from '@nestjs/common';
import { Admin } from '../auth/decorators/role.decorator';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Admin()
  @Get()
  listar(
    @Query('busca') busca?: string,
    @Query('acao') acao?: string,
    @Query('entidade') entidade?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.auditoriaService.listar({
      busca,
      acao,
      entidade,
      usuarioId,
      dataInicio,
      dataFim,
      pagina: pagina ? Number(pagina) : undefined,
      limite: limite ? Number(limite) : undefined,
    });
  }
}
