import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import { extname, join } from 'path';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { SolicitarReembolsoDto } from './dto/solicitar-reembolso.dto';
import { EfetivarReembolsoDto } from './dto/efetivar-reembolso.dto';
import { Admin } from '../auth/decorators/role.decorator';
import { Public } from '../auth/decorators/public.decorator';

const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]);

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  private getUserId(req: any): string {
    return req.user.id ?? req.user.sub;
  }

  @Post('upload-comprovante')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadComprovante(
    @UploadedFile()
    file?: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de comprovante enviado');
    }

    if (!ALLOWED_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        'Formato inválido. Envie PNG, JPG, WEBP ou PDF.',
      );
    }

    const ext =
      extname(file.originalname || '').toLowerCase() ||
      (file.mimetype === 'application/pdf' ? '.pdf' : '.png');
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const dir = join(process.cwd(), 'uploads', 'comprovantes');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(join(dir, filename), file.buffer);

    return {
      url: `/api/uploads/comprovantes/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
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

  @Admin()
  @Patch(':id/confirmar-pagamento')
  confirmarPagamento(@Req() req: any, @Param('id') id: string) {
    return this.pedidoService.confirmarPagamento(id, this.getUserId(req));
  }

  @Post(':id/solicitar-reembolso')
  solicitarReembolso(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SolicitarReembolsoDto,
  ) {
    const isAdmin = req.user?.role === 'admin';
    return this.pedidoService.solicitarReembolso(
      id,
      this.getUserId(req),
      isAdmin,
      dto,
    );
  }

  @Admin()
  @Patch(':id/reembolsar')
  efetivarReembolso(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: EfetivarReembolsoDto,
  ) {
    return this.pedidoService.efetivarReembolso(id, this.getUserId(req), dto);
  }
}
