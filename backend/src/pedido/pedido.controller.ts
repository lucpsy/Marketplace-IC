import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { Admin } from '../auth/decorators/role.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  private getUserId(req: any): string {
    return req.user.id ?? req.user.sub;
  }

  @Public()
  @Get('status')
  listarStatus() {
    return this.pedidoService.listarStatus();
  }

  @Admin()
  @Get('status/:idStatus/transicoes')
  listarTransicoesPermitidas(@Param('idStatus') idStatus: string) {
    return this.pedidoService.listarTransicoesPermitidas(idStatus);
  }

  @Post()
  criarDoCarrinho(@Req() req: any, @Body() dto: CreatePedidoDto) {
    return this.pedidoService.criarDoCarrinho(this.getUserId(req), dto);
  }

  @Get('meus')
  findMeusPedidos(@Req() req: any) {
    return this.pedidoService.findMeusPedidos(this.getUserId(req));
  }

  @Admin()
  @Get()
  findAll(
    @Query('statusId') statusId?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    return this.pedidoService.findAll({ statusId, usuarioId });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user?.role === 'admin';
    return this.pedidoService.findOne(id, this.getUserId(req), isAdmin);
  }

  @Admin()
  @Patch(':id/status')
  atualizarStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusPedidoDto,
  ) {
    return this.pedidoService.atualizarStatus(id, dto, this.getUserId(req));
  }
}
