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
import { Request } from 'express';
import { PromocaoService } from './promo.service';
import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
import { UpdateStatusPromocaoDto } from './dto/update-status-promocao.dto';
import { VincularProdutosPromocaoDto } from './dto/vincular-produtos-promocao.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { SimularDescontoDto } from './dto/simular-desconto.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';
import { OptionalAuthService } from '../common/security/optional-auth.service';
import { RateLimit } from '../common/security/rate-limit.guard';

@Controller('promocao')
export class PromocaoController {
  constructor(
    private readonly promocaoService: PromocaoService,
    private readonly optionalAuth: OptionalAuthService,
  ) {}

  /* -------------------------------------------------------- ROTAS PÚBLICAS */

  @Public()
  @Get('ativas')
  findAtivas() {
    return this.promocaoService.findAtivas();
  }

  @Public()
  @Get('cupons/ativos')
  findCuponsAtivos() {
    return this.promocaoService.findCuponsAtivos();
  }

  @Public()
  @RateLimit(20, 60_000, 'validar-cupom')
  @Post('cupons/validar')
  validarCupom(@Body() dto: ValidarCupomDto) {
    return this.promocaoService.validarCupom(dto);
  }

  @Public()
  @RateLimit(30, 60_000, 'simular-desconto')
  @Post('calcular')
  simularDesconto(@Body() dto: SimularDescontoDto) {
    return this.promocaoService.simularDesconto(dto);
  }

  @Public()
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('tipoDesconto') tipoDesconto?: string,
    @Query('busca') busca?: string,
    @Query('apenasAtivas') apenasAtivas?: string,
    @Query('somenteCupons') somenteCupons?: string,
  ) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    const filtrarApenasAtivas = isAdmin
      ? apenasAtivas === 'true'
      : true;

    return this.promocaoService.findAll({
      status: isAdmin ? status : undefined,
      tipoDesconto,
      busca,
      apenasAtivas: filtrarApenasAtivas,
      somenteCupons: somenteCupons === 'true',
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    return this.promocaoService.findOne(id, !isAdmin);
  }

  /* -------------------------------------------------------- ROTAS ADMIN */

  @Admin()
  @Post()
  create(@Body() dto: CreatePromocaoDto) {
    return this.promocaoService.create(dto);
  }

  @Admin()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromocaoDto) {
    return this.promocaoService.update(id, dto);
  }

  @Admin()
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusPromocaoDto) {
    return this.promocaoService.updateStatus(id, dto);
  }

  @Admin()
  @Post(':id/produtos')
  vincularProdutos(
    @Param('id') id: string,
    @Body() dto: VincularProdutosPromocaoDto,
  ) {
    return this.promocaoService.vincularProdutos(id, dto);
  }

  @Admin()
  @Delete(':id/produtos/:idProduto')
  desvincularProduto(
    @Param('id') id: string,
    @Param('idProduto') idProduto: string,
  ) {
    return this.promocaoService.desvincularProduto(id, idProduto);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocaoService.remove(id);
  }
}
