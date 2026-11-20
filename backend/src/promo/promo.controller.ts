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
import { JwtService } from '@nestjs/jwt';
import { PromocaoService } from './promo.service';
import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
import { UpdateStatusPromocaoDto } from './dto/update-status-promocao.dto';
import { VincularProdutosPromocaoDto } from './dto/vincular-produtos-promocao.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { SimularDescontoDto } from './dto/simular-desconto.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';

@Controller('promocao')
export class PromocaoController {
  constructor(
    private readonly promocaoService: PromocaoService,
    private readonly jwtService: JwtService,
  ) {}

  private isAdminRequest(req: Request): boolean {
    if ((req as any)?.user?.role === 'admin') {
      return true;
    }

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        return payload?.role === 'admin';
      } catch {
        return false;
      }
    }

    return false;
  }

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
  @Post('cupons/validar')
  validarCupom(@Body() dto: ValidarCupomDto) {
    return this.promocaoService.validarCupom(dto);
  }

  @Public()
  @Post('calcular')
  simularDesconto(@Body() dto: SimularDescontoDto) {
    return this.promocaoService.simularDesconto(dto);
  }

  @Public()
  @Get()
  findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('tipoDesconto') tipoDesconto?: string,
    @Query('busca') busca?: string,
    @Query('apenasAtivas') apenasAtivas?: string,
    @Query('somenteCupons') somenteCupons?: string,
  ) {
    const isAdmin = this.isAdminRequest(req);
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
  findOne(@Req() req: Request, @Param('id') id: string) {
    const isAdmin = this.isAdminRequest(req);
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
