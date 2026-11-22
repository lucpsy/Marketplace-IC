import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PagamentoService, PeriodoFiltro } from './pagamento.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { CreateRepasseDto } from './dto/create-repasse.dto';
import { UpdateStatusPagamentoDto } from './dto/update-status-pagamento.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';

@Controller('pagamento')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  private getUserId(req: any): string {
    return req.user.id ?? req.user.sub;
  }

  /* -------------------------------------------------------- TRANSPARÊNCIA PÚBLICA */

  @Public()
  @Get('transparencia/resumo')
  obterResumoTransparencia(
    @Query('periodo') periodo?: PeriodoFiltro,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.pagamentoService.obterResumoTransparencia({
      periodo,
      dataInicio,
      dataFim,
    });
  }

  @Public()
  @Get('transparencia/lancamentos')
  listarLancamentosPublicos(
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('metodo') metodo?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
    @Query('periodo') periodo?: PeriodoFiltro,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    return this.pagamentoService.listarLancamentosPublicos({
      tipo,
      categoria,
      metodo,
      status,
      busca,
      periodo,
      dataInicio,
      dataFim,
      pagina: pagina ? Number(pagina) : undefined,
      limite: limite ? Number(limite) : undefined,
    });
  }

  @Public()
  @Get('transparencia/evolucao')
  obterEvolucaoFinanceira(
    @Query('periodo') periodo?: PeriodoFiltro,
    @Query('agrupamento') agrupamento?: 'dia' | 'mes',
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.pagamentoService.obterEvolucaoFinanceira({
      periodo,
      agrupamento,
      dataInicio,
      dataFim,
    });
  }

  /* -------------------------------------------------------- PAINEL & GESTÃO ADMIN */

  @Admin()
  @Get('admin/painel')
  obterPainelAdmin(
    @Query('periodo') periodo?: PeriodoFiltro,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.pagamentoService.obterPainelAdmin({
      periodo,
      dataInicio,
      dataFim,
    });
  }

  @Admin()
  @Post('repasses')
  criarRepasse(@Body() dto: CreateRepasseDto) {
    return this.pagamentoService.criarRepasse(dto);
  }

  @Admin()
  @Post()
  create(@Body() dto: CreatePagamentoDto) {
    return this.pagamentoService.create(dto);
  }

  @Admin()
  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('metodo') metodo?: string,
    @Query('status') status?: string,
    @Query('idPedido') idPedido?: string,
    @Query('busca') busca?: string,
    @Query('periodo') periodo?: PeriodoFiltro,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('incluirInativos') incluirInativos?: string,
  ) {
    return this.pagamentoService.findAllAdmin({
      tipo,
      categoria,
      metodo,
      status,
      idPedido,
      busca,
      periodo,
      dataInicio,
      dataFim,
      incluirInativos: incluirInativos === 'true',
    });
  }

  /* -------------------------------------------------------- CONSULTAS POR PEDIDO / ID */

  @Get('pedido/:idPedido')
  findByPedido(@Req() req: any, @Param('idPedido') idPedido: string) {
    const isAdmin = req.user?.role === 'admin';
    return this.pagamentoService.findByPedido(
      idPedido,
      this.getUserId(req),
      isAdmin,
    );
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user?.role === 'admin';
    return this.pagamentoService.findOne(id, this.getUserId(req), isAdmin);
  }

  @Admin()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePagamentoDto) {
    return this.pagamentoService.update(id, dto);
  }

  @Admin()
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusPagamentoDto) {
    return this.pagamentoService.updateStatus(id, dto);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagamentoService.remove(id);
  }
}
